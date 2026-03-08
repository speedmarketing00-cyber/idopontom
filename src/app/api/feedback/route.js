import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
    try {
        const { message, senderEmail, senderName } = await request.json();
        if (!message?.trim()) {
            return Response.json({ error: 'Üres üzenet' }, { status: 400 });
        }
        if (!resend) {
            return Response.json({ error: 'Email küldés nem konfigurált' }, { status: 500 });
        }

        await resend.emails.send({
            from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
            to: 'speedmarketing00@gmail.com',
            subject: `💬 Visszajelzés a FoglaljVelem-től – ${senderName || senderEmail || 'Ismeretlen felhasználó'}`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:2.5rem;">💬</span>
      <h1 style="font-size:1.2rem;color:#1e3a5f;margin:8px 0 4px;">Új visszajelzés érkezett</h1>
    </div>
    <div style="background:#f8faff;border-radius:12px;padding:20px;border:1px solid #e0e7ff;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:0.85rem;color:#6b7280;">Feladó:</p>
      <p style="margin:0;font-weight:600;color:#374151;">${senderName || '–'} (${senderEmail || 'ismeretlen email'})</p>
    </div>
    <div style="background:#fffdf0;border-radius:12px;padding:20px;border:1px solid #fde68a;">
      <p style="margin:0 0 8px;font-size:0.85rem;color:#6b7280;">Üzenet:</p>
      <p style="margin:0;color:#374151;font-size:0.95rem;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Visszajelzési rendszer</p>
</div>
</body></html>`,
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Feedback email error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
