import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { HttpErrorFilter } from './http-error.filter.js';

describe('HttpErrorFilter', () => {
  const filter = new HttpErrorFilter();
  let response: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
  let request: Partial<Request>;
  let host: ArgumentsHost;

  beforeEach(() => {
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    request = { method: 'GET', path: '/courses/999' };
    host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
  });

  it('returns a consistent public shape for expected HTTP exceptions', () => {
    filter.catch(
      new HttpException('Course not found', HttpStatus.NOT_FOUND),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      path: '/courses/999',
      timestamp: expect.any(String),
      message: 'Course not found',
    });
  });

  it('does not expose unexpected internal exception details', () => {
    const loggerSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    filter.catch(new Error('SQL password and query detail'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: '/courses/999',
      timestamp: expect.any(String),
      message: 'Internal server error',
    });
    expect(JSON.stringify(response.json.mock.calls[0])).not.toContain(
      'SQL password and query detail',
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      'Unhandled Error for GET /courses/999',
      expect.stringContaining('SQL password and query detail'),
    );

    loggerSpy.mockRestore();
  });

  it('preserves validation message arrays in the public response', () => {
    filter.catch(
      new HttpException(
        { statusCode: 400, message: ['title must not be empty'], error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      ),
      host,
    );

    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      path: '/courses/999',
      timestamp: expect.any(String),
      message: ['title must not be empty'],
    });
  });
});
