type SendWelcomeEmailInput = {
  actionUrl: string;
  email: string;
  fullName: string;
  loginUrl: string;
};

type SendPasswordResetEmailInput = {
  actionUrl: string;
  email: string;
  fullName: string | null;
  loginUrl: string;
};

type SendMembershipReminderEmailInput = {
  email: string;
  fullName: string;
  loginUrl: string;
  membershipEndDate: string;
};

export function hasEmailConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendWelcomeEmail({
  actionUrl,
  email,
  fullName,
  loginUrl,
}: SendWelcomeEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Resend API key.");
  }

  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("Missing Resend from email.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: welcomeEmailHtml({ actionUrl, fullName, loginUrl }),
      subject: "Tu invitacion a ATLETIX",
      text: welcomeEmailText({ actionUrl, fullName, loginUrl }),
      to: email,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed: ${details}`);
  }
}

export async function sendPasswordResetEmail({
  actionUrl,
  email,
  fullName,
  loginUrl,
}: SendPasswordResetEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Resend API key.");
  }

  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("Missing Resend from email.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html: passwordResetEmailHtml({ actionUrl, fullName, loginUrl }),
      subject: "Restablece tu contraseña de ATLETIX",
      text: passwordResetEmailText({ actionUrl, fullName, loginUrl }),
      to: email,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed: ${details}`);
  }
}

export async function sendMembershipEndedEmail({
  email,
  fullName,
  loginUrl,
  membershipEndDate,
}: SendMembershipReminderEmailInput) {
  await sendEmail({
    html: membershipEndedEmailHtml({ fullName, loginUrl, membershipEndDate }),
    subject: "Tu membresía ATLETIX terminó hoy",
    text: membershipEndedEmailText({ fullName, loginUrl, membershipEndDate }),
    to: email,
  });
}

export async function sendMembershipDeactivationWarningEmail({
  email,
  fullName,
  loginUrl,
  membershipEndDate,
}: SendMembershipReminderEmailInput) {
  await sendEmail({
    html: membershipDeactivationWarningEmailHtml({
      fullName,
      loginUrl,
      membershipEndDate,
    }),
    subject: "Tu cuenta ATLETIX puede quedar inactiva pronto",
    text: membershipDeactivationWarningEmailText({
      fullName,
      loginUrl,
      membershipEndDate,
    }),
    to: email,
  });
}

async function sendEmail({
  html,
  subject,
  text,
  to,
}: {
  html: string;
  subject: string;
  text: string;
  to: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Resend API key.");
  }

  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("Missing Resend from email.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      html,
      subject,
      text,
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed: ${details}`);
  }
}

function welcomeEmailHtml({
  actionUrl,
  fullName,
  loginUrl,
}: {
  actionUrl: string;
  fullName: string;
  loginUrl: string;
}) {
  return `
    <div style="background:#07070a;color:#ffffff;font-family:Arial,sans-serif;padding:32px">
      <div style="margin:0 auto;max-width:560px;border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:28px;background:#111014">
        <p style="color:#ff8bd8;font-size:12px;font-weight:700;letter-spacing:.2em;margin:0 0 12px;text-transform:uppercase">ATLETIX</p>
        <h1 style="font-size:30px;line-height:1.1;margin:0 0 16px">Tu acceso a ATLETIX</h1>
        <p style="color:#d4d4d8;font-size:16px;line-height:1.6;margin:0 0 18px">Hola ${escapeHtml(fullName)}, el equipo ATLETIX creó tu acceso inicial. Activa tu cuenta, crea tu contraseña y entra para continuar tu registro.</p>
        <a href="${escapeHtml(actionUrl)}" style="background:#ff2fa8;border-radius:999px;color:#ffffff;display:inline-block;font-weight:800;margin:10px 0 20px;padding:14px 20px;text-decoration:none">Activar mi cuenta</a>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0">Después podrás iniciar sesión aquí: <a href="${escapeHtml(loginUrl)}" style="color:#ff8bd8">${escapeHtml(loginUrl)}</a></p>
      </div>
    </div>
  `;
}

function welcomeEmailText({
  actionUrl,
  fullName,
  loginUrl,
}: {
  actionUrl: string;
  fullName: string;
  loginUrl: string;
}) {
  return `Hola ${fullName}, tu acceso a ATLETIX está listo.

El equipo ATLETIX creó tu acceso inicial. Activa tu cuenta y crea tu contraseña aquí:
${actionUrl}

Después inicia sesión para continuar tu registro:
${loginUrl}`;
}

function passwordResetEmailHtml({
  actionUrl,
  fullName,
  loginUrl,
}: {
  actionUrl: string;
  fullName: string | null;
  loginUrl: string;
}) {
  const greeting = fullName ? `Hola ${escapeHtml(fullName)},` : "Hola,";

  return `
    <div style="background:#07070a;color:#ffffff;font-family:Arial,sans-serif;padding:32px">
      <div style="margin:0 auto;max-width:560px;border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:28px;background:#111014">
        <p style="color:#ff8bd8;font-size:12px;font-weight:700;letter-spacing:.2em;margin:0 0 12px;text-transform:uppercase">ATLETIX</p>
        <h1 style="font-size:30px;line-height:1.1;margin:0 0 16px">Restablece tu contraseña</h1>
        <p style="color:#d4d4d8;font-size:16px;line-height:1.6;margin:0 0 18px">${greeting} recibimos una solicitud para crear una nueva contraseña para tu cuenta.</p>
        <a href="${escapeHtml(actionUrl)}" style="background:#ff2fa8;border-radius:999px;color:#ffffff;display:inline-block;font-weight:800;margin:10px 0 20px;padding:14px 20px;text-decoration:none">Crear nueva contraseña</a>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0">Si no pediste este cambio, puedes ignorar este correo. Para entrar luego, usa: <a href="${escapeHtml(loginUrl)}" style="color:#ff8bd8">${escapeHtml(loginUrl)}</a></p>
      </div>
    </div>
  `;
}

function passwordResetEmailText({
  actionUrl,
  fullName,
  loginUrl,
}: {
  actionUrl: string;
  fullName: string | null;
  loginUrl: string;
}) {
  const greeting = fullName ? `Hola ${fullName},` : "Hola,";

  return `${greeting}

Recibimos una solicitud para crear una nueva contraseña para tu cuenta ATLETIX.

Crea tu nueva contraseña aquí:
${actionUrl}

Si no pediste este cambio, puedes ignorar este correo.

Para entrar luego:
${loginUrl}`;
}

function membershipEndedEmailHtml({
  fullName,
  loginUrl,
  membershipEndDate,
}: {
  fullName: string;
  loginUrl: string;
  membershipEndDate: string;
}) {
  return `
    <div style="background:#07070a;color:#ffffff;font-family:Arial,sans-serif;padding:32px">
      <div style="margin:0 auto;max-width:560px;border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:28px;background:#111014">
        <p style="color:#ff8bd8;font-size:12px;font-weight:700;letter-spacing:.2em;margin:0 0 12px;text-transform:uppercase">ATLETIX</p>
        <h1 style="font-size:30px;line-height:1.1;margin:0 0 16px">Tu membresía terminó hoy</h1>
        <p style="color:#d4d4d8;font-size:16px;line-height:1.6;margin:0 0 18px">Hola ${escapeHtml(fullName)}, tu membresía ATLETIX terminó hoy (${escapeHtml(formatEmailDate(membershipEndDate))}).</p>
        <p style="color:#d4d4d8;font-size:16px;line-height:1.6;margin:0 0 18px">Recuerda renovar para mantener tu cuenta activa, tu asistencia y tu cupo de grupo.</p>
        <a href="${escapeHtml(loginUrl)}" style="background:#ff2fa8;border-radius:999px;color:#ffffff;display:inline-block;font-weight:800;margin:10px 0 20px;padding:14px 20px;text-decoration:none">Entrar a ATLETIX</a>
      </div>
    </div>
  `;
}

function membershipEndedEmailText({
  fullName,
  loginUrl,
  membershipEndDate,
}: {
  fullName: string;
  loginUrl: string;
  membershipEndDate: string;
}) {
  return `Hola ${fullName},

Tu membresía ATLETIX terminó hoy (${formatEmailDate(membershipEndDate)}).

Recuerda renovar para mantener tu cuenta activa, tu asistencia y tu cupo de grupo.

Entra a ATLETIX:
${loginUrl}`;
}

function membershipDeactivationWarningEmailHtml({
  fullName,
  loginUrl,
  membershipEndDate,
}: {
  fullName: string;
  loginUrl: string;
  membershipEndDate: string;
}) {
  return `
    <div style="background:#07070a;color:#ffffff;font-family:Arial,sans-serif;padding:32px">
      <div style="margin:0 auto;max-width:560px;border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:28px;background:#111014">
        <p style="color:#ff8bd8;font-size:12px;font-weight:700;letter-spacing:.2em;margin:0 0 12px;text-transform:uppercase">ATLETIX</p>
        <h1 style="font-size:30px;line-height:1.1;margin:0 0 16px">Tu cuenta puede quedar inactiva</h1>
        <p style="color:#d4d4d8;font-size:16px;line-height:1.6;margin:0 0 18px">Hola ${escapeHtml(fullName)}, tu membresía terminó el ${escapeHtml(formatEmailDate(membershipEndDate))} y todavía no vemos una renovación registrada.</p>
        <p style="color:#d4d4d8;font-size:16px;line-height:1.6;margin:0 0 18px">Si no renuevas, tu cuenta puede pasar a inactiva y podrías perder tu cupo en el grupo.</p>
        <a href="${escapeHtml(loginUrl)}" style="background:#ff2fa8;border-radius:999px;color:#ffffff;display:inline-block;font-weight:800;margin:10px 0 20px;padding:14px 20px;text-decoration:none">Entrar a ATLETIX</a>
      </div>
    </div>
  `;
}

function membershipDeactivationWarningEmailText({
  fullName,
  loginUrl,
  membershipEndDate,
}: {
  fullName: string;
  loginUrl: string;
  membershipEndDate: string;
}) {
  return `Hola ${fullName},

Tu membresía terminó el ${formatEmailDate(membershipEndDate)} y todavía no vemos una renovación registrada.

Si no renuevas, tu cuenta puede pasar a inactiva y podrías perder tu cupo en el grupo.

Entra a ATLETIX:
${loginUrl}`;
}

function formatEmailDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    timeZone: "America/Bogota",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00-05:00`));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
