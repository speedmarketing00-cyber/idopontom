'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();
    const handled = useRef(false);

    useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        async function handleCallback() {
            // Wait a moment for Supabase to process the hash fragment
            await new Promise(r => setTimeout(r, 500));

            if (!isSupabaseConfigured || !supabase) {
                router.push('/dashboard');
                return;
            }

            // Try to get the session (Supabase processes hash automatically)
            let attempts = 0;
            let session = null;
            while (attempts < 10 && !session) {
                const { data } = await supabase.auth.getSession();
                session = data?.session;
                if (!session) {
                    await new Promise(r => setTimeout(r, 500));
                    attempts++;
                }
            }

            if (session?.user) {
                // Check if profile exists
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('business_name')
                    .eq('user_id', session.user.id)
                    .single();

                if (profile?.business_name) {
                    router.push('/dashboard');
                } else {
                    router.push('/auth/complete-profile');
                }
            } else {
                router.push('/auth/login');
            }
        }

        handleCallback();
    }, [router]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #fffdf0 50%, #e0efff 100%)',
        }}>
            <div style={{
                background: 'white', borderRadius: 20, padding: 48,
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)', textAlign: 'center',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16, animation: 'pulse 1.5s infinite' }}>📅</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Bejelentkezés...</h2>
                <p style={{ color: 'var(--gray-500)' }}>Kérlek várj, amíg átirányítunk.</p>
            </div>
        </div>
    );
}

