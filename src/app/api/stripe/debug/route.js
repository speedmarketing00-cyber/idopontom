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

        // Find profile by email
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, email, subscription_tier, stripe_customer_id, stripe_subscription_id, user_id')
            .eq('email', email)
            .maybeSingle();

        if (!profile) {
            // Try via auth users
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
            const authUser = users?.find(u => u.email === email);
            if (!authUser) {
                return Response.json({ error: 'No profile or auth user found for this email' });
            }
            const { data: profByUserId } = await supabaseAdmin
                .from('profiles')
                .select('id, email, subscription_tier, stripe_customer_id, stripe_subscription_id, user_id')
                .eq('user_id', authUser.id)
                .maybeSingle();
            if (!profByUserId) {
                return Response.json({ error: 'Auth user found but no profile row', authUserId: authUser.id });
            }
            // Sync it
            await supabaseAdmin.from('profiles').update({
                subscription_tier: tier,
                stripe_customer_id: customer.id,
                stripe_subscription_id: activeSub.id,
            }).eq('id', profByUserId.id);

            return Response.json({
                fixed: true,
                profileId: profByUserId.id,
                before: { tier: profByUserId.subscription_tier, customerId: profByUserId.stripe_customer_id },
                after: { tier, customerId: customer.id, subscriptionId: activeSub.id },
                note: 'Profile found via auth user lookup (email column was empty)',
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
                current_period_end: new Date(s.current_period_end * 1000).toISOString(),
                trial_end: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
            }));
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, email, subscription_tier, stripe_customer_id, stripe_subscription_id')
            .eq('email', email)
            .maybeSingle();
        diagnostics.supabase_profile = profile;

        if (!profile) {
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
            const authUser = users?.find(u => u.email === email);
            if (authUser) {
                const { data: profByUserId } = await supabaseAdmin
                    .from('profiles')
                    .select('id, email, subscription_tier, stripe_customer_id, stripe_subscription_id')
                    .eq('user_id', authUser.id)
                    .maybeSingle();
                diagnostics.supabase_profile_via_auth = profByUserId;
                diagnostics.note = 'Profile email column empty — found via auth user lookup';
            }
        }
    }

    return Response.json(diagnostics);
}
