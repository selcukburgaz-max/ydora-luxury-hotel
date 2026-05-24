// api/rezervasyon.js — Ydora Luxury Hotel Rezervasyon API
// Deploy: Vercel — npm i resend → RESEND_API_KEY ortam değişkeni ekle

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const OTEL_EMAIL = process.env.OTEL_EMAIL || 'info@ydoraluxury.com';

function formatDate(d) {
  if (!d) return '—';
  const [y, m, g] = d.split('-');
  return `${g}.${m}.${y}`;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://ydoraluxury.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ad, email, telefon, oda, giris, cikis, gece, misafir, ekstra, mesaj } = req.body || {};

  if (!ad || !email || !oda || !giris || !cikis) {
    return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });
  }

  const tarih = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

  // ── 1. Otele bildirim e-postası ──────────────────────────────
  await resend.emails.send({
    from: 'Ydora Rezervasyon <rezervasyon@ydoraluxury.com>',
    to: [OTEL_EMAIL],
    subject: `🏛️ Yeni Rezervasyon Talebi — ${ad} — ${oda}`,
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Helvetica Neue',sans-serif;background:#070709;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#0e0e14;border:1px solid rgba(201,169,110,0.2);border-radius:2px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#0e0e14,#1a1510);padding:36px 40px;border-bottom:1px solid rgba(201,169,110,0.2)">
      <div style="font-size:28px;font-weight:300;letter-spacing:0.18em;color:#f0ece4">YDORA</div>
      <div style="font-size:9px;letter-spacing:0.35em;color:#c9a96e;margin-top:4px;text-transform:uppercase">Luxury Hotel · Bodrum</div>
      <div style="margin-top:20px;font-size:16px;font-weight:300;color:#e8d5a3">Yeni Rezervasyon Talebi</div>
      <div style="font-size:11px;color:rgba(240,236,228,0.5);margin-top:4px">${tarih}</div>
    </div>
    <div style="padding:36px 40px">
      <table style="width:100%;border-collapse:collapse">
        ${[
          ['Misafir', ad],
          ['E-Posta', `<a href="mailto:${email}" style="color:#c9a96e">${email}</a>`],
          ['Telefon', telefon ? `<a href="tel:${telefon}" style="color:#c9a96e">${telefon}</a>` : '—'],
          ['Oda Tipi', oda],
          ['Giriş', formatDate(giris)],
          ['Çıkış', formatDate(cikis)],
          ['Gece', gece ? `${gece} gece` : '—'],
          ['Misafir Sayısı', misafir || '—'],
          ['Ek Hizmet', ekstra || '—'],
        ].map(([k, v]) => `
          <tr style="border-bottom:1px solid rgba(201,169,110,0.08)">
            <td style="padding:12px 0;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a96e;vertical-align:top;width:38%">${k}</td>
            <td style="padding:12px 0;font-size:14px;color:#f0ece4;font-weight:300">${v}</td>
          </tr>`).join('')}
        ${mesaj ? `
          <tr style="border-bottom:1px solid rgba(201,169,110,0.08)">
            <td style="padding:12px 0;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a96e;vertical-align:top">Notlar</td>
            <td style="padding:12px 0;font-size:14px;color:#f0ece4;font-weight:300;line-height:1.7">${mesaj}</td>
          </tr>` : ''}
      </table>
      <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap">
        <a href="mailto:${email}?subject=Rezervasyon Talebiniz — Ydora Luxury Hotel" style="display:inline-block;background:#c9a96e;color:#070709;padding:12px 24px;font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none">E-posta ile Yanıtla</a>
        <a href="https://api.whatsapp.com/send?phone=${(telefon || '').replace(/[^0-9]/g,'')}&text=Merhaba ${ad}, Ydora Luxury Hotel rezervasyon ekibi olarak sizinle iletişime geçiyoruz." style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none">WhatsApp</a>
      </div>
    </div>
    <div style="padding:16px 40px;text-align:center;border-top:1px solid rgba(201,169,110,0.08)">
      <p style="font-size:10px;color:rgba(240,236,228,0.3);margin:0">Bu e-posta ydoraluxury.com rezervasyon formu aracılığıyla gönderildi.</p>
    </div>
  </div>
</body>
</html>`,
  });

  // ── 2. Misafire onay e-postası ───────────────────────────────
  await resend.emails.send({
    from: 'Ydora Luxury Hotel <rezervasyon@ydoraluxury.com>',
    to: [email],
    subject: 'Rezervasyon Talebiniz Alındı — Ydora Luxury Hotel',
    html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Helvetica Neue',sans-serif;background:#f5f0e8;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#0e0e14;border-radius:2px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4)">
    <div style="background:linear-gradient(160deg,#0e0e14,#1a1510);padding:40px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.2)">
      <div style="font-size:36px;font-weight:300;letter-spacing:0.22em;color:#f0ece4">YDORA</div>
      <div style="font-size:9px;letter-spacing:0.4em;color:#c9a96e;margin-top:6px;text-transform:uppercase">Luxury Hotel · Bodrum</div>
    </div>
    <div style="padding:40px">
      <h2 style="font-size:22px;font-weight:300;color:#f0ece4;margin:0 0 8px">Merhaba ${ad},</h2>
      <p style="font-size:14px;color:rgba(240,236,228,0.6);line-height:1.8;margin:0 0 32px">Rezervasyon talebiniz başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.</p>
      <div style="border:1px solid rgba(201,169,110,0.2);padding:24px;margin-bottom:28px">
        <div style="font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;margin-bottom:16px">Talep Özeti</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="font-size:11px;color:rgba(240,236,228,0.4);padding:8px 0;border-bottom:1px solid rgba(201,169,110,0.06)">Oda</td><td style="font-size:13px;color:#f0ece4;text-align:right;border-bottom:1px solid rgba(201,169,110,0.06)">${oda}</td></tr>
          <tr><td style="font-size:11px;color:rgba(240,236,228,0.4);padding:8px 0;border-bottom:1px solid rgba(201,169,110,0.06)">Giriş</td><td style="font-size:13px;color:#f0ece4;text-align:right;border-bottom:1px solid rgba(201,169,110,0.06)">${formatDate(giris)}</td></tr>
          <tr><td style="font-size:11px;color:rgba(240,236,228,0.4);padding:8px 0">Çıkış</td><td style="font-size:13px;color:#f0ece4;text-align:right">${formatDate(cikis)}</td></tr>
        </table>
      </div>
      <p style="font-size:12px;color:rgba(240,236,228,0.5);line-height:1.9;margin:0 0 28px">İvedi talepleriniz için WhatsApp hattımızdan veya telefon ile bize ulaşabilirsiniz.</p>
      <a href="https://wa.me/902520000000" style="display:inline-block;background:#c9a96e;color:#070709;padding:14px 32px;font-size:11px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none">WhatsApp ile Ulaşın</a>
    </div>
    <div style="padding:20px 40px;text-align:center;border-top:1px solid rgba(201,169,110,0.08)">
      <p style="font-size:11px;color:rgba(240,236,228,0.3);margin:0">Cumhuriyet Cad. No:12, Bodrum / Muğla 48400 | <a href="https://ydoraluxury.com" style="color:#c9a96e">ydoraluxury.com</a></p>
    </div>
  </div>
</body>
</html>`,
  });

  return res.status(200).json({ success: true });
}
