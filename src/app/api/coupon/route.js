import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET — validate coupon code
export async function GET(request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Szerver hiba' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim().toUpperCase();

  if (!code) {
    return Response.json({ error: 'Hiányzó kuponkód' }, { status: 400 });
  }

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !coupon) {
    return Response.json({ valid: false, error: 'Érvénytelen kuponkód' });
  }

  // Check max uses
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return Response.json({ valid: false, error: 'Ez a kupon már elfogyott' });
  }

  // Check validity dates
  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return Response.json({ valid: false, error: 'Ez a kupon még nem érvényes' });
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return Response.json({ valid: false, error: 'Ez a kupon lejárt' });
  }

  return Response.json({
    valid: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      trial_days: coupon.trial_days,
      discount_percent: coupon.discount_percent,
    },
  });
}

// POST — apply coupon to a profile (called after registration)
export async function POST(request) {
  if (!supabaseAdmin) {
    return Response.json({ error: 'Szerver hiba' }, { status: 500 });
  }

  try {
    const { code, profileId, email } = await request.json();

    if (!code || (!profileId && !email)) {
      return Response.json({ error: 'Hiányzó adatok' }, { status: 400 });
    }

    // Find coupon
    const couponCode = code.trim().toUpperCase();
    const { data: coupon } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .maybeSingle();

    if (!coupon) {
      return Response.json({ error: 'Érvénytelen kuponkód' }, { status: 400 });
    }

    // Check limits
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return Response.json({ error: 'Ez a kupon már elfogyott' }, { status: 400 });
    }

    // Find profile (by ID or email)
    let targetProfileId = profileId;
    if (!targetProfileId && email) {
      // Find profile by user email
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === email);
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (profile) targetProfileId = profile.id;
      }
    }

    if (!targetProfileId) {
      return Response.json({ error: 'Profil nem található' }, { status: 404 });
    }

    // Check if this profile already used a coupon
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('coupon_used')
      .eq('id', targetProfileId)
      .maybeSingle();

    if (existingProfile?.coupon_used) {
      return Response.json({ error: 'Már használtál kuponkódot' }, { status: 400 });
    }

    // Apply coupon
    const updateData = {
      coupon_used: couponCode,
      trial_days: coupon.trial_days || 30,
    };

    // If referral coupon, set referred_by
    if (coupon.type === 'referral' && coupon.created_by_profile_id) {
      updateData.referred_by = coupon.created_by_profile_id;
    }

    await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', targetProfileId);

    // Increment coupon usage
    await supabaseAdmin
      .from('coupons')
      .update({ current_uses: coupon.current_uses + 1 })
      .eq('id', coupon.id);

    // Log referral use
    await supabaseAdmin.from('referral_uses').insert({
      coupon_id: coupon.id,
      used_by_profile_id: targetProfileId,
      referrer_profile_id: coupon.created_by_profile_id || null,
    });

    return Response.json({
      success: true,
      trial_days: coupon.trial_days || 30,
      type: coupon.type,
    });
  } catch (err) {
    console.error('Coupon apply error:', err);
    return Response.json({ error: 'Szerverhiba' }, { status: 500 });
  }
}
