import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const profileId = searchParams.get('profileId');
        const dateFrom = searchParams.get('from'); // YYYY-MM-DD
        const dateTo = searchParams.get('to');     // YYYY-MM-DD

        if (!profileId || !dateFrom || !dateTo) {
            return Response.json({ error: 'Missing params' }, { status: 400 });
        }

        if (!supabaseAdmin) {
            return Response.json({ busySlots: [] });
        }

        // 1. Get provider's profile — check if calendar sync is enabled
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('google_calendar_enabled, google_refresh_token')
            .eq('id', profileId)
            .maybeSingle();

        if (!profile?.google_calendar_enabled || !profile?.google_refresh_token) {
            return Response.json({ busySlots: [] });
        }

        // 2. Get a fresh access token using the refresh token
        const accessToken = await refreshGoogleToken(profile.google_refresh_token);
        if (!accessToken) {
            console.error('Failed to refresh Google token for profile:', profileId);
            return Response.json({ busySlots: [] });
        }

        // 3. Fetch busy times from Google Calendar (FreeBusy API)
        const timeMin = `${dateFrom}T00:00:00+01:00`;
        const timeMax = `${dateTo}T23:59:59+01:00`;

        const freeBusyRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timeMin,
                timeMax,
                timeZone: 'Europe/Budapest',
                items: [{ id: 'primary' }],
            }),
        });

        if (!freeBusyRes.ok) {
            const err = await freeBusyRes.json().catch(() => ({}));
            console.error('Google FreeBusy API error:', err);
            return Response.json({ busySlots: [] });
        }

        const freeBusyData = await freeBusyRes.json();
        const busyPeriods = freeBusyData?.calendars?.primary?.busy || [];

        // 4. Convert to simple date/time format for the frontend
        const busySlots = busyPeriods.map(period => {
            const start = new Date(period.start);
            const end = new Date(period.end);
            return {
                booking_date: start.toLocaleDateString('sv-SE'), // YYYY-MM-DD
                start_time: start.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Budapest' }),
                end_time: end.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Budapest' }),
                team_member_id: null, // Google Calendar blocks apply to the owner
            };
        });

        return Response.json({ busySlots });
    } catch (error) {
        console.error('Google Calendar API error:', error);
        return Response.json({ busySlots: [] });
    }
}

// Refresh Google access token using stored refresh token
async function refreshGoogleToken(refreshToken) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error('Google OAuth credentials not configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)');
        return null;
    }

    try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('Google token refresh failed:', err);
            return null;
        }

        const data = await res.json();
        return data.access_token;
    } catch (err) {
        console.error('Google token refresh error:', err);
        return null;
    }
}
