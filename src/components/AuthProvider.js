'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [teamMemberInfo, setTeamMemberInfo] = useState(null); // { teamMemberId, ownerProfileId, ownerProfile }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isSupabaseConfigured && supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                if (session?.user) fetchProfile(session.user.id, session.user.email);
                else setLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) fetchProfile(session.user.id, session.user.email);
                else { setProfile(null); setTeamMemberInfo(null); setLoading(false); }
            });

            return () => subscription.unsubscribe();
        } else {
            const stored = localStorage.getItem('idopontom_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                setUser({ id: 'demo', email: parsed.email });
                setProfile(parsed);
            }
            setLoading(false);
        }
    }, []);

    const fetchProfile = async (userId, userEmail) => {
        if (!supabase) return;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (data) setProfile(data);

        // Check if this user is also a team member of someone
        if (userEmail) {
            const { data: teamRecord } = await supabase
                .from('team_members')
                .select('*, profiles!team_members_profile_id_fkey(*)')
                .eq('email', userEmail)
                .eq('is_active', true)
                .maybeSingle();

            if (teamRecord?.profiles) {
                setTeamMemberInfo({
                    teamMemberId: teamRecord.id,
                    teamMemberName: teamRecord.name,
                    teamMemberRole: teamRecord.role,
                    ownerProfileId: teamRecord.profile_id,
                    ownerProfile: teamRecord.profiles,
                });
                // If no own profile exists yet, use owner's profile data as base
                if (!data) {
                    setProfile({
                        ...teamRecord.profiles,
                        name: teamRecord.name,
                        _isTeamMemberOnly: true,
                    });
                }
            }
        }

        setLoading(false);
    };

    const signIn = async (email, password) => {
        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        } else {
            const demoUser = { email, name: email.split('@')[0], businessName: 'Demo Szalon', tier: 'free', slug: 'demo-szalon' };
            localStorage.setItem('idopontom_user', JSON.stringify(demoUser));
            setUser({ id: 'demo', email });
            setProfile(demoUser);
            return demoUser;
        }
    };

    // Google OAuth
    const signInWithGoogle = async () => {
        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
            return data;
        } else {
            const demoUser = { email: 'google@demo.hu', name: 'Google Felhasználó', businessName: 'Demo Szalon', tier: 'free', slug: 'demo-google' };
            localStorage.setItem('idopontom_user', JSON.stringify(demoUser));
            setUser({ id: 'demo', email: demoUser.email });
            setProfile(demoUser);
            return demoUser;
        }
    };

    // Apple OAuth
    const signInWithApple = async () => {
        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
            return data;
        } else {
            const demoUser = { email: 'apple@demo.hu', name: 'Apple Felhasználó', businessName: 'Demo Szalon', tier: 'free', slug: 'demo-apple' };
            localStorage.setItem('idopontom_user', JSON.stringify(demoUser));
            setUser({ id: 'demo', email: demoUser.email });
            setProfile(demoUser);
            return demoUser;
        }
    };

    const signUp = async (email, password, metadata) => {
        if (isSupabaseConfigured && supabase) {
            const slug = metadata.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36).slice(-4);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name: metadata.name, business_name: metadata.business_name, business_type: metadata.business_type, slug }
                }
            });
            if (error) throw error;
            return data;
        } else {
            const slug = metadata.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const demoUser = { email, name: metadata.name, businessName: metadata.business_name, businessType: metadata.business_type, slug, tier: 'free' };
            localStorage.setItem('idopontom_user', JSON.stringify(demoUser));
            setUser({ id: 'demo', email });
            setProfile(demoUser);
            return demoUser;
        }
    };

    const signOut = async () => {
        if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('idopontom_user');
        setUser(null);
        setProfile(null);
    };

    const updateProfile = async (updates) => {
        if (isSupabaseConfigured && supabase && profile?.id) {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', profile.id)
                .select()
                .single();
            if (error) throw error;
            setProfile(data);
            return data;
        } else {
            const updated = { ...profile, ...updates };
            localStorage.setItem('idopontom_user', JSON.stringify(updated));
            setProfile(updated);
            return updated;
        }
    };

    // Get Google Calendar access token (if logged in with Google)
    const getGoogleAccessToken = async () => {
        if (!isSupabaseConfigured || !supabase) return null;
        const { data: { session } } = await supabase.auth.getSession();
        return session?.provider_token || null;
    };

    return (
        <AuthContext.Provider value={{
            user, profile, loading, signIn, signUp, signOut,
            signInWithGoogle, updateProfile,
            getGoogleAccessToken, isSupabaseConfigured,
            teamMemberInfo,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
