/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
const Consul = require('consul');
import { networkInterfaces } from 'os';
import { v4 as uuidv4 } from "uuid";

const serviceName = 'chat-server';
const consul = new Consul({
    host: '192.168.50.108',
    port: "80",
    promisify: true,
});

// Start the server
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
    (function () {
        logger.info('注册服务: ' + port);
        const temp = Object.values(networkInterfaces());
        const ipAddress = temp.flatMap((netArr) => netArr?.map((net) => net.address))
            .filter((ip) => ip?.startsWith('192'))[0];
        if (ipAddress) {
            consul.agent.service.register({
                id: `${serviceName}-${uuidv4().substring(0, 8)}`,
                name: serviceName,
                address: ipAddress,
                port: port,
                check: {
                    http: `http://${ipAddress}:${port}/health`,
                    interval: '10s',
                    ttl: '5s',
                    deregistercriticalserviceafter: '15s',
                }
            }, function (err: any, result: any) {
                if (err) {
                    logger.err(err);
                } else {
                    logger.info(serviceName + ' 注册成功!');
                }
                if (result) {
                    logger.info(result);
                }
            });
        }
    })()

});
process.on('SIGTERM', () => {
    logger.info('退出服务');
    consul.agent.service.deregister(serviceName);
    server.close(() => {
        logger.info('HTTP server closed')
    })
});
