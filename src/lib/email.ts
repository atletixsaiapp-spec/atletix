type SendWelcomeEmailInput = {
  actionUrl: string;
  email: string;
  fullName: string;
  loginUrl: string;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
