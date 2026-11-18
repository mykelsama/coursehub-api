import {
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';
import { TimingInterceptor } from './timing.interceptor.js';

describe('TimingInterceptor', () => {
  const interceptor = new TimingInterceptor();
  const response = { setHeader: vi.fn() };
  const context = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds elapsed time to the response without changing its body', async () => {
    const handler = { handle: () => of({ ok: true }) } as CallHandler;

    await expect(
      firstValueFrom(interceptor.intercept(context, handler)),
    ).resolves.toEqual({ ok: true });

    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Response-Time',
      expect.stringMatching(/^\d+ms$/),
    );
  });

  it('does not swallow handler errors', async () => {
    const error = new Error('handler failure');
    const handler = {
      handle: () => throwError(() => error),
    } as CallHandler;

    await expect(
      firstValueFrom(interceptor.intercept(context, handler)),
    ).rejects.toBe(error);
    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Response-Time',
      expect.stringMatching(/^\d+ms$/),
    );
  });
});
