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
    if (query && query.sc) {
        let cookieUid = req.cookies ? req.cookies["uid"] : null;
        cookieUid = cookieUid && cookieUid !== "" ? cookieUid : null;
        const defaultUid = uuidv4().substring(0, 8);
        const userInfo = {
            shuntCode: query.sc,
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

app.get("*", (req: Request, res: Response) => {
    res.sendFile("index.html", { root: viewsDir });
});

// Export express instance
export default app;
