'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import s from '../dashboard.module.css';

const CATEGORIES = [
    { value: 'tippek', label: 'Tippek' },
    { value: 'esettanulmany', label: 'Esettanulmány' },
    { value: 'ujdonsag', label: 'Újdonság' },
    { value: 'seo', label: 'Marketing' },
];

export default function DashboardBlogPage() {
    const { profile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [editingPost, setEditingPost] = useState(null); // null = list, object = editing
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('all');

    // Check if current user is admin (speedmarketing00@gmail.com owner)
    const isAdmin = profile?.id != null;

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        if (!isSupabaseConfigured || !supabase) return;
        setLoading(true);
        // Use service role via API to get all posts (including drafts)
        try {
            const res = await fetch('/api/blog?action=list');
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleNew = () => {
        setEditingPost({
            id: null, title: '', slug: '', excerpt: '', content: '',
            cover_image: '', category: 'tippek', tags: [], status: 'draft',
            author: 'FoglaljVelem', meta_title: '', meta_description: '',
        });
    };

    const handleEdit = (post) => {
        setEditingPost({ ...post, tags: post.tags || [] });
    };

    const handleSave = async (publish = false) => {
        if (!editingPost.title) return;
        setSaving(true);
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
            loadPosts();
        } catch (e) {
            alert('Hiba: ' + e.message);
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Biztosan törlöd ezt a posztot?')) return;
        try {
            await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', postId: id }),
            });
            loadPosts();
        } catch (e) { console.error(e); }
    };

    const handleUnpublish = async (post) => {
        try {
            await fetch('/api/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', post: { ...post, status: 'draft', published_at: null } }),
            });
            loadPosts();
        } catch (e) { console.error(e); }
    };

    const filtered = posts.filter(p => filter === 'all' ? true : p.status === filter);

    // ─── Editor view ───
    if (editingPost) {
        return (
            <div>
                <div className={s.topBar}>
                    <div className={s.topBarLeft}>
                        <h1>{editingPost.id ? 'Poszt szerkesztése ✏️' : 'Új blogposzt ✏️'}</h1>
                        <p>
                            <span style={{
                                padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                                background: editingPost.status === 'published' ? '#dcfce7' : '#fef9c3',
                                color: editingPost.status === 'published' ? '#166534' : '#854d0e',
                            }}>
                                {editingPost.status === 'published' ? '✓ Publikálva' : '📝 Vázlat'}
                            </span>
                        </p>
                    </div>
                    <div className={s.topBarRight} style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setEditingPost(null)} className="btn btn-secondary btn-sm">← Vissza</button>
                        <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-secondary btn-sm">
                            {saving ? '⏳...' : '💾 Mentés vázlatként'}
                        </button>
                        <button onClick={() => handleSave(true)} disabled={saving} className="btn btn-primary btn-sm">
                            {saving ? '⏳...' : '🚀 Publikálás'}
                        </button>
                    </div>
                </div>

                <div className={s.contentCard} style={{ padding: 32 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div className="input-group">
                            <label className="input-label">Cím *</label>
                            <input className="input" value={editingPost.title} placeholder="A cikk címe..."
                                onChange={e => setEditingPost(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Slug (URL)</label>
                            <input className="input" value={editingPost.slug} placeholder="automatikusan-generalt"
                                onChange={e => setEditingPost(p => ({ ...p, slug: e.target.value }))} />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 20 }}>
                        <label className="input-label">Rövid leírás (SEO excerpt)</label>
                        <textarea className="input" rows={2} value={editingPost.excerpt} placeholder="1-2 mondatos összefoglaló a keresőknek..."
                            onChange={e => setEditingPost(p => ({ ...p, excerpt: e.target.value }))} style={{ resize: 'vertical' }} />
                    </div>

                    <div className="input-group" style={{ marginBottom: 20 }}>
                        <label className="input-label">Tartalom (HTML) *</label>
                        <textarea className="input" rows={20} value={editingPost.content} placeholder="<h2>Alcím</h2><p>Szöveg...</p>"
                            onChange={e => setEditingPost(p => ({ ...p, content: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div className="input-group">
                            <label className="input-label">Kategória</label>
                            <select className="input" value={editingPost.category}
                                onChange={e => setEditingPost(p => ({ ...p, category: e.target.value }))}>
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Szerző</label>
                            <input className="input" value={editingPost.author}
                                onChange={e => setEditingPost(p => ({ ...p, author: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Borítókép URL</label>
                            <input className="input" value={editingPost.cover_image} placeholder="https://..."
                                onChange={e => setEditingPost(p => ({ ...p, cover_image: e.target.value }))} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div className="input-group">
                            <label className="input-label">SEO Title <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: '0.8rem' }}>(opcionális)</span></label>
                            <input className="input" value={editingPost.meta_title} placeholder="Ha más mint a cím..."
                                onChange={e => setEditingPost(p => ({ ...p, meta_title: e.target.value }))} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">SEO Description <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: '0.8rem' }}>(opcionális)</span></label>
                            <input className="input" value={editingPost.meta_description} placeholder="Ha más mint az excerpt..."
                                onChange={e => setEditingPost(p => ({ ...p, meta_description: e.target.value }))} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Címkék <span style={{ color: 'var(--gray-400)', fontWeight: 400, fontSize: '0.8rem' }}>(vesszővel elválasztva)</span></label>
                        <input className="input" value={(editingPost.tags || []).join(', ')} placeholder="időpontfoglalás, fodrász, tippek"
                            onChange={e => setEditingPost(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} />
                    </div>

                    {/* Preview */}
                    {editingPost.content && (
                        <div style={{ marginTop: 32, borderTop: '2px solid var(--gray-100)', paddingTop: 24 }}>
                            <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--gray-600)' }}>👁 Előnézet</h3>
                            <div
                                className="blog-content"
                                dangerouslySetInnerHTML={{ __html: editingPost.content }}
                                style={{ fontSize: '1rem', lineHeight: 1.8, color: '#374151', maxWidth: 680 }}
                            />
                        </div>
                    )}
                </div>

                <style>{`
                    .blog-content h2 { font-size: 1.3rem; font-weight: 700; color: #1e3a5f; margin: 24px 0 10px; }
                    .blog-content h3 { font-size: 1.1rem; font-weight: 700; color: #374151; margin: 20px 0 8px; }
                    .blog-content p { margin-bottom: 14px; }
                    .blog-content ul, .blog-content ol { margin-bottom: 14px; padding-left: 24px; }
                    .blog-content li { margin-bottom: 6px; }
                    .blog-content blockquote { border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 16px 0; background: #f0f7ff; border-radius: 0 10px 10px 0; font-style: italic; }
                    .blog-content .your-input { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 10px; padding: 12px 16px; margin: 12px 0; font-style: italic; color: #92400e; }
                `}</style>
            </div>
        );
    }

    // ─── List view ───
    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Blog kezelés 📝</h1>
                    <p>{posts.length} poszt összesen</p>
                </div>
                <div className={s.topBarRight}>
                    <button onClick={handleNew} className="btn btn-primary btn-sm">✏️ Új poszt</button>
                </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[
                    { val: 'all', label: 'Összes', count: posts.length },
                    { val: 'draft', label: '📝 Vázlat', count: posts.filter(p => p.status === 'draft').length },
                    { val: 'published', label: '✓ Publikált', count: posts.filter(p => p.status === 'published').length },
                ].map(f => (
                    <button key={f.val} onClick={() => setFilter(f.val)} className="btn btn-sm" style={{
                        background: filter === f.val ? 'var(--primary-500)' : 'white',
                        color: filter === f.val ? 'white' : 'var(--gray-600)',
                        border: `1.5px solid ${filter === f.val ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                    }}>
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={s.contentCard} style={{ padding: 40, textAlign: 'center' }}>
                    <p style={{ color: 'var(--gray-500)' }}>Betöltés...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className={s.contentCard} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>📝</div>
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Még nincsenek blogposztok</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Hozz létre az elsőt, vagy várd meg az automatikus generálást!</p>
                    <button onClick={handleNew} className="btn btn-primary">✏️ Új poszt írása</button>
                </div>
            ) : (
                <div className={s.contentCard}>
                    {filtered.map(post => (
                        <div key={post.id} style={{
                            display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                            borderBottom: '1px solid var(--gray-50)',
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                                        background: post.status === 'published' ? '#dcfce7' : '#fef9c3',
                                        color: post.status === 'published' ? '#166534' : '#854d0e',
                                    }}>
                                        {post.status === 'published' ? '✓ Publikálva' : '📝 Vázlat'}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, background: '#f3f4f6', color: '#6b7280' }}>
                                        {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                                    </span>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--gray-800)' }}>{post.title}</div>
                                {post.excerpt && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>
                                        {post.excerpt.length > 100 ? post.excerpt.slice(0, 100) + '...' : post.excerpt}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 4 }}>
                                    {post.published_at ? new Date(post.published_at).toLocaleDateString('hu-HU') : 'Nincs publikálva'}
                                    {post.author && ` • ${post.author}`}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                <button onClick={() => handleEdit(post)} className="btn btn-sm btn-secondary">✏️ Szerkesztés</button>
                                {post.status === 'draft' && (
                                    <button onClick={() => {
                                        setEditingPost({ ...post, tags: post.tags || [] });
                                        setTimeout(() => handleSave(true), 100);
                                    }} className="btn btn-sm btn-primary">🚀 Publikálás</button>
                                )}
                                {post.status === 'published' && (
                                    <button onClick={() => handleUnpublish(post)} className="btn btn-sm" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>
                                        ↩ Visszavonás
                                    </button>
                                )}
                                <button onClick={() => handleDelete(post.id)} className="btn btn-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
