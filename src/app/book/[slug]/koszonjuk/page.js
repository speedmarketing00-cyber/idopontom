'use client';
import { use, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import s from '../../book.module.css';

const businessTypeIcons = {
    'hair_salon': '💇', 'beauty_salon': '💅', 'barber': '💈',
    'nail_salon': '💅', 'massage': '💆', 'fitness': '🏋️',
    'doctor': '🏥', 'dentist': '🦷', 'consultant': '💼',
    'tutor': '📚', 'photographer': '📷', 'salon': '💇', 'other': '📅',
};

function KoszonjukContent({ slug }) {
    const searchParams = useSearchParams();

    const service  = searchParams.get('service')  || '';
    const date     = searchParams.get('date')     || '';
    const time     = searchParams.get('time')     || '';
    const duration = searchParams.get('duration') || '';
    const price    = searchParams.get('price')    || '';
    const name     = searchParams.get('name')     || '';
    const provider = searchParams.get('provider') || '';
    const avatar   = searchParams.get('avatar')   || '';
    const type     = searchParams.get('type')     || '';
    const pixel    = searchParams.get('pixel')    || '';

    // Format date to Hungarian
    const dateObj = date ? new Date(date + 'T12:00:00') : null;
    const formattedDate = dateObj
        ? dateObj.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
        : date;

    // Fire Meta Pixel Lead event on page load
    useEffect(() => {
        if (!pixel || typeof window === 'undefined') return;

        const firePixel = () => {
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'Lead', {
                    content_name: service,
                    value: parseFloat(price) || 0,
                    currency: 'HUF',
                    content_category: 'booking',
                });
            }
        };

        if (!window.fbq) {
            const script = document.createElement('script');
            script.innerHTML = `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixel}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(script);
            // Wait for fbq to load then fire Lead event
            setTimeout(firePixel, 800);
        } else {
            window.fbq('track', 'PageView');
            firePixel();
        }
    }, [pixel, service, price]);

    const icon = businessTypeIcons[type] || '📅';

    return (
        <div className={s.bookingPage}>
            <div className={s.bookingContainer}>
                {/* Provider header */}
                <div className={s.bookingHeader}>
                    {avatar ? (
                        <img src={avatar} alt={provider} style={{
                            width: 56, height: 56, borderRadius: 14,
                            objectFit: 'cover', border: '2px solid var(--gray-100)',
                        }} />
                    ) : (
                        <div className={s.providerAvatar}>{icon}</div>
                    )}
                    <h1 className={s.providerName}>{provider || 'Szolgáltató'}</h1>
                    {type && <p className={s.providerType}>{type}</p>}
                </div>

                {/* Success card */}
                <div className={s.bookingCard}>
                    <div className={s.confirmBox}>
                        <div className={s.confirmIcon}>🎉</div>
                        <h2 className={s.confirmTitle}>Sikeres foglalás!</h2>
                        <p className={s.confirmDesc}>
                            A foglalásod rögzítve lett. Hamarosan e-mail visszaigazolást kapsz.
                        </p>
                        <div className={s.summaryList}>
                            {service  && <SummaryRow label="Szolgáltatás" value={service} />}
                            {date     && <SummaryRow label="Dátum"        value={formattedDate} />}
                            {time     && <SummaryRow label="Időpont"       value={time} />}
                            {duration && <SummaryRow label="Időtartam"     value={`${duration} perc`} />}
                            {price    && <SummaryRow label="Ár"            value={`${Number(price).toLocaleString('hu-HU')} Ft`} />}
                            {name     && <SummaryRow label="Név"           value={name} />}
                        </div>
                        <Link href="/" className="btn btn-secondary" style={{ marginTop: 8 }}>
                            ← Vissza a főoldalra
                        </Link>
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 16 }}>
                    Működteti a{' '}
                    <Link href="/" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
                        FoglaljVelem.hu
                    </Link>
                </p>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid var(--gray-100)',
            fontSize: '0.9rem',
        }}>
            <span style={{ color: 'var(--gray-500)' }}>{label}</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{value}</span>
        </div>
    );
}

export default function KoszonjukPage({ params }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎉</div>
                    <p style={{ color: 'var(--gray-500)' }}>Betöltés...</p>
                </div>
            </div>
        }>
            <KoszonjukContent slug={resolvedParams.slug} />
        </Suspense>
    );
}
