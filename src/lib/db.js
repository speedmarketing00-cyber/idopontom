import { supabase, isSupabaseConfigured } from './supabase';

// ============================================
// SERVICES
// ============================================
export async function getServices(profileId) {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('profile_id', profileId)
        .order('sort_order', { ascending: true });
    if (error) { console.error(error); return []; }
    return data;
}

export async function createService(service) {
    if (!isSupabaseConfigured || !supabase) return service;
    const { data, error } = await supabase.from('services').insert(service).select().single();
    if (error) throw error;
    return data;
}

export async function updateService(id, updates) {
    if (!isSupabaseConfigured || !supabase) return updates;
    const { data, error } = await supabase.from('services').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteService(id) {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
}

// ============================================
// AVAILABILITY
// ============================================
export async function getAvailability(profileId) {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('profile_id', profileId)
        .order('day_of_week', { ascending: true });
    if (error) { console.error(error); return []; }
    return data;
}

export async function upsertAvailability(slots) {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('availability').upsert(slots, { onConflict: 'profile_id,day_of_week' });
    if (error) throw error;
}

// ============================================
// BOOKINGS
// ============================================
export async function getBookings(profileId, filters = {}) {
    if (!isSupabaseConfigured || !supabase) return [];
    let query = supabase
        .from('bookings')
        .select('*, services(name, duration_minutes, price)')
        .eq('profile_id', profileId)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

    if (filters.date) query = query.eq('booking_date', filters.date);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) { console.error(error); return []; }
    return data;
}

export async function createBooking(booking) {
    if (!isSupabaseConfigured || !supabase) return booking;
    const { data, error } = await supabase.from('bookings').insert(booking).select().single();
    if (error) throw error;
    return data;
}

export async function updateBookingStatus(id, status) {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) throw error;
}

// ============================================
// REVIEWS
// ============================================
export async function getReviews(profileId) {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
}

export async function createReview(review) {
    if (!isSupabaseConfigured || !supabase) return review;
    const { data, error } = await supabase.from('reviews').insert(review).select().single();
    if (error) throw error;
    return data;
}

// ============================================
// PUBLIC PROFILE (by slug)
// ============================================
export async function getProfileBySlug(slug) {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*, services(*), availability(*), reviews(*)')
        .eq('slug', slug)
        .single();
    if (error) { console.error(error); return null; }
    return data;
}

// ============================================
// TEAM MEMBERS
// ============================================
export async function getTeamMembers(profileId) {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('owner_profile_id', profileId)
        .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data;
}

export async function addTeamMember(member) {
    if (!isSupabaseConfigured || !supabase) return member;
    const { data, error } = await supabase.from('team_members').insert(member).select().single();
    if (error) throw error;
    return data;
}

export async function removeTeamMember(id) {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
}

// ============================================
// WAITLIST
// ============================================
export async function addToWaitlist(entry) {
    if (!isSupabaseConfigured || !supabase) return entry;
    const { data, error } = await supabase.from('waitlist').insert(entry).select().single();
    if (error) throw error;
    return data;
}

// ============================================
// STATISTICS
// ============================================
export async function getBookingStats(profileId) {
    if (!isSupabaseConfigured || !supabase) return null;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [todayRes, weekRes, monthRes, totalRes] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact' }).eq('profile_id', profileId).eq('booking_date', today),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('profile_id', profileId).gte('booking_date', weekAgo),
        supabase.from('bookings').select('id, price', { count: 'exact' }).eq('profile_id', profileId).gte('booking_date', monthAgo),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('profile_id', profileId),
    ]);

    return {
        today: todayRes.count || 0,
        week: weekRes.count || 0,
        month: monthRes.count || 0,
        total: totalRes.count || 0,
    };
}

// ============================================
// COMMUNITY SERVICE TEMPLATES
// ============================================
export async function getCommunityTemplates(businessType) {
    if (!isSupabaseConfigured || !supabase) return [];
    let query = supabase
        .from('service_templates')
        .select('*')
        .order('usage_count', { ascending: false });
    if (businessType) query = query.eq('business_type', businessType);
    const { data, error } = await query;
    if (error) { console.error(error); return []; }
    return data;
}

export async function getAllCommunityTemplates() {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
        .from('service_templates')
        .select('*')
        .order('usage_count', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
}

export async function saveCommunityTemplate(template) {
    if (!isSupabaseConfigured || !supabase) return;
    // Try to increment usage_count if it exists, otherwise insert
    const { data: existing } = await supabase
        .from('service_templates')
        .select('id, usage_count')
        .eq('name', template.name)
        .eq('business_type', template.business_type)
        .maybeSingle();
    if (existing) {
        await supabase.from('service_templates').update({ usage_count: (existing.usage_count || 1) + 1 }).eq('id', existing.id);
    } else {
        await supabase.from('service_templates').insert({
            name: template.name,
            description: template.description || '',
            duration_minutes: template.duration_minutes,
            price: template.price,
            category: template.category || '',
            business_type: template.business_type || 'other',
            created_by: template.profile_id || null,
            usage_count: 1,
        });
    }
}
