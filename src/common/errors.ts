import ChainedErrorTemplate, {
  ChainedErrorFactory,
} from 'typescript-chained-error';

export class ChainError extends ChainedErrorTemplate {
  public constructor(msg?: string, cause?: Error, cleanStack = true) {
    super(msg, cause, { cleanStack: cleanStack });
  }
}

interface HttpErrorProps {
  expose?: boolean;
  headers?: Record<string, string>;
  cleanStack?: boolean;
}

export class HttpError extends ChainError {
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
    super(`HTTP Error ${status}: ${message}`, cause, cleanStack);
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

export class BadRequestError extends HttpError {
  constructor(message: string, cause?: Error) {
    super(400, message, cause);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, cause?: Error) {
    super(401, message, cause);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, cause?: Error) {
    super(403, message, cause);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, cause?: Error) {
    super(404, message, cause);
  }
}

export class UnprocessableError extends HttpError {
  constructor(message: string, cause?: Error) {
    super(422, message, cause);
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
