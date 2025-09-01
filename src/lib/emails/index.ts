import "server-only";

import type { ReactElement } from "react";

import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { env } from "../env/server";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: env.SMTP_PORT === "465",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

type SendEmailOptions =
  | {
      email: string;
      subject: string;
      react: ReactElement;
      text?: string;
    }
  | {
      email: string;
      subject: string;
      text: string;
    };

export const sendEmail = async (options: SendEmailOptions) => {
  const { email, subject, text } = options;
  const react = "react" in options ? options.react : undefined;

  return await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject,
    text,
    html: react ? await render(react) : undefined,
  });
};
