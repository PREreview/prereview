import ChainedErrorTemplate from 'typescript-chained-error';

export class ChainError extends ChainedErrorTemplate {
  public constructor(msg?: string, cause?: Error, cleanStack = true) {
    super(msg, cause, { cleanStack: cleanStack });
  }
}
