import crypto from 'crypto';

// Server-side Meta Conversions API (CAPI)
// Sends events directly from the server to Meta — not blocked by ad blockers, more reliable.
// Requires:
//   NEXT_PUBLIC_FB_PIXEL_ID   — your platform's Meta Pixel ID (e.g. 1234567890123456)
//   FB_CONVERSIONS_API_TOKEN  — system user access token from Meta Business → Events Manager

export async function POST(request) {
    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const accessToken = process.env.FB_CONVERSIONS_API_TOKEN;

    // Silently skip if not configured (don't error, just skip)
    if (!pixelId || !accessToken) {
        return Response.json({ skipped: true, reason: 'Meta CAPI not configured' });
    }

    try {
        const body = await request.json();
        const { event_name, email, event_id, user_agent } = body;

        // Get client IP from request headers
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || null;

        // SHA-256 hash the email (required by Meta for privacy)
        const hashedEmail = email
            ? crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
            : undefined;

        const eventPayload = {
            event_name: event_name || 'CompleteRegistration',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_id: event_id || `${event_name}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            user_data: {
                ...(hashedEmail ? { em: [hashedEmail] } : {}),
                ...(ip ? { client_ip_address: ip } : {}),
                ...(user_agent ? { client_user_agent: user_agent } : {}),
            },
            custom_data: {
                currency: 'HUF',
                value: 0,
            },
        };

        const res = await fetch(
            `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [eventPayload] }),
            }
        );

        const result = await res.json();

        if (!res.ok) {
            console.error('Meta CAPI error:', result);
            return Response.json({ error: result }, { status: 500 });
        }

        return Response.json({ success: true, events_received: result.events_received });
    } catch (err) {
        console.error('Meta CAPI exception:', err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
