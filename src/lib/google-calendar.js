// Google Calendar API integration
// Adds/removes booking events to the provider's Google Calendar
// Requires Google OAuth login with calendar scopes (handled by AuthProvider)

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// Add a booking event to Google Calendar
export async function addToGoogleCalendar(accessToken, booking) {
    if (!accessToken) return null;

    const startDateTime = `${booking.date}T${booking.startTime}:00`;
    const endDateTime = `${booking.date}T${booking.endTime}:00`;

    const event = {
        summary: `📅 ${booking.clientName} – ${booking.serviceName}`,
        description: [
            `Ügyfél: ${booking.clientName}`,
            booking.clientEmail ? `E-mail: ${booking.clientEmail}` : '',
            booking.clientPhone ? `Telefon: ${booking.clientPhone}` : '',
            `Szolgáltatás: ${booking.serviceName}`,
            `Időtartam: ${booking.duration} perc`,
            booking.notes ? `Megjegyzés: ${booking.notes}` : '',
            '',
            'Létrehozva a FoglaljVelem.hu rendszerrel – foglaljvelem.hu',
        ].filter(Boolean).join('\n'),
        start: {
            dateTime: startDateTime,
            timeZone: 'Europe/Budapest',
        },
        end: {
            dateTime: endDateTime,
            timeZone: 'Europe/Budapest',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 30 },
                { method: 'popup', minutes: 10 },
            ],
        },
        colorId: '9', // Blueberry
    };

    try {
        const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });

        if (!res.ok) {
            const err = await res.json();
            console.error('Google Calendar error:', err);
            return null;
        }

        const data = await res.json();
        return data.id; // Google Calendar event ID
    } catch (err) {
        console.error('Google Calendar error:', err);
        return null;
    }
}

// Remove a booking event from Google Calendar
export async function removeFromGoogleCalendar(accessToken, eventId) {
    if (!accessToken || !eventId) return;

    try {
        await fetch(`${CALENDAR_API}/calendars/primary/events/${eventId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
    } catch (err) {
        console.error('Google Calendar delete error:', err);
    }
}

// List today's events from Google Calendar
export async function getGoogleCalendarEvents(accessToken, date) {
    if (!accessToken) return [];

    const timeMin = `${date}T00:00:00+01:00`;
    const timeMax = `${date}T23:59:59+01:00`;

    try {
        const res = await fetch(
            `${CALENDAR_API}/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!res.ok) return [];
        const data = await res.json();
        return (data.items || []).map(e => ({
            id: e.id,
            title: e.summary,
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
            description: e.description,
        }));
    } catch (err) {
        console.error('Google Calendar fetch error:', err);
        return [];
    }
}
