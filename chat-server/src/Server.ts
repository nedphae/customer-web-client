import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';
import { v4 as uuidv4 } from 'uuid';

import BaseRouter from './routes';
import logger from '@shared/Logger';

const app = express();
const { BAD_REQUEST } = StatusCodes;

app.set('view engine', 'ejs');

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.err(err, true);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});



/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

app.get('/chat', (req, res) => {
    res.removeHeader("X-Frame-Options");
    const query = req.query || req.body
    if (query) {
        let cookieUid = req.cookies ? req.cookies['uid'] : null;
        cookieUid = cookieUid && cookieUid !== '' ? cookieUid : null;
        const defaultUid = uuidv4().substr(0, 8);
        const userInfo = {
            shuntId: query.shuntId,
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
        }

        // 设置生成的 uid cookie 最后一次访问的一周内有效
        res.cookie('uid', userInfo.uid, {
            expires:
                new Date(Date.now() + 7 * 24 * 3600 * 1000), httpOnly: true
        });
        res.render('chat', { userInfo: userInfo });
    } else {
        res.status(404).send('Not found');
    }
});

const elasticsearchUrl = 'http://192.168.50.104:9200';
const kibanaUrl = 'http://192.168.50.110:5601';

/**
 * 根据 机构ID
 * 调用 API 创建 机构角色、机构用户用于获取 Kibana 统计报表
 * TODO: 先使用手动建立
 */
app.get('/kibana', (req, res) => {
    const { organizationId } = req.query;
    const roleName = `cs_viewer_${organizationId}`
    const messageConvIndexPatternParam = {
        "index_pattern": {
            "title": `message-conv-${organizationId}`,
            "fieldFormatMap": "{\"closeReason\":{\"id\":\"static_lookup\",\"params\":{\"lookupEntries\":[{\"key\":\"sys\",\"value\":\"系统\"}]}}}",
            "fields": {
                "id": {
                    "customLabel": "ID"
                },
                "fromShuntId": {
                    "customLabel": "分流组id"
                },
                "fromShuntName": {
                    "customLabel": "分流组名称"
                },
                "fromGroupId": {
                    "customLabel": "客服组id"
                },
                "fromGroupName": {
                    "customLabel": "客服组名称"
                },
                "fromIp": {
                    "customLabel": "访客来源IP"
                },
                "fromPage": {
                    "customLabel": "来源页"
                },
                "fromTitle": {
                    "customLabel": "来源页标题"
                },
                "fromType": {
                    "customLabel": "来源类型"
                },
                "inQueueTime": {
                    "customLabel": "列队时间"
                },
                "interaction": {
                    "customLabel": "分流组名称"
                },
                "convType": {
                    "customLabel": "会话类型"
                },
                "staffId": {
                    "customLabel": "客服id"
                },
                "realName": {
                    "customLabel": "客服实名"
                },
                "nickName": {
                    "customLabel": "客服昵称"
                },
                "startTime": {
                    "customLabel": "会话开始时间"
                },
                "userId": {
                    "customLabel": "客户id"
                },
                "userName": {
                    "customLabel": "客户名称"
                },
                "vipLevel": {
                    "customLabel": "vip 层级"
                },
                "visitRange": {
                    "customLabel": "与上一次来访的时间差"
                },
                "transferType": {
                    "customLabel": "转人工类型"
                },
                "humanTransferSessionId": {
                    "customLabel": "转接来源的会话id"
                },
                "transferFromStaffName": {
                    "customLabel": "转接来源分流客服名称"
                },
                "transferFromGroup": {
                    "customLabel": "转接来源分流客服组名称"
                },
                "transferRemarks": {
                    "customLabel": "转接来源备注"
                },
                "isStaffInvited": {
                    "customLabel": "客服是否邀请会话"
                },
                "beginner": {
                    "customLabel": "会话发起方"
                },
                "relatedId": {
                    "customLabel": "关联会话id"
                },
                "relatedType": {
                    "customLabel": "关联会话类型"
                },
                "category": {
                    "customLabel": "会话分类信息"
                },
                "categoryDetail": {
                    "customLabel": "会话咨询分类明细"
                },
                "closeReason": {
                    "customLabel": "会话关闭原因"
                },
                "endTime": {
                    "customLabel": "结束时间"
                },
                "evaluate": {
                    "customLabel": "用户评价内容"
                },
                "staffFirstReplyTime": {
                    "customLabel": "客服首次响应的时间"
                },
                "firstReplyCost": {
                    "customLabel": "客服首次响应时长"
                },
                "stickDuration": {
                    "customLabel": "置顶时长"
                },
                "remarks": {
                    "customLabel": "会话备注"
                },
                "status": {
                    "customLabel": "客服标记的解决状态"
                },
                "roundNumber": {
                    "customLabel": "对话回合数"
                },
                "clientFirstMessageTime": {
                    "customLabel": "访客首条消息时间"
                },
                "avgRespDuration": {
                    "customLabel": "客服平均响应时长"
                },
                "isValid": {
                    "customLabel": "是否有效会话"
                },
                "staffMessageCount": {
                    "customLabel": "客服消息数"
                },
                "userMessageCount": {
                    "customLabel": "用户消息数"
                },
                "totalMessageCount": {
                    "customLabel": "总消息数"
                },
                "treatedTime": {
                    "customLabel": "留言处理时间"
                },
                "isEvaluationInvited": {
                    "customLabel": "客服是否邀评"
                },
                "terminator": {
                    "customLabel": "会话中止方"
                },
            },
        }
    };
    const createRoleParam = {
        "elasticsearch": {
            "cluster": [],
            "indices": [
                { "names": [`message-conv-${organizationId}`, `staff-attendance-${organizationId}`], "privileges": ["read"] }
            ],
            "run_as": []
        },
        "kibana": [
            { "spaces": ["dashboard-viewer"], "base": [], "feature": { "dashboard": ["read"] } }
        ]
    };

});

app.get('*', (req: Request, res: Response) => {
    res.sendFile('index.html', { root: viewsDir });
});

// Export express instance
export default app;
