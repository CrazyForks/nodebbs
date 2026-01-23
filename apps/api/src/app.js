'use strict';

import Fastify from 'fastify';
import server from './server.js';
import env from './config/env.js';

const logger = {
  level: env.isDev ? 'debug' : 'info',
  transport: env.isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          singleLine: false,
        },
      }
    : undefined,
};

const app = Fastify({
  logger,
  disableRequestLogging: true, // 禁用默认的请求日志
  trustProxy: true,
});

app.register(server);

app.listen(
  { port: env.app.port, host: env.app.host },
  (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`服务启动成功，访问地址: ${address}`);
  }
);
