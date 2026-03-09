import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

// Plan definitions
const PLANS = {
    alap: { name: 'FoglaljVelem Alap', price: 4997, currency: 'huf' },
    profi: { name: 'FoglaljVelem Profi', price: 19997, currency: 'huf' },
};

// Cache price IDs in memory (per cold start)
let cachedPriceIds = {
    alap: process.env.STRIPE_PRICE_ALAP || null,
    profi: process.env.STRIPE_PRICE_PROFI || null,
};

// Get or create a price for a plan
async function getOrCreatePrice(planName) {
    // If we have a cached price, try to use it
    if (cachedPriceIds[planName]) {
        try {
            await stripe.prices.retrieve(cachedPriceIds[planName]);
            return cachedPriceIds[planName];
        } catch (e) {
            // Price doesn't exist in this Stripe account, create it
            console.log(`Price ${cachedPriceIds[planName]} not found, creating new one...`);
        }
    }

    const plan = PLANS[planName];
    if (!plan) throw new Error(`Ismeretlen csomag: ${planName}`);

    // Search for existing product
    const products = await stripe.products.list({ limit: 10 });
    let product = products.data.find(p => p.name === plan.name && p.active);

    if (!product) {
        product = await stripe.products.create({
            name: plan.name,
            description: planName === 'alap'
                ? 'E-mail értesítések, Google Naptár, QR kód, statisztikák'
                : 'Minden Alap funkció + csapatkezelés, prioritásos támogatás',
        });
    }

    // Search for existing active price on this product
    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 5 });
    let price = prices.data.find(p =>
        p.unit_amount === plan.price && p.currency === plan.currency && p.recurring?.interval === 'month'
    );

    if (!price) {
        price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.price,
            currency: plan.currency,
            recurring: { interval: 'month' },
        });
    }

    cachedPriceIds[planName] = price.id;
    return price.id;
}

export async function POST(request) {
    if (!stripe) {
        return Response.json({ error: 'Stripe nincs konfigurálva.' }, { status: 500 });
    }

    try {
        const { action, priceId, planName, profileId, email, customerId } = await request.json();

        if (action === 'create-checkout') {
            // Get or create the price for this plan
            const resolvedPriceId = priceId || await getOrCreatePrice(planName);

            const sessionConfig = {
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: resolvedPriceId, quantity: 1 }],
                success_url: `${request.headers.get('origin')}/dashboard/settings?subscription=success`,
                cancel_url: `${request.headers.get('origin')}/dashboard/settings?subscription=cancelled`,
                metadata: { profileId, planName },
                // 14-day free trial — card required upfront, billing starts after trial
                subscription_data: {
                    trial_period_days: 14,
                    metadata: { profileId, planName },
                },
            };

            if (customerId) {
                sessionConfig.customer = customerId;
            } else if (email) {
                sessionConfig.customer_email = email;
            }

            const session = await stripe.checkout.sessions.create(sessionConfig);
            return Response.json({ url: session.url });
        }

        if (action === 'create-portal') {
            if (!customerId) return Response.json({ error: 'Nincs Stripe ügyfél azonosító.' }, { status: 400 });
            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: `${request.headers.get('origin')}/dashboard/settings`,
            });
            return Response.json({ url: session.url });
        }

        return Response.json({ error: 'Ismeretlen action' }, { status: 400 });
    } catch (error) {
        console.error('Stripe error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
