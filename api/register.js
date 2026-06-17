const { Resend } = require("resend");

const RESEND_API_KEY   = "re_iHgBmnYo_KHsxX7T7NV9BXdpyCNisPwN2";
const FROM_EMAIL       = "info@soulmap.at";
const ORGANIZER_EMAIL  = "info@soulmap.at";

const resend = new Resend(RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, street, plz, city, country } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: "Name und E-Mail sind Pflichtfelder." });
  }

  const countryLabels = { AT: "Österreich", DE: "Deutschland", CH: "Schweiz", other: "Anderes Land" };
  const countryLabel  = countryLabels[country] ?? country;

  try {
    // ── 1) Benachrichtigung an den Betreiber ────────────────────────
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      [ORGANIZER_EMAIL],
      subject: `Neue Anmeldung: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;color:#2E1F15;">
          <h2 style="color:#6B47A0;margin-bottom:4px;">Neue Workshop-Anmeldung</h2>
          <p style="color:#8B7060;font-size:13px;margin-top:0;">Cosmic Design Elements · 30. Juni 2026</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:15px;">
            <tr><td style="padding:8px 0;border-bottom:1px solid #EEE6DA;color:#8B7060;width:130px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #EEE6DA;">${name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #EEE6DA;color:#8B7060;">E-Mail</td><td style="padding:8px 0;border-bottom:1px solid #EEE6DA;"><a href="mailto:${email}" style="color:#7B52B4;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #EEE6DA;color:#8B7060;">Adresse</td><td style="padding:8px 0;border-bottom:1px solid #EEE6DA;">${street}, ${plz} ${city}, ${countryLabel}</td></tr>
          </table>
        </div>
      `,
    });

    // ── 2) Bestätigungsmail an den Teilnehmer ────────────────────────
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      [email],
      subject: "Deine Anmeldung – Cosmic Design Elements",
      html: `
        <div style="font-family:sans-serif;max-width:560px;color:#2E1F15;background:#F5EFE6;padding:32px;border-radius:8px;">
          <h1 style="font-family:Georgia,serif;font-weight:300;font-style:italic;color:#6B47A0;margin-bottom:4px;">
            Danke, ${name}!
          </h1>
          <p style="color:#8B7060;font-size:13px;margin-top:0;">Cosmic Design Elements · 30. Juni 2026 · 18 Uhr · Online</p>

          <p style="font-size:15px;line-height:1.7;margin-top:20px;">
            Wir freuen uns sehr, dich beim Workshop begrüßen zu dürfen. Deine Anmeldung ist bei uns eingegangen.
          </p>

          <div style="background:#EEE6DA;border-left:3px solid #9B72CF;padding:16px 20px;border-radius:4px;margin:20px 0;">
            <p style="margin:0;font-size:15px;line-height:1.7;">
              <strong>Nächster Schritt:</strong> Du erhältst in Kürze eine Rechnung über <strong>€ 79,–</strong> per E-Mail.
              Bitte überweise den Betrag zeitnah – erst nach Zahlungseingang senden wir dir deinen persönlichen Webinar-Link zu.
            </p>
          </div>

          <p style="font-size:15px;line-height:1.7;">
            Bei Fragen melde dich jederzeit bei uns:<br>
            <a href="mailto:info@soulmap.at" style="color:#7B52B4;">info@soulmap.at</a>
          </p>

          <p style="font-size:15px;line-height:1.7;margin-top:20px;">
            Wir freuen uns auf dich! ✦<br>
            <em style="color:#6B47A0;">Kathi von Soulmap &amp; Tanja Frewein</em>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({ error: "E-Mail konnte nicht gesendet werden." });
  }
};
