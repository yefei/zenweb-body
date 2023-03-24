import * as httpError from 'http-errors';
import * as zlib from 'zlib';
import { Readable } from 'stream';
import { Context } from '@zenweb/core';

/**
 * 内容读取流
 * @param ctx 
 * @param inflate 是否启用解压缩支持
 */
export function streamReader(ctx: Context, limit?: number, inflate = true) {
  // 长度检查
  const length = ctx.request.length;
  if (limit && length && length > limit) {
    throw httpError(413, 'request entity too large', {
      expected: length,
      length: length,
      limit: limit,
      type: 'entity.too.large',
    })
  }

  // 内容格式检查
  const encoding = (ctx.get('content-encoding') || 'identity').toLowerCase();
  if (inflate === false && encoding !== 'identity') {
    throw httpError(415, 'content encoding unsupported', {
      encoding: encoding,
      type: 'encoding.unsupported',
    });
  }

  let stream: Readable & { length?: number };
  const req = ctx.req;

  if (encoding === 'identity') {
    stream = req;
    stream.length = length;
  } else if (encoding === 'deflate') {
    let s = zlib.createInflate();
    req.pipe(s);
    stream = s;
  } else if (encoding === 'gzip') {
    let s = zlib.createGunzip();
    req.pipe(s);
    stream = s;
  } else {
    throw httpError(415, 'unsupported content encoding "' + encoding + '"', {
      encoding: encoding,
      type: 'encoding.unsupported',
    });
  }

  if (!stream.readable) {
    throw httpError(500, 'stream is not readable', {
      type: 'stream.not.readable',
    });
  }

  return new Promise<Buffer>((resolve, reject) => {
    let complete = false;
    let received = 0;
    const buffer: Uint8Array[] = [];

    function onAborted() {
      if (complete) return;
      done(httpError(400, 'request aborted', {
        code: 'ECONNABORTED',
        expected: length,
        length: length,
        received: received,
        type: 'request.aborted',
      }));
    }

    function onData(chunk: any) {
      if (complete) return;
      received += chunk.length;
      if (limit && received > limit) {
        done(httpError(413, 'request entity too large', {
          limit: limit,
          received: received,
          type: 'entity.too.large',
        }));
      } else {
        buffer.push(chunk);
      }
    }
  
    function onEnd(err: any) {
      if (complete) return;
      if (err) return done(err);
      if (length && received !== length) {
        done(httpError(400, 'request size did not match content length', {
          expected: length,
          length: length,
          received: received,
          type: 'request.size.invalid',
        }));
      } else {
        done(Buffer.concat(buffer));
      }
    }

    // attach listeners
    stream.on('aborted', onAborted);
    stream.on('close', cleanup);
    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onEnd);

    // 清理
    function cleanup() {
      stream.removeListener('aborted', onAborted);
      stream.removeListener('data', onData);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onEnd);
      stream.removeListener('close', cleanup);
      stream.unpipe();
    }

    // 完成后调用
    function done(arg: Error | Buffer) {
      complete = true;
      cleanup();
      if (arg instanceof Error) {
        reject(arg);
      } else {
        resolve(arg);
      }
    }
  });
}
