'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import s from '../dashboard.module.css';

const STATUS_MAP = {
    draft: { label: 'Piszkozat', color: '#6b7280', bg: '#f3f4f6' },
    issued: { label: 'Kiállítva', color: '#2563eb', bg: '#eff6ff' },
    paid: { label: 'Fizetve', color: '#16a34a', bg: '#f0fdf4' },
    cancelled: { label: 'Visszavonva', color: '#dc2626', bg: '#fef2f2' },
    storno: { label: 'Sztornó', color: '#dc2626', bg: '#fef2f2' },
};

const PAYMENT_MAP = {
    transfer: 'Átutalás',
    cash: 'Készpénz',
    card: 'Bankkártya',
    other: 'Egyéb',
};

const VAT_OPTIONS = [
    { value: 27, label: '27%' },
    { value: 18, label: '18%' },
    { value: 5, label: '5%' },
    { value: 0, label: '0% (Mentes)' },
];

const emptyItem = () => ({ description: '', quantity: 1, unit: 'db', unit_price: 0, vat_rate: 27 });

export default function InvoicesPage() {
    const { profile } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [filter, setFilter] = useState('all');
    const [settings, setSettings] = useState(null);

    // Create form state
    const [form, setForm] = useState({
        client_name: '',
        client_tax_number: '',
        client_address: '',
        client_city: '',
        client_zip: '',
        client_email: '',
        issue_date: new Date().toISOString().split('T')[0],
        fulfillment_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
        payment_method: 'transfer',
        notes: '',
    });
    const [items, setItems] = useState([emptyItem()]);
    const [createError, setCreateError] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        if (!profile?.id) return;
        loadInvoices();
        loadSettings();
    }, [profile?.id]);

    const loadInvoices = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('invoices')
            .select('*')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false });
        setInvoices(data || []);
        setLoading(false);
    };

    const loadSettings = async () => {
        const { data } = await supabase
            .from('invoice_settings')
            .select('*')
            .eq('profile_id', profile.id)
            .maybeSingle();
        setSettings(data);
    };

    // Calculate item totals
    const calcItem = (item) => {
        const net = Math.round(item.quantity * item.unit_price);
        const vat = Math.round(net * item.vat_rate / 100);
        return { net, vat, gross: net + vat };
    };

    const totals = items.reduce((acc, item) => {
        const c = calcItem(item);
        return { net: acc.net + c.net, vat: acc.vat + c.vat, gross: acc.gross + c.gross };
    }, { net: 0, vat: 0, gross: 0 });

    const updateItem = (idx, key, value) => {
        setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item));
    };

    const addItem = () => setItems(prev => [...prev, emptyItem()]);
    const removeItem = (idx) => setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

    const handleCreate = async (asDraft = false) => {
        setCreateError('');
        setCreateLoading(true);

        try {
            if (!settings?.company_name || !settings?.tax_number) {
                setCreateError('Először töltsd ki a cégadatokat a "Cégadatok" menüpontban!');
                setCreateLoading(false);
                return;
            }
            if (!form.client_name) {
                setCreateError('Az ügyfél neve kötelező!');
                setCreateLoading(false);
                return;
            }
            if (items.some(it => !it.description || it.unit_price <= 0)) {
                setCreateError('Minden tételnek kell megnevezés és pozitív egységár!');
                setCreateLoading(false);
                return;
            }

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    profileId: profile.id,
                    invoice: {
                        ...form,
                        status: asDraft ? 'draft' : 'issued',
                        net_amount: totals.net,
                        vat_amount: totals.vat,
                        gross_amount: totals.gross,
                    },
                    items: items.map((item, idx) => {
                        const c = calcItem(item);
                        return { ...item, net_amount: c.net, vat_amount: c.vat, gross_amount: c.gross, sort_order: idx };
                    }),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Hiba történt');

            // Reset form and go back to list
            setForm({
                client_name: '', client_tax_number: '', client_address: '', client_city: '',
                client_zip: '', client_email: '',
                issue_date: new Date().toISOString().split('T')[0],
                fulfillment_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
                payment_method: 'transfer', notes: '',
            });
            setItems([emptyItem()]);
            setView('list');
            await loadInvoices();
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleStatusChange = async (invoiceId, newStatus) => {
        const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update-status', invoiceId, profileId: profile.id, status: newStatus }),
        });
        if (res.ok) await loadInvoices();
    };

    const handleDownloadPdf = async (invoiceId) => {
        const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'generate-pdf', invoiceId, profileId: profile.id }),
        });
        const data = await res.json();
        if (data.html) {
            // Open HTML invoice in new tab for printing/saving as PDF
            const win = window.open('', '_blank');
            win.document.write(data.html);
            win.document.close();
        }
    };

    const handleSendEmail = async (invoice) => {
        if (!invoice.client_email) {
            alert('Az ügyfélnek nincs email címe megadva!');
            return;
        }
        const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send-email', invoiceId: invoice.id, profileId: profile.id }),
        });
        const data = await res.json();
        if (res.ok) alert('✅ Számla elküldve: ' + invoice.client_email);
        else alert('❌ Hiba: ' + (data.error || 'Sikertelen'));
    };

    const handleViewDetail = async (invoice) => {
        // Load items for this invoice
        const { data: invoiceItems } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id)
            .order('sort_order');
        setSelectedInvoice({ ...invoice, items: invoiceItems || [] });
        setView('detail');
    };

    const filteredInvoices = filter === 'all' ? invoices : invoices.filter(inv => inv.status === filter);

    // ===================== LIST VIEW =====================
    if (view === 'list') {
        return (
            <div>
                <div className={s.topBar}>
                    <div className={s.topBarLeft}>
                        <h1>Számlázás 🧾</h1>
                        <p>{invoices.length} számla</p>
                    </div>
                    <div className={s.topBarRight}>
                        <button onClick={() => setView('create')} className="btn btn-primary btn-sm">
                            + Új számla
                        </button>
                    </div>
                </div>

                {!settings?.company_name && (
                    <div style={{
                        padding: '16px 20px', borderRadius: 12, marginBottom: 20,
                        background: '#fffbeb', border: '1px solid #fcd34d', fontSize: '0.9rem', color: '#92400e', lineHeight: 1.6
                    }}>
                        ⚠️ <strong>Először töltsd ki a cégadataidat!</strong> Menj a <strong>Cégadatok</strong> menüpontra a bal oldali menüben.
                    </div>
                )}

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                        { key: 'all', label: 'Összes' },
                        { key: 'draft', label: 'Piszkozat' },
                        { key: 'issued', label: 'Kiállítva' },
                        { key: 'paid', label: 'Fizetve' },
                        { key: 'storno', label: 'Sztornó' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className="btn btn-sm"
                            style={{
                                background: filter === tab.key ? 'var(--primary-600)' : 'var(--gray-100)',
                                color: filter === tab.key ? 'white' : 'var(--gray-600)',
                                border: 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className={s.contentCard} style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Betöltés...</div>
                ) : filteredInvoices.length === 0 ? (
                    <div className={s.contentCard} style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>🧾</span>
                        Még nincs számlád. Kattints az "Új számla" gombra!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filteredInvoices.map(inv => {
                            const st = STATUS_MAP[inv.status] || STATUS_MAP.draft;
                            return (
                                <div key={inv.id} className={s.contentCard} style={{
                                    padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', cursor: 'pointer'
                                }} onClick={() => handleViewDetail(inv)}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{inv.invoice_number}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{inv.client_name}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', minWidth: 100 }}>
                                        {new Date(inv.issue_date).toLocaleDateString('hu-HU')}
                                    </div>
                                    <div style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                                        color: st.color, background: st.bg,
                                    }}>
                                        {st.label}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', minWidth: 100, textAlign: 'right' }}>
                                        {Number(inv.gross_amount).toLocaleString('hu-HU')} Ft
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleDownloadPdf(inv.id)} className="btn btn-secondary btn-sm" title="PDF">
                                            📄
                                        </button>
                                        {inv.status === 'issued' && (
                                            <>
                                                <button onClick={() => handleStatusChange(inv.id, 'paid')} className="btn btn-secondary btn-sm" title="Fizetve">
                                                    ✅
                                                </button>
                                                <button onClick={() => handleSendEmail(inv)} className="btn btn-secondary btn-sm" title="Küldés emailben">
                                                    📧
                                                </button>
                                            </>
                                        )}
                                        {inv.status === 'draft' && (
                                            <button onClick={() => handleStatusChange(inv.id, 'issued')} className="btn btn-secondary btn-sm" title="Kiállítás">
                                                🔒
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ===================== DETAIL VIEW =====================
    if (view === 'detail' && selectedInvoice) {
        const inv = selectedInvoice;
        const st = STATUS_MAP[inv.status] || STATUS_MAP.draft;
        return (
            <div>
                <div className={s.topBar}>
                    <div className={s.topBarLeft}>
                        <h1>{inv.invoice_number}</h1>
                        <p>{inv.client_name}</p>
                    </div>
                    <div className={s.topBarRight} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => { setView('list'); setSelectedInvoice(null); }} className="btn btn-secondary btn-sm">
                            ← Vissza
                        </button>
                        <button onClick={() => handleDownloadPdf(inv.id)} className="btn btn-secondary btn-sm">📄 PDF</button>
                        {inv.status === 'issued' && (
                            <>
                                <button onClick={() => handleSendEmail(inv)} className="btn btn-secondary btn-sm">📧 Küldés</button>
                                <button onClick={async () => { await handleStatusChange(inv.id, 'paid'); setView('list'); }} className="btn btn-primary btn-sm">✅ Fizetve</button>
                                <button onClick={async () => { await handleStatusChange(inv.id, 'storno'); setView('list'); }} className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Sztornó</button>
                            </>
                        )}
                        {inv.status === 'draft' && (
                            <button onClick={async () => { await handleStatusChange(inv.id, 'issued'); setView('list'); }} className="btn btn-primary btn-sm">🔒 Kiállítás</button>
                        )}
                    </div>
                </div>

                <div className={s.contentCard} style={{ padding: 32, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 4 }}>Státusz</div>
                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, color: st.color, background: st.bg }}>{st.label}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 4 }}>Kiállítás</div>
                            <div style={{ fontWeight: 600 }}>{new Date(inv.issue_date).toLocaleDateString('hu-HU')}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 4 }}>Teljesítés</div>
                            <div style={{ fontWeight: 600 }}>{new Date(inv.fulfillment_date).toLocaleDateString('hu-HU')}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 4 }}>Fizetési határidő</div>
                            <div style={{ fontWeight: 600 }}>{new Date(inv.due_date).toLocaleDateString('hu-HU')}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 4 }}>Fizetés módja</div>
                            <div style={{ fontWeight: 600 }}>{PAYMENT_MAP[inv.payment_method] || inv.payment_method}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <div style={{ padding: 20, background: 'var(--gray-50)', borderRadius: 12 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 8, fontWeight: 600 }}>KIÁLLÍTÓ</div>
                            <div style={{ fontWeight: 600 }}>{settings?.company_name || '-'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{settings?.tax_number}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{settings?.zip_code} {settings?.city}, {settings?.address}</div>
                        </div>
                        <div style={{ padding: 20, background: 'var(--gray-50)', borderRadius: 12 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: 8, fontWeight: 600 }}>VEVŐ</div>
                            <div style={{ fontWeight: 600 }}>{inv.client_name}</div>
                            {inv.client_tax_number && <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{inv.client_tax_number}</div>}
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{inv.client_zip} {inv.client_city}, {inv.client_address}</div>
                            {inv.client_email && <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{inv.client_email}</div>}
                        </div>
                    </div>

                    {/* Items table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                                <th style={{ padding: '10px 8px' }}>Megnevezés</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Menny.</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Egységár</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>ÁFA</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Nettó</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Bruttó</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(inv.items || []).map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                    <td style={{ padding: '10px 8px' }}>{item.description}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{item.quantity} {item.unit}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{Number(item.unit_price).toLocaleString('hu-HU')} Ft</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{item.vat_rate}%</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{Number(item.net_amount).toLocaleString('hu-HU')} Ft</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{Number(item.gross_amount).toLocaleString('hu-HU')} Ft</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 4 }}>Nettó: {Number(inv.net_amount).toLocaleString('hu-HU')} Ft</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 4 }}>ÁFA: {Number(inv.vat_amount).toLocaleString('hu-HU')} Ft</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Bruttó: {Number(inv.gross_amount).toLocaleString('hu-HU')} Ft</div>
                        </div>
                    </div>

                    {inv.notes && (
                        <div style={{ marginTop: 20, padding: 16, background: 'var(--gray-50)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                            <strong>Megjegyzés:</strong> {inv.notes}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ===================== CREATE VIEW =====================
    return (
        <div>
            <div className={s.topBar}>
                <div className={s.topBarLeft}>
                    <h1>Új számla 🧾</h1>
                    <p>Számla kiállítása</p>
                </div>
                <div className={s.topBarRight} style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setView('list')} className="btn btn-secondary btn-sm">← Mégse</button>
                    <button onClick={() => handleCreate(true)} className="btn btn-secondary btn-sm" disabled={createLoading}>Mentés piszkozatként</button>
                    <button onClick={() => handleCreate(false)} className="btn btn-primary btn-sm" disabled={createLoading}>
                        {createLoading ? '⏳...' : '🔒 Számla kiállítása'}
                    </button>
                </div>
            </div>

            {createError && (
                <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.9rem' }}>
                    {createError}
                </div>
            )}

            {/* Client data */}
            <div className={s.contentCard} style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>👤 Vevő adatai</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    <div className="input-group">
                        <label className="input-label">Név <span style={{ color: 'var(--error)' }}>*</span></label>
                        <input className="input" placeholder="Ügyfél neve" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Adószám</label>
                        <input className="input" placeholder="12345678-1-23" value={form.client_tax_number} onChange={e => setForm(p => ({ ...p, client_tax_number: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input className="input" type="email" placeholder="email@pelda.hu" value={form.client_email} onChange={e => setForm(p => ({ ...p, client_email: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Irányítószám</label>
                        <input className="input" placeholder="1011" value={form.client_zip} onChange={e => setForm(p => ({ ...p, client_zip: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Város</label>
                        <input className="input" placeholder="Budapest" value={form.client_city} onChange={e => setForm(p => ({ ...p, client_city: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Cím</label>
                        <input className="input" placeholder="Fő utca 1." value={form.client_address} onChange={e => setForm(p => ({ ...p, client_address: e.target.value }))} />
                    </div>
                </div>
            </div>

            {/* Dates & payment */}
            <div className={s.contentCard} style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>📅 Dátumok és fizetés</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div className="input-group">
                        <label className="input-label">Kiállítás dátuma</label>
                        <input className="input" type="date" value={form.issue_date} onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Teljesítés dátuma</label>
                        <input className="input" type="date" value={form.fulfillment_date} onChange={e => setForm(p => ({ ...p, fulfillment_date: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Fizetési határidő</label>
                        <input className="input" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Fizetés módja</label>
                        <select className="input" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                            <option value="transfer">Átutalás</option>
                            <option value="cash">Készpénz</option>
                            <option value="card">Bankkártya</option>
                            <option value="other">Egyéb</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div className={s.contentCard} style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>📦 Tételek</h3>
                    <button onClick={addItem} className="btn btn-secondary btn-sm">+ Tétel hozzáadása</button>
                </div>

                {items.map((item, idx) => (
                    <div key={idx} style={{
                        display: 'grid', gridTemplateColumns: '2fr 80px 80px 100px 100px 40px',
                        gap: 10, alignItems: 'end', marginBottom: 12, paddingBottom: 12,
                        borderBottom: idx < items.length - 1 ? '1px solid var(--gray-100)' : 'none',
                    }}>
                        <div className="input-group" style={{ margin: 0 }}>
                            {idx === 0 && <label className="input-label">Megnevezés</label>}
                            <input className="input" placeholder="Szolgáltatás neve" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            {idx === 0 && <label className="input-label">Menny.</label>}
                            <input className="input" type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            {idx === 0 && <label className="input-label">Egység</label>}
                            <input className="input" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            {idx === 0 && <label className="input-label">Nettó ár</label>}
                            <input className="input" type="number" min="0" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                            {idx === 0 && <label className="input-label">ÁFA</label>}
                            <select className="input" value={item.vat_rate} onChange={e => updateItem(idx, 'vat_rate', parseInt(e.target.value))}>
                                {VAT_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 2 }}>
                            {items.length > 1 && (
                                <button onClick={() => removeItem(idx)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--gray-400)', padding: 4
                                }}>✕</button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Totals */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '2px solid var(--gray-200)' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: 6 }}>Nettó összesen: <strong>{totals.net.toLocaleString('hu-HU')} Ft</strong></div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: 6 }}>ÁFA összesen: <strong>{totals.vat.toLocaleString('hu-HU')} Ft</strong></div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gray-800)' }}>Bruttó: {totals.gross.toLocaleString('hu-HU')} Ft</div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className={s.contentCard} style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>📝 Megjegyzés (opcionális)</h3>
                <textarea className="input" rows={3} placeholder="Számla megjegyzés..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>

            {/* Bottom actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 40 }}>
                <button onClick={() => setView('list')} className="btn btn-secondary">Mégse</button>
                <button onClick={() => handleCreate(true)} className="btn btn-secondary" disabled={createLoading}>Mentés piszkozatként</button>
                <button onClick={() => handleCreate(false)} className="btn btn-primary" disabled={createLoading}>
                    {createLoading ? '⏳ Mentés...' : '🔒 Számla kiállítása'}
                </button>
            </div>
        </div>
    );
}
