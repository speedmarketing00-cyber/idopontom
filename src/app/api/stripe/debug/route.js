import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const action = searchParams.get('action');

    if (!stripe || !supabaseAdmin) {
        return Response.json({ error: 'Stripe or DB not configured' }, { status: 500 });
    }

    // Action: fix a specific user's subscription tier based on Stripe data
    if (action === 'sync' && email) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (!customers.data.length) {
            return Response.json({ error: 'No Stripe customer found for this email' }, { status: 404 });
        }
        const customer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 5 });
        const activeSub = subscriptions.data.find(s => ['active', 'trialing'].includes(s.status));

        if (!activeSub) {
            return Response.json({ error: 'No active subscription found', subscriptions: subscriptions.data.map(s => ({ id: s.id, status: s.status })) });
        }

        const planName = activeSub.metadata?.planName;
        const tierMap = { alap: 'basic', profi: 'pro' };
        const tier = tierMap[planName] || 'basic';

        // Find profile via auth.users → profiles.user_id (profiles has no email column)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const authUser = users?.find(u => u.email === email);

        let profile = null;
        if (authUser) {
            const { data: prof } = await supabaseAdmin
                .from('profiles')
                .select('id, subscription_tier, stripe_customer_id, stripe_subscription_id, user_id')
                .eq('user_id', authUser.id)
                .maybeSingle();
            profile = prof;
        }

        if (!profile) {
            if (!authUser) {
                return Response.json({ error: 'No auth user found for this email' });
            }
            // Profile row is completely missing — create it
            const slug = (authUser.user_metadata?.business_name || email.split('@')[0])
                .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36).slice(-4);
            const { data: newProfile, error: createErr } = await supabaseAdmin
                .from('profiles')
                .insert({
                    user_id: authUser.id,
                    name: authUser.user_metadata?.name || '',
                    business_name: authUser.user_metadata?.business_name || '',
                    slug,
                    subscription_tier: tier,
                    stripe_customer_id: customer.id,
                    stripe_subscription_id: activeSub.id,
                })
                .select('id')
                .single();
            if (createErr) {
                return Response.json({ error: 'Failed to create profile', detail: createErr.message, authUserId: authUser.id });
            }
            return Response.json({
                fixed: true,
                created: true,
                profileId: newProfile.id,
                authUserId: authUser.id,
                after: { tier, customerId: customer.id, subscriptionId: activeSub.id },
                note: 'Profile row was missing — created new profile and synced subscription',
            });
        }

        // Sync profile
        await supabaseAdmin.from('profiles').update({
            subscription_tier: tier,
            stripe_customer_id: customer.id,
            stripe_subscription_id: activeSub.id,
        }).eq('id', profile.id);

        return Response.json({
            fixed: true,
            profileId: profile.id,
            before: { tier: profile.subscription_tier, customerId: profile.stripe_customer_id },
            after: { tier, customerId: customer.id, subscriptionId: activeSub.id },
        });
    }

    // Default: diagnostic info
    const diagnostics = {
        stripe_configured: !!stripe,
        webhook_secret_set: !!process.env.STRIPE_WEBHOOK_SECRET,
        webhook_secret_prefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 8) || 'NOT SET',
        supabase_admin_configured: !!supabaseAdmin,
    };

    // Check recent Stripe events
    try {
        const events = await stripe.events.list({ limit: 10, type: 'checkout.session.completed' });
        diagnostics.recent_checkout_events = events.data.map(e => ({
            id: e.id,
            created: new Date(e.created * 1000).toISOString(),
            customerEmail: e.data.object.customer_details?.email || e.data.object.customer_email,
            metadata: e.data.object.metadata,
            subscription: e.data.object.subscription,
        }));
    } catch (e) {
        diagnostics.events_error = e.message;
    }

    // Check webhook endpoints configured in Stripe
    try {
        const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 10 });
        diagnostics.webhook_endpoints = webhookEndpoints.data.map(w => ({
            id: w.id,
            url: w.url,
            status: w.status,
            enabled_events: w.enabled_events,
        }));
    } catch (e) {
        diagnostics.webhook_endpoints_error = e.message;
    }

    // If email provided, check that specific user
    if (email) {
        try {
            const customers = await stripe.customers.list({ email, limit: 1 });
            diagnostics.stripe_customer = customers.data[0] ? {
                id: customers.data[0].id,
                email: customers.data[0].email,
            } : null;

            if (customers.data[0]) {
                const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: 'all', limit: 5 });
                diagnostics.subscriptions = subs.data.map(s => ({
                    id: s.id,
                    status: s.status,
                    plan: s.metadata?.planName,
                    current_period_end: s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null,
                    trial_end: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
                }));
            }
        } catch (e) {
            diagnostics.stripe_error = e.message;
        }

        try {
            // profiles table has no email column — find via auth.users → profiles.user_id
            const { data: { users: diagUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
            const diagAuthUser = diagUsers?.find(u => u.email === email);
            if (diagAuthUser) {
                diagnostics.auth_user_id = diagAuthUser.id;
                const { data: profByUserId } = await supabaseAdmin
                    .from('profiles')
                    .select('id, subscription_tier, stripe_customer_id, stripe_subscription_id, user_id')
                    .eq('user_id', diagAuthUser.id)
                    .maybeSingle();
                diagnostics.supabase_profile = profByUserId;
                if (!profByUserId) {
                    diagnostics.note = 'Auth user exists but NO profile row found';
                }
            } else {
                diagnostics.note = 'No auth user found for this email';
            }
        } catch (e) {
            diagnostics.supabase_error = e.message;
        }
    }

    // Action: fix webhook URL to use www (avoid redirect breaking signature)
    if (action === 'fix-webhook') {
        try {
            const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
            const wrongEndpoint = endpoints.data.find(w => w.url === 'https://foglaljvelem.hu/api/stripe/webhook');
            if (wrongEndpoint) {
                await stripe.webhookEndpoints.update(wrongEndpoint.id, {
                    url: 'https://www.foglaljvelem.hu/api/stripe/webhook',
                });
                return Response.json({ fixed: true, message: 'Webhook URL updated to www.foglaljvelem.hu' });
            }
            return Response.json({ fixed: false, message: 'No webhook with old URL found', endpoints: endpoints.data.map(w => w.url) });
        } catch (e) {
            return Response.json({ error: e.message }, { status: 500 });
        }
    }

    return Response.json(diagnostics);
}
