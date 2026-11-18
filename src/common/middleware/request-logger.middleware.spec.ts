import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { RequestLoggerMiddleware } from './request-logger.middleware.js';

describe('RequestLoggerMiddleware', () => {
  it('registers on arbitrary application routes', async () => {
    @Module({ providers: [RequestLoggerMiddleware] })
    class MiddlewareTestModule implements NestModule {
      configure(consumer: MiddlewareConsumer): void {
        consumer
          .apply(RequestLoggerMiddleware)
          .forRoutes({ path: '{*path}', method: RequestMethod.ALL });
      }
    }

    const app = await NestFactory.create(MiddlewareTestModule, {
      logger: false,
    });
    await app.init();

    try {
      await request(app.getHttpServer())
        .get('/health/check')
        .expect(404);
    } finally {
      await app.close();
    }
  });

  it('logs only method, path, status and duration after the response finishes', () => {
    const loggerSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    let finishHandler: (() => void) | undefined;
    const response = {
      statusCode: 200,
      once: vi.fn((_event: string, handler: () => void) => {
        finishHandler = handler;
      }),
    };
    const request = {
      method: 'POST',
      path: '/auth/login',
      headers: { authorization: 'sensitive-token' },
      body: { password: 'sensitive-password' },
    };
    const next = vi.fn();
    const middleware = new RequestLoggerMiddleware();

    middleware.use(
      request as unknown as Request,
      response as unknown as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(response.once).toHaveBeenCalledWith(
      'finish',
      expect.any(Function),
    );
    finishHandler?.();

    const loggedMessage = String(loggerSpy.mock.calls[0]?.[0]);
    expect(loggedMessage).toContain('"method":"POST"');
    expect(loggedMessage).toContain('"path":"/auth/login"');
    expect(loggedMessage).toContain('"status":200');
    expect(loggedMessage).toContain('"durationMs"');
    expect(loggedMessage).not.toContain('sensitive-token');
    expect(loggedMessage).not.toContain('sensitive-password');

    loggerSpy.mockRestore();
  });
});
