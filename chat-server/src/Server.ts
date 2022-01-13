/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";

import express, { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import "express-async-errors";
import { v4 as uuidv4 } from "uuid";
const jwtScope = require("express-jwt-scope");
const jwk = require("express-jwt-jwks");
import axios, { AxiosRequestConfig } from "axios";

import BaseRouter from "./routes";
import logger from "@shared/Logger";

const app = express();
const { BAD_REQUEST } = StatusCodes;

app.set("view engine", "ejs");

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Security
if (process.env.NODE_ENV === "production") {
    app.use(helmet());
}

// Add APIs
app.use("/api", BaseRouter);

// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.err(err, true);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});

const SECURE = jwk({
    jwks: "http://localhost:8080/.wellknown/jwks.json",
});

/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

app.get('/health', (_req, res) => {
    res.send('OK!');
})

app.get("/chat", (req, res) => {
    res.removeHeader("X-Frame-Options");
    const query = req.query || req.body;
    if (query) {
        let cookieUid = req.cookies ? req.cookies["uid"] : null;
        cookieUid = cookieUid && cookieUid !== "" ? cookieUid : null;
        const defaultUid = uuidv4().substring(0, 8);
        const userInfo = {
            shuntId: query.si,
            // 如果没有传递 uid 就自动生成一个
            uid: query.uid ?? cookieUid ?? `guest_${defaultUid}`,
            staffId: query.staffId,
            groupid: query.groupId,
            robotShuntSwitch: query.robotShuntSwitch,
            name: query.name ?? `客户_${defaultUid}`,
            email: query.email,
            mobile: query.mobile,
            vipLevel: query.vipLevel,
            title: query.title,
            referrer: query.referrer,
            commentView: query.cv,
        };

        // 设置生成的 uid cookie 最后一次访问的一周内有效
        res.cookie("uid", userInfo.uid, {
            expires: new Date(Date.now() + 7 * 24 * 3600 * 1000),
            httpOnly: true,
        });
        res.render("chat", { userInfo: userInfo });
    } else {
        res.status(404).send("Sorry, cant find that");
    }
});

const elasticsearchUrl = "http://192.168.50.104:9200";
const kibanaUrl = "http://192.168.50.110:5601";

/**
 * 根据 机构ID 初始化机构角色、机构用户
 * 调用 API 创建 机构角色、机构用户用于获取 Kibana 统计报表
 * TODO: 先使用手动建立
 */
app.post("/admin/kibana/org/init", SECURE, jwtScope("admin"), async (req, res) => {
    const { orgId } = req.query;
    const organizationId = orgId as string;
    const roleName = `cs_viewer_${organizationId}`;
    const userName = `cs_viewer_${organizationId}`;
    const password = uuidv4().substring(0, 10);
    const createRoleParam = {
        elasticsearch: {
            cluster: [],
            indices: [
                {
                    names: [
                        `message_conv-${organizationId}`,
                        `staff_attendance-${organizationId}`,
                        `conversation_statistics-${organizationId}`,
                    ],
                    privileges: ["read"],
                },
            ],
            run_as: [],
        },
        kibana: [
            { spaces: ["default"], base: [], feature: { dashboard: ["read"] } },
        ],
    };

    const createUserParam = {
        password: `${password}`,
        roles: [`${roleName}`],
        metadata: {
            intelligence: 7,
        },
    };

    const authConfig: AxiosRequestConfig = {
        auth: {
            username: 'elastic',
            password: 'coldyeah',
        },
        headers: {
            'kbn-xsrf': true,
        }
    };

    await axios.put(
        `${kibanaUrl}/api/security/role/${roleName}`,
        createRoleParam,
        authConfig
    );

    await axios.post(
        `${elasticsearchUrl}/_security/user/${userName}`,
        createUserParam,
        authConfig
    );

    // 读取 es 导出的配置
    const { data: exportJson } = await axios.post<string>(
        `${kibanaUrl}/api/saved_objects/_export`,
        {
            "objects": [
                {
                    "id": "b49fb5f0-525b-11ec-a3fb-7badbe8fcf22",
                    "type": "dashboard"
                }
            ],
            "includeReferencesDeep": true
        },
        authConfig
    )

    if (exportJson) {
        const newNdjson = exportJson
            .replace(/^.*"type":"tag".*$/mg, '') // 删除Tag
            .replaceAll("message_conv", `message_conv-${organizationId}`)
            .replaceAll("客服系统基础仪表盘", `客服系统仪表盘-${organizationId}`);
        const blob = new Blob([newNdjson], {
            type: "application/json",
        });

        const data = new FormData();
        data.append("file", blob, "file.ndjson");
        const result = await axios({
            method: "post",
            url: `${kibanaUrl}/api/saved_objects/_import?createNewCopies=true`,
            data: data,
            auth: authConfig.auth,
        });
        const newDashboardId: string = result.data.successResults
            .filter((it: { type: string }) => it.type === "dashboard")
            .map((it: { destinationId: string }) => it.destinationId)[0];

        const dashboardUrl = `${kibanaUrl}/app/dashboards#/view/${newDashboardId}?embed=true&` +
            `_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2C` +
            `time%3A(from%3Anow%2Fd%2Cto%3Anow%2Fd))` +
            `&show-query-input=true&show-time-filter=true`;

        res.json({
            organizationId: organizationId,
            kibanaUsername: userName,
            kibanaPassword: password,
            kibanaUrl: dashboardUrl,
        });
    }

});

app.get("*", (req: Request, res: Response) => {
    res.sendFile("index.html", { root: viewsDir });
});

// Export express instance
export default app;
