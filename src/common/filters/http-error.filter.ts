import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type PublicErrorMessage = string | string[];

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      const errorName =
        exception instanceof Error ? exception.name : 'UnknownException';
      this.logger.error(
        `Unhandled ${errorName} for ${request.method} ${request.path}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const message = this.getPublicMessage(exception, statusCode);
    response.status(statusCode).json({
      statusCode,
      path: request.path,
      timestamp: new Date().toISOString(),
      message,
    });
  }

  private getPublicMessage(
    exception: unknown,
    statusCode: number,
  ): PublicErrorMessage {
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Internal server error';
    }

    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const { message } = exceptionResponse;
      if (
        typeof message === 'string' ||
        (Array.isArray(message) &&
          message.every((item) => typeof item === 'string'))
      ) {
        return message;
      }
    }

    return exception.message;
  }
}
