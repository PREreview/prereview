import ChainedError, { ChainedErrorFactory } from 'typescript-chained-error';

interface HttpErrorProps {
  expose?: boolean;
  headers?: Record<string, string>;
  cleanStack?: boolean;
}

class HttpError extends ChainedError {
  readonly expose: boolean;
  readonly headers?: Record<string, string>;
  readonly status: number;

  constructor(
    status: number,
    message: string,
    cause?: Error,
    properties?: HttpErrorProps,
  ) {
    if (status < 400 || status >= 600) {
      console.warn('Use only 4xx or 5xx status codes for errors');
      status = 500;
    }
    const cleanStack =
      properties && properties.cleanStack ? properties.cleanStack : true;
    super(`HTTP Error ${status}: ${message}`, cause, { cleanStack });
    this.status = status;
    this.expose =
      properties && properties.expose ? properties.expose : status < 500;
    this.headers =
      properties && properties.headers ? properties.headers : undefined;
  }

  get statusCode(): number {
    return this.status;
  }
}

export class ServerError extends HttpError {
  constructor(message: string, cause?: Error) {
    super(500, message, cause);
  }
}

// Adapted from https://github.com/jshttp/http-errors
export function createError(...args: any[]): HttpError {
  let err: Error;
  let msg: string;
  let status = 500;
  let props: HttpErrorProps;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg instanceof HttpError) {
      return arg;
    } else if (arg instanceof Error) {
      err = arg;
      continue;
    }
    switch (typeof arg) {
      case 'string':
        msg = arg;
        break;
      case 'number':
        status = arg;
        if (i !== 0) {
          console.warn(
            'non-first-argument status code; replace with createError(' +
              arg +
              ', ...)',
          );
        }
        break;
      case 'object':
        props = arg;
        break;
    }
  }

  if (!err) {
    // create error
    return new HttpError(status, msg, undefined, props);
  }

  const defaultProps = {
    //expose: props && props.expose ? props.expose : status < 500,
    expose: true,
    headers: props.headers,
    status: this.status,
    statusCode: this.statusCode,
  };

  return ChainedErrorFactory.make(err, undefined, defaultProps);
}
