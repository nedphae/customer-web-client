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

app.get('/chat', (req, res) => {
    const query = req.query
    let cookieUid = req.cookies['uid'];
    cookieUid = cookieUid || cookieUid !== '' ? cookieUid : null;
    const defaultUid = uuidv4().substr(0, 8);
    const userInfo = {
        shuntId: query.shuntId,
        title: query.title,
        referrer: query.referrer,
        // 如果没有传递 uid 就自动生成一个
        uid: query.uid ?? cookieUid ?? defaultUid,
        staffid: query.staffid,
        groupid: query.groupid,
        robotShuntSwitch: query.robotShuntSwitch,
        name: query.name ?? `客户_${defaultUid}`,
        email: query.email,
        mobile: query.mobile,
        vipLevel: query.vipLevel,
    }

    // 设置生成的 uid cookie 最后一次访问的一周内有效
    res.cookie('uid', userInfo.uid, { expires: new Date(Date.now() + 7 * 24 * 3600), httpOnly: true });
    res.render('index', { userInfo: userInfo });
});


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
app.get('*', (req: Request, res: Response) => {
    res.sendFile('index.html', { root: viewsDir });
});

// Export express instance
export default app;
