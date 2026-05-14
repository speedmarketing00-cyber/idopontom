'use client';
import { useState, useEffect } from 'react';

const BLOG_CATEGORIES = [
    { value: 'tippek', label: 'Tippek' },
    { value: 'esettanulmany', label: 'Esettanulmány' },
    { value: 'ujdonsag', label: 'Újdonság' },
    { value: 'seo', label: 'Marketing' },
];

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);
    const [msg, setMsg] = useState('');
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'blog'

    // Blog state
    const [blogPosts, setBlogPosts] = useState([]);
    const [blogLoading, setBlogLoading] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [blogFilter, setBlogFilter] = useState('all');
    const [blogSaving, setBlogSaving] = useState(false);

    const adminFetch = async (action, extra = {}) => {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, password, ...extra }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data;
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const data = await adminFetch('list-profiles');
            setProfiles(data.profiles || []);
            const statsData = await adminFetch('stats');
            setStats(statsData);
            setAuthenticated(true);
        } catch (err) {
            setMsg('❌ ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfiles = async () => {
        const data = await adminFetch('list-profiles');
        setProfiles(data.profiles || []);
    };

    const updateTier = async (profileId, tier) => {
        try {
            await adminFetch('update-profile', { profileId, updates: { subscription_tier: tier } });
            setMsg(`✅ Csomag frissítve: ${tier}`);
            await refreshProfiles();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            setMsg('❌ ' + err.message);
        }
    };

    const updateProfile = async (profileId, updates) => {
        try {
            await adminFetch('update-profile', { profileId, updates });
            setMsg('✅ Profil frissítve!');
            setEditing(null);
            await refreshProfiles();
            setTimeout(() => setMsg(''), 2000);
        } catch (err) {
            setMsg('❌ ' + err.message);
        }
    };

    const impersonate = async (profileId, name) => {
        try {
            setMsg(`⏳ Belépés "${name}" fiókjába...`);
            const data = await adminFetch('impersonate', { profileId });
            if (data.url) {
                window.open(data.url, '_blank');
                setMsg(`✅ Megnyitva új fülben: "${name}"`);
            }
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg('❌ ' + err.message);
        }
    };

    const deleteProfile = async (profileId, name) => {
        if (!confirm(`Biztosan törlöd "${name}" fiókját? Ez nem visszavonható!`)) return;
        try {
            await adminFetch('delete-profile', { profileId });
            setMsg('✅ Fiók törölve.');
            await refreshProfiles();
        } catch (err) {
            setMsg('❌ ' + err.message);
        }
    };

    // ─── Blog functions ───
    const loadBlogPosts = async () => {
        setBlogLoading(true);
        try {
            const res = await fetch('/api/blog?action=list');
            const data = await res.json();
            setBlogPosts(data.posts || []);
        } catch (e) { console.error(e); }
        setBlogLoading(false);
    };

    const handleNewPost = () => {
        setEditingPost({
            id: null, title: '', slug: '', excerpt: '', content: '',
            cover_image: '', category: 'tippek', tags: [], status: 'draft',
            author: 'FoglaljVelem', meta_title: '', meta_description: '',
        });
    };

    const handleEditPost = (post) => {
        setEditingPost({ ...post, tags: post.tags || [] });
    };

    const handleSavePost = async (publish = false) => {
        if (!editingPost.title) return;
        setBlogSaving(true);
        try {
            const slug = editingPost.slug || editingPost.title.toLowerCase()
                .replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i')
                .replace(/[óòöő]/g, 'o').replace(/[úùüű]/g, 'u')
                .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);

            const payload = {
                ...editingPost,
                slug,
                status: publish ? 'published' : editingPost.status,
                published_at: publish ? new Date().toISOString() : editingPost.published_at,
                updated_at: new Date().toISOString(),
            };

            const res = await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: editingPost.id ? 'update' : 'create', post: payload }),
            });
            const result = await res.json();
            if (result.error) throw new Error(result.error);

            setEditingPost(null);
            setMsg('✅ Blog poszt mentve!');
            loadBlogPosts();
            setTimeout(() => setMsg(''), 2000);
        } catch (e) {
            setMsg('❌ ' + e.message);
        }
        setBlogSaving(false);
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Biztosan törlöd ezt a posztot?')) return;
        try {
            await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', postId: id }),
            });
            setMsg('✅ Poszt törölve.');
            loadBlogPosts();
            setTimeout(() => setMsg(''), 2000);
        } catch (e) { console.error(e); }
    };

    const handlePublishPost = async (post) => {
        try {
            await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'publish', postId: post.id }),
            });
            setMsg('✅ Poszt publikálva!');
            loadBlogPosts();
            setTimeout(() => setMsg(''), 2000);
        } catch (e) { setMsg('❌ ' + e.message); }
    };

    const handleUnpublishPost = async (post) => {
        try {
            await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', post: { ...post, status: 'draft', published_at: null } }),
            });
            setMsg('✅ Poszt visszavonva vázlatba.');
            loadBlogPosts();
            setTimeout(() => setMsg(''), 2000);
        } catch (e) { console.error(e); }
    };

    // Load blog posts when switching to blog tab
    useEffect(() => {
        if (activeTab === 'blog' && authenticated && blogPosts.length === 0) {
            loadBlogPosts();
        }
    }, [activeTab, authenticated]);

    const filtered = profiles.filter(p =>
        (p.business_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.slug || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredBlogPosts = blogPosts.filter(p => blogFilter === 'all' ? true : p.status === blogFilter);

    const tierColors = { free: '#6b7280', basic: '#2563eb', pro: '#7c3aed' };
    const tierLabels = { free: 'Ingyenes', basic: 'Alap ⭐', pro: 'Profi 🏢' };

    const inputStyle = { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.9rem', width: '100%', outline: 'none', background: 'white' };
    const labelStyle = { fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 };

    // Login screen
    if (!authenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                <div style={{ background: 'white', borderRadius: 20, padding: 48, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔐</div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Admin Panel</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>FoglaljVelem.hu kezelőpanel</p>
                    </div>
                    {msg && <div style={{ padding: 12, borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}
                    <div style={{ marginBottom: 16 }}>
                        <input type="password" placeholder="Admin jelszó" value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: '1rem', outline: 'none' }} />
                    </div>
                    <button onClick={handleLogin} disabled={loading}
                        style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                        {loading ? '⏳ Betöltés...' : '🔓 Belépés'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'var(--font-body, system-ui)' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '24px 32px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>🔐 Admin Panel</h1>
                        <p style={{ opacity: 0.7, fontSize: '0.85rem', margin: '4px 0 0' }}>FoglaljVelem.hu kezelőpanel</p>
                    </div>
                    <button onClick={() => { setAuthenticated(false); setPassword(''); }}
                        style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', cursor: 'pointer' }}>
                        🚪 Kilépés
                    </button>
                </div>
                {/* Tab switcher */}
                <div style={{ maxWidth: 1200, margin: '16px auto 0', display: 'flex', gap: 4 }}>
                    {[
                        { id: 'users', label: '👥 Felhasználók', count: profiles.length },
                        { id: 'blog', label: '📝 Blog', count: blogPosts.length },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditingPost(null); }}
                            style={{
                                padding: '10px 20px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                                background: activeTab === tab.id ? '#f1f5f9' : 'rgba(255,255,255,0.1)',
                                color: activeTab === tab.id ? '#1e1b4b' : 'rgba(255,255,255,0.7)',
                            }}>
                            {tab.label} {tab.count > 0 && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({tab.count})</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>
                {msg && <div style={{ padding: 12, borderRadius: 10, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#16a34a' : '#dc2626', fontSize: '0.9rem', marginBottom: 16, fontWeight: 500 }}>{msg}</div>}

                {/* ═══════════════════════ USERS TAB ═══════════════════════ */}
                {activeTab === 'users' && (
                    <>
                        {/* Stats */}
                        {stats && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                                {[
                                    { label: 'Összes fiók', value: stats.totalProfiles, icon: '👥', color: '#3b82f6' },
                                    { label: 'Összes foglalás', value: stats.totalBookings, icon: '📅', color: '#10b981' },
                                    { label: 'Összes szolgáltatás', value: stats.totalServices, icon: '💼', color: '#8b5cf6' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div style={{ marginBottom: 16 }}>
                            <input placeholder="🔍 Keresés név, vállalkozás vagy slug alapján..." value={search} onChange={e => setSearch(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: '0.95rem', outline: 'none' }} />
                        </div>

                        {/* Profiles */}
                        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
                                {filtered.length} fiók {search ? `("${search}")` : ''}
                            </div>

                            {filtered.map(p => (
                                <div key={p.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 16 }}>
                                    {/* Avatar */}
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4f46e5', flexShrink: 0 }}>
                                        {(p.business_name || p.name || '?')[0]?.toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>{p.business_name || 'Névtelen'}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            {p.name} • {p.slug} • {new Date(p.created_at).toLocaleDateString('hu-HU')}
                                        </div>
                                    </div>

                                    {/* Services & Bookings count */}
                                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                                        <div style={{ fontWeight: 700, color: '#374151' }}>{p.services?.[0]?.count ?? 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>szolg.</div>
                                    </div>
                                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                                        <div style={{ fontWeight: 700, color: '#374151' }}>{p.bookings?.[0]?.count ?? 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>fogl.</div>
                                    </div>

                                    {/* Tier selector */}
                                    <select value={p.subscription_tier || 'free'}
                                        onChange={e => updateTier(p.id, e.target.value)}
                                        style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid #e5e7eb', fontWeight: 600, fontSize: '0.85rem', color: tierColors[p.subscription_tier || 'free'], cursor: 'pointer', background: 'white' }}>
                                        <option value="free">🆓 Ingyenes</option>
                                        <option value="basic">⭐ Alap</option>
                                        <option value="pro">🏢 Profi</option>
                                    </select>

                                    {/* Actions */}
                                    <button onClick={() => setEditing(editing === p.id ? null : p.id)}
                                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        ✏️
                                    </button>
                                    <button onClick={() => impersonate(p.id, p.business_name || p.name)}
                                        title="Belépés az ő dashboardjára"
                                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #c7d2fe', background: '#eef2ff', cursor: 'pointer', fontSize: '0.85rem', color: '#4f46e5' }}>
                                        🔑
                                    </button>
                                    <button onClick={() => window.open(`/book/${p.slug}`, '_blank')}
                                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        🔗
                                    </button>
                                    <button onClick={() => deleteProfile(p.id, p.business_name)}
                                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626' }}>
                                        🗑️
                                    </button>

                                    {/* Edit panel */}
                                    {editing === p.id && (
                                        <EditPanel profile={p} onSave={(updates) => updateProfile(p.id, updates)} onCancel={() => setEditing(null)} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ═══════════════════════ BLOG TAB ═══════════════════════ */}
                {activeTab === 'blog' && !editingPost && (
                    <>
                        {/* Blog header bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1f2937', margin: 0 }}>Blog kezelés</h2>
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0' }}>{blogPosts.length} poszt összesen</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => window.open('/blog', '_blank')}
                                    style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>
                                    🌐 Blog megtekintése
                                </button>
                                <button onClick={handleNewPost}
                                    style={{ padding: '10px 20px', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                    ✏️ Új poszt
                                </button>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {[
                                { val: 'all', label: 'Összes', count: blogPosts.length },
                                { val: 'draft', label: '📝 Vázlat', count: blogPosts.filter(p => p.status === 'draft').length },
                                { val: 'published', label: '✓ Publikált', count: blogPosts.filter(p => p.status === 'published').length },
                            ].map(f => (
                                <button key={f.val} onClick={() => setBlogFilter(f.val)}
                                    style={{
                                        padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                        border: `2px solid ${blogFilter === f.val ? '#4f46e5' : '#e5e7eb'}`,
                                        background: blogFilter === f.val ? '#eef2ff' : 'white',
                                        color: blogFilter === f.val ? '#4f46e5' : '#6b7280',
                                    }}>
                                    {f.label} ({f.count})
                                </button>
                            ))}
                        </div>

                        {/* Blog list */}
                        {blogLoading ? (
                            <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <p style={{ color: '#6b7280' }}>Betöltés...</p>
                            </div>
                        ) : filteredBlogPosts.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
                                <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#374151' }}>Még nincsenek blogposztok</h3>
                                <p style={{ color: '#6b7280', marginBottom: 24 }}>Hozz létre az elsőt, vagy várd meg az automatikus generálást!</p>
                                <button onClick={handleNewPost}
                                    style={{ padding: '12px 24px', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                                    ✏️ Új poszt írása
                                </button>
                            </div>
                        ) : (
                            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                {filteredBlogPosts.map(post => (
                                    <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span style={{
                                                    padding: '2px 10px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                                                    background: post.status === 'published' ? '#dcfce7' : '#fef9c3',
                                                    color: post.status === 'published' ? '#166534' : '#854d0e',
                                                }}>
                                                    {post.status === 'published' ? '✓ Publikálva' : '📝 Vázlat'}
                                                </span>
                                                <span style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 10, background: '#f3f4f6', color: '#6b7280' }}>
                                                    {BLOG_CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                                                </span>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>{post.title}</div>
                                            {post.excerpt && (
                                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>
                                                    {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + '...' : post.excerpt}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>
                                                {post.published_at ? new Date(post.published_at).toLocaleDateString('hu-HU') : 'Nincs publikálva'}
                                                {post.author && ` • ${post.author}`}
                                                {post.slug && ` • /blog/${post.slug}`}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                            <button onClick={() => handleEditPost(post)}
                                                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                                ✏️ Szerkesztés
                                            </button>
                                            {post.status === 'draft' && (
                                                <button onClick={() => handlePublishPost(post)}
                                                    style={{ padding: '8px 14px', borderRadius: 8, background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    🚀 Publikálás
                                                </button>
                                            )}
                                            {post.status === 'published' && (
                                                <button onClick={() => handleUnpublishPost(post)}
                                                    style={{ padding: '8px 14px', borderRadius: 8, background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    ↩ Visszavonás
                                                </button>
                                            )}
                                            {post.status === 'published' && (
                                                <button onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                    🔗
                                                </button>
                                            )}
                                            <button onClick={() => handleDeletePost(post.id)}
                                                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', fontSize: '0.85rem', color: '#dc2626' }}>
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ═══════════════════════ BLOG EDITOR ═══════════════════════ */}
                {activeTab === 'blog' && editingPost && (
                    <>
                        {/* Editor header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button onClick={() => setEditingPost(null)}
                                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                    ← Vissza
                                </button>
                                <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1f2937', margin: 0 }}>
                                    {editingPost.id ? 'Poszt szerkesztése' : 'Új blogposzt'}
                                </h2>
                                <span style={{
                                    padding: '3px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                                    background: editingPost.status === 'published' ? '#dcfce7' : '#fef9c3',
                                    color: editingPost.status === 'published' ? '#166534' : '#854d0e',
                                }}>
                                    {editingPost.status === 'published' ? '✓ Publikálva' : '📝 Vázlat'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleSavePost(false)} disabled={blogSaving}
                                    style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>
                                    {blogSaving ? '⏳...' : '💾 Mentés vázlatként'}
                                </button>
                                <button onClick={() => handleSavePost(true)} disabled={blogSaving}
                                    style={{ padding: '10px 18px', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                    {blogSaving ? '⏳...' : '🚀 Publikálás'}
                                </button>
                            </div>
                        </div>

                        {/* Editor form */}
                        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={labelStyle}>Cím *</label>
                                    <input style={inputStyle} value={editingPost.title} placeholder="A cikk címe..."
                                        onChange={e => setEditingPost(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Slug (URL)</label>
                                    <input style={inputStyle} value={editingPost.slug} placeholder="automatikusan-generalt"
                                        onChange={e => setEditingPost(p => ({ ...p, slug: e.target.value }))} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>Rövid leírás (SEO excerpt)</label>
                                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={editingPost.excerpt} placeholder="1-2 mondatos összefoglaló a keresőknek..."
                                    onChange={e => setEditingPost(p => ({ ...p, excerpt: e.target.value }))} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>Tartalom (HTML) *</label>
                                <textarea style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} rows={20}
                                    value={editingPost.content} placeholder="<h2>Alcím</h2><p>Szöveg...</p>"
                                    onChange={e => setEditingPost(p => ({ ...p, content: e.target.value }))} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={labelStyle}>Kategória</label>
                                    <select style={inputStyle} value={editingPost.category}
                                        onChange={e => setEditingPost(p => ({ ...p, category: e.target.value }))}>
                                        {BLOG_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Szerző</label>
                                    <input style={inputStyle} value={editingPost.author}
                                        onChange={e => setEditingPost(p => ({ ...p, author: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Borítókép URL</label>
                                    <input style={inputStyle} value={editingPost.cover_image} placeholder="https://..."
                                        onChange={e => setEditingPost(p => ({ ...p, cover_image: e.target.value }))} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <label style={labelStyle}>SEO Title <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcionális)</span></label>
                                    <input style={inputStyle} value={editingPost.meta_title} placeholder="Ha más mint a cím..."
                                        onChange={e => setEditingPost(p => ({ ...p, meta_title: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={labelStyle}>SEO Description <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcionális)</span></label>
                                    <input style={inputStyle} value={editingPost.meta_description} placeholder="Ha más mint az excerpt..."
                                        onChange={e => setEditingPost(p => ({ ...p, meta_description: e.target.value }))} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>Címkék <span style={{ color: '#9ca3af', fontWeight: 400 }}>(vesszővel elválasztva)</span></label>
                                <input style={inputStyle} value={(editingPost.tags || []).join(', ')} placeholder="időpontfoglalás, fodrász, tippek"
                                    onChange={e => setEditingPost(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} />
                            </div>

                            {/* Preview */}
                            {editingPost.content && (
                                <div style={{ marginTop: 32, borderTop: '2px solid #f3f4f6', paddingTop: 24 }}>
                                    <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#6b7280', fontSize: '0.9rem' }}>👁 Előnézet</h3>
                                    <div
                                        className="blog-content"
                                        dangerouslySetInnerHTML={{ __html: editingPost.content }}
                                        style={{ fontSize: '1rem', lineHeight: 1.8, color: '#374151', maxWidth: 680 }}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Blog content preview styles */}
            <style>{`
                .blog-content h2 { font-size: 1.3rem; font-weight: 700; color: #1e3a5f; margin: 24px 0 10px; }
                .blog-content h3 { font-size: 1.1rem; font-weight: 700; color: #374151; margin: 20px 0 8px; }
                .blog-content p { margin-bottom: 14px; }
                .blog-content ul, .blog-content ol { margin-bottom: 14px; padding-left: 24px; }
                .blog-content li { margin-bottom: 6px; }
                .blog-content strong { color: #1e3a5f; }
                .blog-content a { color: #2563eb; text-decoration: underline; }
                .blog-content blockquote { border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 16px 0; background: #f0f7ff; border-radius: 0 10px 10px 0; font-style: italic; }
                .blog-content img { max-width: 100%; border-radius: 12px; margin: 16px 0; }
                .blog-content .your-input { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 10px; padding: 12px 16px; margin: 12px 0; font-style: italic; color: #92400e; }
            `}</style>
        </div>
    );
}

function EditPanel({ profile, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: profile.name || '',
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
        phone: profile.phone || '',
        slug: profile.slug || '',
        description: profile.description || '',
        city: profile.city || '',
        address: profile.address || '',
        subscription_tier: profile.subscription_tier || 'free',
    });

    const inputStyle = { padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.9rem', width: '100%', outline: 'none' };

    return (
        <div style={{ width: '100%', padding: '20px 0 0', borderTop: '1px solid #e5e7eb', marginTop: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Név</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Vállalkozás</label>
                    <input style={inputStyle} value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Slug</label>
                    <input style={inputStyle} value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Telefon</label>
                    <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Város</label>
                    <input style={inputStyle} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Csomag</label>
                    <select style={inputStyle} value={form.subscription_tier} onChange={e => setForm(p => ({ ...p, subscription_tier: e.target.value }))}>
                        <option value="free">Ingyenes</option>
                        <option value="basic">Alap</option>
                        <option value="pro">Profi</option>
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={() => onSave(form)}
                    style={{ padding: '10px 20px', borderRadius: 10, background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    💾 Mentés
                </button>
                <button onClick={onCancel}
                    style={{ padding: '10px 20px', borderRadius: 10, background: '#f3f4f6', color: '#374151', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    Mégse
                </button>
            </div>
        </div>
    );
}
