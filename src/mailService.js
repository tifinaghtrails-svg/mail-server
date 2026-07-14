import nodemailer from "nodemailer";
import {
  customerBookingEmail,
  customerContactEmail,
  ownerBookingEmail,
  ownerContactEmail,
} from "./emailTemplates.js";

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "OWNER_EMAIL"];

const envValue = (key) => String(process.env[key] || "").trim();

const isGmailSmtp = () => /(^|\.)gmail\.com$/i.test(envValue("SMTP_HOST"));

const smtpPassword = () => {
  const password = envValue("SMTP_PASS");
  return isGmailSmtp() ? password.replace(/\s+/g, "") : password;
};

export const missingEnv = () => requiredEnv.filter((key) => !envValue(key));

export const mailStatus = ({ includeDetails = false } = {}) => {
  const missing = missingEnv();
  const normalizedPassword = smtpPassword();
  const details = includeDetails
    ? {
        hostConfigured: Boolean(envValue("SMTP_HOST")),
        portConfigured: Boolean(envValue("SMTP_PORT")),
        userConfigured: Boolean(envValue("SMTP_USER")),
        passwordConfigured: Boolean(envValue("SMTP_PASS")),
        fromConfigured: Boolean(envValue("SMTP_FROM")),
        ownerConfigured: Boolean(envValue("OWNER_EMAIL")),
        secure: String(envValue("SMTP_SECURE")).toLowerCase() === "true",
        port: Number(envValue("SMTP_PORT") || 587),
        gmailSmtp: isGmailSmtp(),
        gmailAppPasswordFormat:
          isGmailSmtp() && normalizedPassword ? normalizedPassword.length === 16 : null,
      }
    : undefined;

  return {
    configured: missing.length === 0,
    missingCount: missing.length,
    ...(details ? { details } : {}),
  };
};

const transporter = () =>
  nodemailer.createTransport({
    host: envValue("SMTP_HOST"),
    port: Number(envValue("SMTP_PORT") || 587),
    secure: String(envValue("SMTP_SECURE")).toLowerCase() === "true",
    auth: {
      user: envValue("SMTP_USER"),
      pass: smtpPassword(),
    },
  });

export const isEmail = (value) => /\S+@\S+\.\S+/.test(String(value || ""));

const removeControlCharacters = (value) =>
  Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      return code < 32 || code === 127 ? " " : char;
    })
    .join("");

export const clean = (value, maxLength = 2000) =>
  removeControlCharacters(String(value || ""))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const toPlainText = (html) =>
  String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const reference = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const sendPair = async ({ customerEmail, subjectOwner, subjectCustomer, ownerHtml, customerHtml, replyTo }) => {
  const missing = missingEnv();
  if (missing.length) {
    const error = new Error("Email service is not configured.");
    error.code = "MAIL_CONFIG_MISSING";
    error.details = missing;
    throw error;
  }

  const ownerEmail = envValue("OWNER_EMAIL");
  const mailer = transporter();

  await Promise.all([
    mailer.sendMail({
      from: envValue("SMTP_FROM"),
      to: ownerEmail,
      replyTo,
      subject: subjectOwner,
      html: ownerHtml,
      text: toPlainText(ownerHtml),
    }),
    mailer.sendMail({
      from: envValue("SMTP_FROM"),
      to: customerEmail,
      replyTo: ownerEmail,
      subject: subjectCustomer,
      html: customerHtml,
      text: toPlainText(customerHtml),
    }),
  ]);
};

export const bookingFromBody = (body = {}) => ({
  reference: reference("TAG"),
  fullName: clean(body.fullName, 120),
  email: clean(body.email, 254),
  phone: clean(body.phone, 80),
  nationality: clean(body.nationality, 80),
  selectedTour: clean(body.selectedTour, 160),
  tourTitle: clean(body.tourTitle, 160),
  date: clean(body.date, 40),
  travelers: clean(body.travelers, 40),
  fitness: clean(body.fitness, 80),
  message: clean(body.message, 2000),
  website: clean(body.website, 120),
});

export const validateBooking = (booking) =>
  Boolean(
    booking.fullName &&
      !booking.website &&
      isEmail(booking.email) &&
      booking.phone &&
      booking.nationality &&
      booking.selectedTour &&
      booking.date &&
      booking.travelers
  );

export const contactFromBody = (body = {}) => ({
  reference: reference("MSG"),
  name: clean(body.name, 120),
  email: clean(body.email, 254),
  subject: clean(body.subject, 160),
  message: clean(body.message, 2000),
  website: clean(body.website, 120),
});

export const validateContact = (message) =>
  Boolean(message.name && !message.website && isEmail(message.email) && message.message);

export const sendBookingEmails = async (booking) =>
  sendPair({
    customerEmail: booking.email,
    replyTo: booking.email,
    subjectOwner: `New trip request: ${booking.fullName} - ${booking.tourTitle || booking.selectedTour}`,
    subjectCustomer: `We received your TifinaghTrails request ${booking.reference}`,
    ownerHtml: ownerBookingEmail(booking),
    customerHtml: customerBookingEmail(booking),
  });

export const sendContactEmails = async (message) =>
  sendPair({
    customerEmail: message.email,
    replyTo: message.email,
    subjectOwner: `New website message: ${message.subject || message.name}`,
    subjectCustomer: `We received your message ${message.reference}`,
    ownerHtml: ownerContactEmail(message),
    customerHtml: customerContactEmail(message),
  });
