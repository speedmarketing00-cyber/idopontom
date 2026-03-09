import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { headers } from 'next/headers';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// Map plan names to subscription_tier DB values
const PLAN_TO_TIER = { alap: 'basic', profi: 'pro' };

export async function POST(request) {
    if (!stripe || !endpointSecret) {
        return Response.json({ error: 'Stripe webhook nincs konfigurálva.' }, { status: 500 });
    }

    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const profileId = session.metadata?.profileId;
                const planName = session.metadata?.planName;
                const tier = PLAN_TO_TIER[planName] || 'basic';

                if (profileId && supabaseAdmin) {
                    await supabaseAdmin.from('profiles').update({
                        subscription_tier: tier,
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                    }).eq('id', profileId);

                    // Also store planName on the Stripe subscription metadata
                    // so customer.subscription.updated can read it on renewals
                    if (stripe && session.subscription && planName) {
                        try {
                            await stripe.subscriptions.update(session.subscription, {
                                metadata: { profileId, planName },
                            });
                        } catch (e) { console.warn('Subscription metadata update failed:', e.message); }
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                if (supabaseAdmin) {
                    const isActive = ['active', 'trialing'].includes(subscription.status);
                    // planName is stored on subscription metadata (set during checkout.session.completed)
                    const planName = subscription.metadata?.planName;

                    if (isActive && planName) {
                        // Active subscription with known plan - set correct tier
                        const tier = PLAN_TO_TIER[planName] || 'basic';
                        await supabaseAdmin.from('profiles')
                            .update({ subscription_tier: tier })
                            .eq('stripe_subscription_id', subscription.id);
                    } else if (!isActive) {
                        // Subscription went inactive (past_due, paused, etc.) - downgrade to free
                        await supabaseAdmin.from('profiles')
                            .update({ subscription_tier: 'free' })
                            .eq('stripe_subscription_id', subscription.id);
                    }
                    // If active but no planName metadata, do nothing (avoid accidental downgrades)
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                if (supabaseAdmin) {
                    // Get profile email for notification
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('name, email, business_name')
                        .eq('stripe_subscription_id', subscription.id)
                        .maybeSingle();

                    // Downgrade to free
                    await supabaseAdmin.from('profiles').update({
                        subscription_tier: 'free',
                        stripe_subscription_id: null,
                    }).eq('stripe_subscription_id', subscription.id);

                    // Notify user via email
                    if (resend && profile?.email) {
                        try {
                            await resend.emails.send({
                                from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                                to: profile.email,
                                subject: '⚠️ Előfizetésed lejárt – FoglaljVelem',
                                html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2.5rem;">⚠️</span>
      <h1 style="font-size:1.3rem;color:#1e3a5f;margin:8px 0 4px;">Előfizetésed lejárt</h1>
      <p style="color:#6b7280;font-size:0.9rem;margin:0;">Kedves ${profile.name || profile.business_name},</p>
    </div>
    <p style="color:#374151;font-size:0.9rem;line-height:1.6;">A fizetős előfizetésed lejárt vagy nem sikerült megújítani. A fiókod visszakerült az <strong>Ingyenes</strong> csomagra.</p>
    <p style="color:#374151;font-size:0.9rem;line-height:1.6;">Ez azt jelenti, hogy az email értesítések és egyéb premium funkciók le lettek tiltva.</p>
    <div style="text-align:center;margin-top:24px;">
      <a href="https://foglaljvelem.hu/dashboard/settings" style="display:inline-block;background:#3b8fd9;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;">Előfizetés megújítása →</a>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;">FoglaljVelem.hu – Online időpontfoglalás</p>
</div>
</body></html>`,
                            });
                        } catch (e) { console.error('Subscription expiry email error:', e); }
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customerId = invoice.customer;
                if (supabaseAdmin && customerId) {
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('name, email, business_name')
                        .eq('stripe_customer_id', customerId)
                        .maybeSingle();

                    if (resend && profile?.email) {
                        try {
                            await resend.emails.send({
                                from: 'FoglaljVelem <noreply@foglaljvelem.hu>',
                                to: profile.email,
                                subject: '❌ Sikertelen fizetés – FoglaljVelem',
                                html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f7ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
  <div style="background:white;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:2.5rem;">❌</span>
      <h1 style="font-size:1.3rem;color:#dc2626;margin:8px 0 4px;">Sikertelen fizetés</h1>
    </div>
    <p style="color:#374151;font-size:0.9rem;line-height:1.6;">Kedves ${profile.name || profile.business_name}, a havi előfizetési díjat nem sikerült levonnunk a kártyádról.</p>
    <p style="color:#374151;font-size:0.9rem;line-height:1.6;">Kérjük frissítsd a fizetési adataidat, különben a fiókod visszakerül az Ingyenes csomagra.</p>
    <div style="text-align:center;margin-top:24px;">
      <a href="https://foglaljvelem.hu/dashboard/settings" style="display:inline-block;background:#dc2626;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;">Fizetési adatok frissítése →</a>
    </div>
  </div>
</div>
</body></html>`,
                            });
                        } catch (e) { console.error('Payment failed email error:', e); }
                    }
                }
                break;
            }

            default:
                break;
        }
    } catch (err) {
        console.error('Webhook handler error:', err);
        return Response.json({ error: 'Webhook handler error' }, { status: 500 });
    }

    return Response.json({ received: true });
}
