// Email helper – sends emails via the /api/email route
export async function sendBookingEmail(type, data) {
    try {
        const res = await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data }),
        });
        if (!res.ok) {
            const err = await res.json();
            console.warn('Email sending failed:', err);
            return false;
        }
        return true;
    } catch (err) {
        console.warn('Email sending error:', err);
        return false;
    }
}

// Send booking confirmation to client
export function sendBookingConfirmation({ clientName, clientEmail, serviceName, date, time, duration, providerName, providerAddress }) {
    return sendBookingEmail('booking_confirmation', { clientName, clientEmail, serviceName, date, time, duration, providerName, providerAddress });
}

// Send reminder to client (for tomorrow's bookings)
export function sendBookingReminder({ clientName, clientEmail, serviceName, date, time, providerName }) {
    return sendBookingEmail('booking_reminder', { clientName, clientEmail, serviceName, date, time, providerName });
}

// Send cancellation notice to client
export function sendBookingCancelled({ clientName, clientEmail, serviceName, date, time, providerName }) {
    return sendBookingEmail('booking_cancelled', { clientName, clientEmail, serviceName, date, time, providerName });
}

// Notify provider about new booking
export function notifyProviderNewBooking({ providerEmail, providerName, clientName, clientEmail, clientPhone, serviceName, date, time }) {
    return sendBookingEmail('new_booking_provider', { providerEmail, providerName, clientName, clientEmail, clientPhone, serviceName, date, time });
}
