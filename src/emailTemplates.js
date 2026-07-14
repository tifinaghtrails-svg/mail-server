const brand = {
  name: "TifinaghTrails",
  accent: "#c9632b",
  ink: "#17201c",
  muted: "#60706a",
  soft: "#f6f1ea",
  panel: "#ffffff",
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const rows = (items) =>
  items
    .filter((item) => item.value !== undefined && item.value !== null && String(item.value).trim() !== "")
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:12px 0;color:${brand.muted};font-size:13px;border-bottom:1px solid #ece6dc;">${escapeHtml(label)}</td>
          <td style="padding:12px 0;color:${brand.ink};font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #ece6dc;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

const layout = ({ title, eyebrow, intro, children, ctaLabel, ctaHref, footer }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:${brand.soft};font-family:Inter,Arial,sans-serif;color:${brand.ink};">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(intro)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.soft};padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:${brand.panel};border-radius:18px;overflow:hidden;box-shadow:0 18px 50px rgba(26,37,31,.12);">
            <tr>
              <td style="background:#17201c;padding:34px 32px;color:#fff;">
                <p style="margin:0 0 10px;color:#f2c59f;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0;font-size:30px;line-height:1.15;font-weight:900;">${escapeHtml(title)}</h1>
                <p style="margin:14px 0 0;color:#d8e1dd;font-size:15px;line-height:1.65;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px;">
                ${children}
                ${
                  ctaLabel && ctaHref
                    ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:${brand.accent};color:#fff;text-decoration:none;border-radius:999px;padding:14px 22px;font-size:14px;font-weight:800;">${escapeHtml(ctaLabel)}</a></p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="background:#fbf8f3;padding:20px 32px;color:${brand.muted};font-size:12px;line-height:1.6;">
                ${escapeHtml(footer || `${brand.name} - High Atlas trekking experiences from Imlil, Morocco.`)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const bookingRows = (booking) =>
  rows([
    { label: "Reference", value: booking.reference },
    { label: "Tour", value: booking.tourTitle || booking.selectedTour },
    { label: "Preferred date", value: booking.date },
    { label: "Travelers", value: booking.travelers },
    { label: "Fitness level", value: booking.fitness },
    { label: "Name", value: booking.fullName },
    { label: "Email", value: booking.email },
    { label: "Phone / WhatsApp", value: booking.phone },
    { label: "Nationality", value: booking.nationality },
  ]);

export const ownerBookingEmail = (booking) =>
  layout({
    eyebrow: "New trip request",
    title: `${booking.fullName} wants to book a trek`,
    intro: "A customer has submitted the booking form. Reply quickly to confirm the details and keep the momentum warm.",
    children: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${bookingRows(booking)}</table>
      ${
        booking.message
          ? `<div style="margin-top:24px;padding:18px;border-radius:14px;background:${brand.soft};">
              <p style="margin:0 0 8px;color:${brand.muted};font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">Customer message</p>
              <p style="margin:0;color:${brand.ink};font-size:15px;line-height:1.7;">${escapeHtml(booking.message)}</p>
            </div>`
          : ""
      }
    `,
    ctaLabel: "Reply to customer",
    ctaHref: `mailto:${booking.email}?subject=${encodeURIComponent(`Your ${brand.name} booking ${booking.reference}`)}`,
    footer: `This request was sent from the ${brand.name} website booking form.`,
  });

export const customerBookingEmail = (booking) =>
  layout({
    eyebrow: "Booking request received",
    title: `Thank you, ${booking.fullName.split(" ")[0] || "traveler"}`,
    intro: "Your Atlas Mountains trip request has reached Mustapha. We will review your dates and answer with the next steps.",
    children: `
      <p style="margin:0 0 18px;color:${brand.ink};font-size:16px;line-height:1.7;">Here is a clean copy of your request.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${bookingRows(booking)}</table>
      <div style="margin-top:24px;padding:18px;border-radius:14px;background:${brand.soft};">
        <p style="margin:0;color:${brand.ink};font-size:15px;line-height:1.7;">Keep this reference for your conversation with us: <strong>${escapeHtml(booking.reference)}</strong>.</p>
      </div>
    `,
    ctaLabel: "Message us on WhatsApp",
    ctaHref: "https://wa.me/212657794841",
    footer: "We usually respond within 24 hours. For urgent changes, WhatsApp is the fastest way to reach us.",
  });

export const ownerContactEmail = (message) =>
  layout({
    eyebrow: "New website message",
    title: `${message.name} sent a message`,
    intro: "A customer contacted you from the website. Their message and contact details are below.",
    children: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${rows([
          { label: "Reference", value: message.reference },
          { label: "Name", value: message.name },
          { label: "Email", value: message.email },
          { label: "Subject", value: message.subject || "Website inquiry" },
        ])}
      </table>
      <div style="margin-top:24px;padding:18px;border-radius:14px;background:${brand.soft};">
        <p style="margin:0;color:${brand.ink};font-size:15px;line-height:1.7;">${escapeHtml(message.message)}</p>
      </div>
    `,
    ctaLabel: "Reply to customer",
    ctaHref: `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Your message to TifinaghTrails"}`)}`,
    footer: `This message was sent from the ${brand.name} website contact form.`,
  });

export const customerContactEmail = (message) =>
  layout({
    eyebrow: "Message received",
    title: `Thanks for reaching out, ${message.name.split(" ")[0] || "traveler"}`,
    intro: "Your message has reached Mustapha. We will respond as soon as possible with helpful trip advice.",
    children: `
      <p style="margin:0 0 18px;color:${brand.ink};font-size:16px;line-height:1.7;">We saved your message with reference <strong>${escapeHtml(message.reference)}</strong>.</p>
      <div style="padding:18px;border-radius:14px;background:${brand.soft};">
        <p style="margin:0;color:${brand.ink};font-size:15px;line-height:1.7;">${escapeHtml(message.message)}</p>
      </div>
    `,
    ctaLabel: "Contact on WhatsApp",
    ctaHref: "https://wa.me/212657794841",
    footer: "We usually respond within 24 hours. For urgent questions, WhatsApp is fastest.",
  });
