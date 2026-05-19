'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CancelBookingPage() {
  const { token } = useParams();
  const [booking, setBooking] = useState(null);
  const [canCancel, setCanCancel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/booking/cancel?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setResult('not_found');
          setErrorMsg(data.error);
        } else {
          setBooking(data.booking);
          setCanCancel(data.canCancel);
          // Already cancelled
          if (data.booking?.status === 'cancelled') {
            setResult('already_cancelled');
          }
        }
      })
      .catch(() => {
        setResult('not_found');
        setErrorMsg('Hiba történt a foglalás betöltésekor.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleCancel = async () => {
    if (!token || cancelling) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        setResult('success');
      } else {
        setResult('error');
        setErrorMsg(data.error || 'Nem sikerült lemondani a foglalást.');
      }
    } catch {
      setResult('error');
      setErrorMsg('Hálózati hiba. Kérlek próbáld újra.');
    } finally {
      setCancelling(false);
    }
  };

  const formattedDate = booking?.date
    ? new Date(booking.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    : '';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4f8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '40px 32px',
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
      }}>
        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
            <p style={{ color: '#6b7280' }}>Foglalás betöltése...</p>
          </div>
        )}

        {/* Not found */}
        {result === 'not_found' && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>🔍</span>
            <h1 style={{ fontSize: '1.3rem', color: '#1e3a5f', marginBottom: 8 }}>Foglalás nem található</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{errorMsg}</p>
          </div>
        )}

        {/* Already cancelled */}
        {result === 'already_cancelled' && booking && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>ℹ️</span>
            <h1 style={{ fontSize: '1.3rem', color: '#6b7280', marginBottom: 8 }}>Ez a foglalás már le lett mondva</h1>
            <div style={{ background: '#f3f4f6', borderRadius: 12, padding: 16, marginTop: 16, textAlign: 'left' }}>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#374151' }}><strong>{booking.serviceName}</strong></p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#6b7280' }}>{formattedDate} – {booking.time}</p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#6b7280' }}>{booking.providerName}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {result === 'success' && booking && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>✅</span>
            <h1 style={{ fontSize: '1.3rem', color: '#059669', marginBottom: 8 }}>Foglalás sikeresen lemondva!</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 20 }}>E-mailben is küldtünk megerősítést.</p>
            <div style={{ background: '#fef2f2', borderRadius: 12, padding: 16, textAlign: 'left' }}>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#374151', textDecoration: 'line-through' }}><strong>{booking.serviceName}</strong></p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#6b7280', textDecoration: 'line-through' }}>{formattedDate} – {booking.time}</p>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#6b7280' }}>{booking.providerName}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {result === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>⚠️</span>
            <h1 style={{ fontSize: '1.3rem', color: '#dc2626', marginBottom: 8 }}>Hiba történt</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{errorMsg}</p>
          </div>
        )}

        {/* Booking found — show cancel form */}
        {!loading && !result && booking && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>❌</span>
              <h1 style={{ fontSize: '1.3rem', color: '#1e3a5f', marginBottom: 4 }}>Foglalás lemondása</h1>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Biztosan le szeretnéd mondani az alábbi foglalást?</p>
            </div>

            {/* Booking details */}
            <div style={{ background: '#f0f7ff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '0.85rem' }}>📋 Szolgáltatás:</td>
                    <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>{booking.serviceName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '0.85rem' }}>📅 Dátum:</td>
                    <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>{formattedDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '0.85rem' }}>🕐 Időpont:</td>
                    <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>{booking.time}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '0.85rem' }}>🏢 Szolgáltató:</td>
                    <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>{booking.providerName}</td>
                  </tr>
                  {booking.price > 0 && (
                    <tr>
                      <td style={{ padding: '8px 0', color: '#6b7280', fontSize: '0.85rem' }}>💰 Ár:</td>
                      <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right' }}>{Number(booking.price).toLocaleString('hu-HU')} Ft</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Deadline warning */}
            {!canCancel ? (
              <div style={{ background: '#fffdf0', borderRadius: 12, padding: 16, border: '1px solid #fde68a', marginBottom: 20 }}>
                <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                  ⏰ A lemondási határidő lejárt!
                </p>
                <p style={{ margin: '8px 0 0', color: '#a16207', fontSize: '0.8rem', textAlign: 'center' }}>
                  A foglalás csak az időpont előtti nap 20:00-ig mondható le. Ha le szeretnéd mondani, kérjük vedd fel a kapcsolatot a szolgáltatóval közvetlenül.
                </p>
              </div>
            ) : (
              <>
                {/* Modify option */}
                {booking.providerSlug && (
                  <a
                    href={`/book/${booking.providerSlug}?modify=${token}`}
                    style={{
                      display: 'block', padding: '14px', borderRadius: 12, border: '2px solid #3b82f6',
                      background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.95rem',
                      textAlign: 'center', textDecoration: 'none', marginBottom: 12,
                      transition: 'all 0.2s',
                    }}
                  >
                    🔄 Időpont módosítása
                  </a>
                )}

                <div style={{ background: '#fffdf0', borderRadius: 12, padding: 12, border: '1px solid #fde68a', marginBottom: 12 }}>
                  <p style={{ margin: 0, color: '#92400e', fontSize: '0.8rem', textAlign: 'center' }}>
                    ⚠️ A lemondás végleges és nem vonható vissza.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => window.close()}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #e5e7eb',
                      background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                      color: '#374151',
                    }}
                  >
                    Mégsem
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      flex: 1, padding: '14px', borderRadius: 12, border: 'none',
                      background: cancelling ? '#fca5a5' : '#dc2626', color: 'white',
                      cursor: cancelling ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {cancelling ? 'Lemondás...' : '❌ Lemondás'}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem', marginTop: 24, marginBottom: 0 }}>
          FoglaljVelem.hu – Online időpontfoglalás
        </p>
      </div>
    </div>
  );
}
