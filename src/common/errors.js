class FixmeError extends Error {
  constructor(message, cause) {
    if (cause && 'message' in cause) {
      super(`${message}: ${cause.message}`);
    } else {
      super(message);
    }
    this.name = 'FixmeError';
    this.cause = cause;
  }
}

export class HttpError extends FixmeError {
  constructor(status, message, cause) {
    super(`HTTP Error ${status}: ${message}`, cause);
    this.status = status;
    this.name = 'HttpError';
  }
}
export class BadRequestError extends HttpError {
  constructor(message, cause) {
    super(400, message, cause);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message, cause) {
    super(401, message, cause);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message, cause) {
    super(403, message, cause);
  }
}

export class NotFoundError extends HttpError {
  constructor(message, cause) {
    super(404, message, cause);
  }
}

export class UnprocessableError extends HttpError {
  constructor(message, cause) {
    super(422, message, cause);
  }
}

export class ServerError extends HttpError {
  constructor(message, cause) {
    super(500, message, cause);
  }
}
