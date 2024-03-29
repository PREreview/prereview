import { DefaultState, Middleware } from 'koa';
import path from 'path';
import Email from 'email-templates';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid';

//const log = getLogger('backend:middleware:mail');

const TEMPLATE_DIR = path.resolve('dist', 'backend', 'templates', 'email');

type Config = {
  emailAddress: string,
  emailSendgridKey: string,
}

type Mailer = {
  mail: Email;
}

export const mailWrapper = (config: Config): Middleware<DefaultState, Mailer> => {
  const transport = nodemailer.createTransport(
    sendgridTransport({
      apiKey: config.emailSendgridKey,
    }),
  );

  const mailer = new Email({
    message: {
      from: config.emailAddress,
    },
    send: true,
    transport: transport,
    getPath: (type, template) => path.join(TEMPLATE_DIR, template, type),
    views: {
      options: {
        extension: 'hbs',
      },
    },
  });

  return async (ctx, next) => {
    ctx.mail = mailer;
    await next();
  };
};
