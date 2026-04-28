import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Download, RefreshCw, Edit, Save, X, Copy, ChevronLeft, ChevronRight,
  Upload, Trash2, FileText, Search, Building2, User, CalendarDays,
  Tag, AlignLeft, PenLine, Link, StickyNote, Plus, ArrowRight, ExternalLink
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const token = {
  blue:    '#1a2a57',
  blueMid: '#2d4a8c',
  blueLight: 'rgba(26,42,87,0.08)',
  border:  'rgba(26,42,87,0.09)',
  muted:   '#8a93a6',
  text:    '#1e293b',
  surface: '#ffffff',
};

/* ── tiny helpers ── */
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: token.muted }}>
        {label}
      </span>
      {children}
    </div>
  );
}

const inp = {
  width: '100%', padding: '0.6rem 0.8rem',
  fontSize: '0.88rem', color: token.text,
  background: token.surface,
  border: `1px solid ${token.border}`,
  borderRadius: '0.5rem', outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};
const inpRO = { ...inp, background: '#f1f5f9', color: token.muted, cursor: 'not-allowed' };

function Inp(props) {
  return (
    <input
      {...props}
      style={props.readOnly ? inpRO : inp}
      onFocus={e => { if (!props.readOnly) e.target.style.borderColor = token.blueMid; }}
      onBlur={e => { e.target.style.borderColor = token.border; }}
    />
  );
}
function Sel({ children, ...props }) {
  return <select {...props} style={{ ...inp, cursor: 'pointer' }}>{children}</select>;
}

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1rem' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: token.blueMid, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: token.border }} />
    </div>
  );
}

function Btn({ children, variant = 'default', ...props }) {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${token.blue} 0%, ${token.blueMid} 100%)`, color: '#fff', border: 'none' },
    success: { background: 'linear-gradient(135deg, #057a5a 0%, #10b981 100%)', color: '#fff', border: 'none' },
    ghost:   { background: 'rgba(26,42,87,0.06)', color: token.blue, border: `1px solid ${token.border}` },
    danger:  { background: 'rgba(220,38,38,0.08)', color: '#b91c1c', border: '1px solid rgba(220,38,38,0.15)' },
    soft:    { background: 'rgba(99,102,241,0.09)', color: '#4338ca', border: '1px solid rgba(99,102,241,0.18)' },
  };
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.55rem 1.1rem', fontSize: '0.83rem', fontWeight: 600,
        borderRadius: '0.55rem', cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.55 : 1, transition: 'opacity 0.15s, transform 0.1s',
        fontFamily: 'inherit',
        ...(styles[variant] || styles.ghost),
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

/* ── badge ── */
const badgeStyles = {
  PNM: { background: '#ede9fe', color: '#5b21b6' },
  PKS: { background: '#dcfce7', color: '#166534' },
  PKP: { background: '#dbeafe', color: '#1e40af' },
};

/* ════════════════════════════ MAIN ════════════════════════════ */
function Dashboard({ activePage, onNavigate }) {
  const [masterData, setMasterData]   = useState({ users: [], divisions: [] });
  const [documents, setDocuments]     = useState([]);
  const [templates, setTemplates]     = useState([]);
  const [formData, setFormData]       = useState({
    company: 'PNM', template_name: '', judul_dokumen: '', user_name: '',
    division: '', internal_external: 'Internal',
    doc_date: new Date().toISOString().split('T')[0],
    klasifikasi: '', perihal: '', signed_by: '', keterangan: '', link_document: '',
  });
  const [loading, setLoading]         = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [editingDoc, setEditingDoc]   = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg]     = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(10);
  const [searchTerm, setSearchTerm]   = useState('');
  const [searchDate, setSearchDate]   = useState('');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (templates.length > 0 && !editingDoc && !generatedDoc) {
      const match = templates.find(t => t.toLowerCase().includes(formData.company.toLowerCase()));
      setFormData(p => ({ ...p, template_name: match || templates[0] }));
    }
  }, [formData.company, templates, editingDoc, generatedDoc]);

  const fetchData = async () => {
    setTableLoading(true);
    try {
      const [d, doc, tpl] = await Promise.all([
        axios.get(`${API_URL}/data`),
        axios.get(`${API_URL}/documents`),
        axios.get(`${API_URL}/templates`),
      ]);
      setMasterData(d.data); setDocuments(doc.data); setTemplates(tpl.data);
    } catch (e) { console.error(e); } finally { setTableLoading(false); }
  };

  const hUser = (e) => {
    const u = masterData.users.find(u => u.name === e.target.value);
    const div = masterData.divisions.find(d => d.name === u?.division);
    setFormData(p => ({ ...p, user_name: e.target.value, division: u?.division || '', klasifikasi: (div?.klasifikasi && div.klasifikasi !== '-') ? div.klasifikasi : p.klasifikasi }));
  };
  const hChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const hSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_name || !formData.doc_date) { alert('Harap isi User dan Tanggal!'); return; }
    setLoading(true);
    try {
      if (editingDoc) {
        const r = await axios.put(`${API_URL}/documents/${editingDoc.id}`, formData);
        alert('Dokumen diperbarui!'); setGeneratedDoc(r.data);
      } else {
        const r = await axios.post(`${API_URL}/generate`, formData);
        setGeneratedDoc(r.data); setEditingDoc(r.data);
      }
      fetchData();
    } catch { alert('Gagal memproses dokumen.'); } finally { setLoading(false); }
  };

  const hDownload = async (doc) => {
    try {
      const r = await axios.post(`${API_URL}/download`, { doc_number: doc.doc_number }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(doc.judul_dokumen || 'Dokumen').replace(/[^a-zA-Z0-9 -]/g, '')}_${doc.doc_number.replace(/\//g, '_')}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      let msg = 'Gagal men-download.';
      if (err.response?.data instanceof Blob) { try { msg = JSON.parse(await err.response.data.text()).error || msg; } catch {} }
      alert(msg);
    }
  };

  const resetForm = () => {
    setGeneratedDoc(null); setEditingDoc(null);
    setFormData({ company: 'PNM', template_name: templates[0] || '', judul_dokumen: '', user_name: '', division: '', internal_external: 'Internal', doc_date: new Date().toISOString().split('T')[0], klasifikasi: '', perihal: '', signed_by: '', keterangan: '', link_document: '' });
  };

  const startEdit = (doc) => {
    setEditingDoc(doc); setGeneratedDoc(doc);
    setFormData({ company: doc.company, template_name: doc.template_name || templates[0] || '', judul_dokumen: doc.judul_dokumen || '', user_name: doc.user_name, division: doc.division, internal_external: doc.internal_external || 'Internal', doc_date: doc.doc_date, klasifikasi: doc.klasifikasi || '', perihal: doc.perihal || '', signed_by: doc.signed_by || '', keterangan: doc.keterangan || '', link_document: doc.link_document || '' });
    onNavigate?.('form'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startDuplicate = (doc) => {
    setEditingDoc(null); setGeneratedDoc(null);
    setFormData({ company: doc.company, template_name: doc.template_name || templates[0] || '', judul_dokumen: doc.judul_dokumen || '', user_name: doc.user_name, division: doc.division, internal_external: doc.internal_external || 'Internal', doc_date: new Date().toISOString().split('T')[0], klasifikasi: doc.klasifikasi || '', perihal: doc.perihal || '', signed_by: doc.signed_by || '', keterangan: doc.keterangan || '', link_document: doc.link_document || '' });
    onNavigate?.('form'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!file.name.endsWith('.docx')) { setUploadMsg({ type: 'err', text: 'Hanya file .docx.' }); return; }
    setUploadLoading(true); setUploadMsg({ type: '', text: '' });
    const fd = new FormData(); fd.append('template', file);
    try { const r = await axios.post(`${API_URL}/templates/upload`, fd); setUploadMsg({ type: 'ok', text: r.data.message || 'Berhasil diupload!' }); fetchData(); }
    catch (err) { setUploadMsg({ type: 'err', text: err.response?.data?.error || 'Gagal upload.' }); }
    finally { setUploadLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const hDeleteTemplate = async (name) => {
    if (!confirm(`Hapus template "${name}"?`)) return;
    try { await axios.delete(`${API_URL}/templates/${encodeURIComponent(name)}`); setUploadMsg({ type: 'ok', text: `"${name}" dihapus.` }); fetchData(); }
    catch (err) { setUploadMsg({ type: 'err', text: err.response?.data?.error || 'Gagal hapus.' }); }
  };

  const filtered = documents.filter(doc => {
    const s = !searchTerm || [doc.company, doc.doc_number, doc.judul_dokumen, doc.user_name].some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()));
    const d = !searchDate || doc.doc_date === searchDate;
    return s && d;
  });
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageData   = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const wrap = { padding: '1.5rem 1rem' };
  const card = {
    background: token.surface,
    border: `1px solid ${token.border}`,
    borderRadius: '1rem',
    boxShadow: '0 18px 36px rgba(17, 38, 75, 0.08)',
    padding: '1.5rem',
  };

  /* ── TEMPLATES ── */
  if (activePage === 'templates') return (
    <div style={wrap}>
      <div style={card}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.25rem' }}>Kelola Template</h1>
        <p style={{ fontSize: '0.83rem', color: token.muted }}>Upload dan kelola template dokumen .docx</p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => { setUploadMsg({ type: '', text: '' }); fileInputRef.current?.click(); }}
        style={{ border: `1.5px dashed ${token.border}`, borderRadius: '0.875rem', padding: '2.5rem 2rem', textAlign: 'center', cursor: 'pointer', background: token.surface, marginBottom: '1.5rem', transition: 'border-color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = token.blueMid}
        onMouseLeave={e => e.currentTarget.style.borderColor = token.border}
      >
        <input ref={fileInputRef} type="file" accept=".docx" style={{ display: 'none' }} onChange={hUpload} />
        <div style={{ width: 44, height: 44, borderRadius: '0.6rem', background: token.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem' }}>
          <Upload size={20} style={{ color: token.blueMid }} />
        </div>
        <p style={{ fontWeight: 600, color: token.blue, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          {uploadLoading ? 'Mengupload...' : 'Klik untuk upload file .docx'}
        </p>
        <p style={{ fontSize: '0.78rem', color: token.muted }}>Format yang didukung: .docx</p>
        {uploadMsg.text && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: uploadMsg.type === 'ok' ? '#166534' : '#b91c1c' }}>
            {uploadMsg.text}
          </p>
        )}
      </div>

      {/* List */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: token.muted, marginBottom: '0.6rem' }}>
        {templates.length} template
      </div>
      {templates.length === 0
        ? <p style={{ color: token.muted, fontSize: '0.85rem', padding: '1rem 0' }}>Belum ada template.</p>
        : templates.map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', borderRadius: '0.6rem', background: token.surface, border: `1px solid ${token.border}`, marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileText size={16} style={{ color: token.muted, flexShrink: 0 }} />
                <span style={{ fontSize: '0.87rem', fontWeight: 500, color: token.text }}>{t}</span>
              </div>
              <Btn variant="danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => hDeleteTemplate(t)}>
                <Trash2 size={12} /> Hapus
              </Btn>
            </div>
          ))
      }
      </div>
    </div>
  );

  /* ── FORM ── */
  if (activePage === 'form') return (
    <div style={wrap}>
      <div style={card}>
      {/* Page title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.2rem' }}>
            {editingDoc ? 'Edit Dokumen' : 'Generate Dokumen Baru'}
          </h1>
          <p style={{ fontSize: '0.83rem', color: token.muted }}>
            {editingDoc ? `Nomor aktif: ${editingDoc.doc_number}` : 'Isi form di bawah untuk membuat nomor dokumen'}
          </p>
        </div>
        {editingDoc && (
          <Btn variant="danger" onClick={resetForm}>
            <X size={14} /> Batal Edit
          </Btn>
        )}
      </div>

      <form onSubmit={hSubmit}>
        {/* ─── Perusahaan ─── */}
        <Divider label="Perusahaan" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Field label="Pilih PT">
            <Sel name="company" value={formData.company} onChange={hChange} disabled={!!editingDoc} style={editingDoc ? { ...inp, ...inpRO, cursor: 'not-allowed' } : {}}>
              <option value="PNM">PT Pilar Niaga Makmur (PNM)</option>
              <option value="PKS">PT Pilkada (PKS)</option>
              <option value="PKP">PT Pikasa (PKP)</option>
            </Sel>
          </Field>
          <Field label="Template Dokumen">
            <Sel name="template_name" value={formData.template_name} onChange={hChange}>
              {templates.length === 0 ? <option value="">-- Belum ada template --</option> : templates.map(t => <option key={t} value={t}>{t}</option>)}
            </Sel>
          </Field>
          <Field label="Internal / External">
            <Sel name="internal_external" value={formData.internal_external} onChange={hChange}>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </Sel>
          </Field>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Field label="Judul Dokumen">
            <Inp type="text" name="judul_dokumen" value={formData.judul_dokumen} onChange={hChange} placeholder="Contoh: Perjanjian Kerja Sama..." />
          </Field>
        </div>

        {/* ─── Pengguna ─── */}
        <Divider label="Pengguna & Tanggal" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <Field label="User *">
            <Sel name="user_name" value={formData.user_name} onChange={hUser} required>
              <option value="">-- Pilih --</option>
              {masterData.users.map((u, i) => <option key={i} value={u.name}>{u.name}</option>)}
            </Sel>
          </Field>
          <Field label="Divisi">
            <Inp value={formData.division} readOnly placeholder="Otomatis" />
          </Field>
          <Field label="Tanggal Dokumen *">
            <Inp type="date" name="doc_date" value={formData.doc_date} onChange={hChange} required />
          </Field>
          <Field label="Klasifikasi">
            <Inp type="text" name="klasifikasi" value={formData.klasifikasi} onChange={hChange} placeholder="Surat Edaran..." />
          </Field>
        </div>

        {/* ─── Detail ─── */}
        <Divider label="Detail Dokumen" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Perihal">
            <Inp type="text" name="perihal" value={formData.perihal} onChange={hChange} placeholder="Deskripsi perihal..." />
          </Field>
          <Field label="Di Tanda Tangani Oleh">
            <Inp type="text" name="signed_by" value={formData.signed_by} onChange={hChange} placeholder="Nama penandatangan" />
          </Field>
          <Field label="Link Dokumen">
            <Inp type="text" name="link_document" value={formData.link_document} onChange={hChange} placeholder="https://..." />
          </Field>
          <Field label="Keterangan">
            <textarea name="keterangan" value={formData.keterangan} onChange={hChange} placeholder="Catatan opsional..." rows={2}
              style={{ ...inp, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = token.blueMid}
              onBlur={e => e.target.style.borderColor = token.border}
            />
          </Field>
        </div>

        {/* ─── Action bar ─── */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${token.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {generatedDoc ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.muted }}>Nomor:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: token.blue, letterSpacing: '0.5px' }}>{generatedDoc.doc_number}</span>
            </div>
          ) : <div />}

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {generatedDoc && (
              <>
                <Btn variant="soft" onClick={() => startDuplicate(generatedDoc)}>
                  <Copy size={15} /> Duplikat
                </Btn>
                <Btn variant="success" onClick={() => hDownload(generatedDoc)}>
                  <Download size={15} /> Download .docx
                </Btn>
              </>
            )}
            <Btn variant="primary" type="submit" disabled={loading}>
              {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (editingDoc ? <><Save size={18} /> Simpan Perubahan</> : <><Plus size={18} /> Generate Nomor</>)}
            </Btn>
          </div>
        </div>
      </form>
      </div>
    </div>
  );

  /* ── HISTORY ── */
  return (
    <div style={wrap}>
      <div style={card}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.2rem' }}>
            Riwayat Dokumen
          </h1>
          <p style={{ fontSize: '0.83rem', color: token.muted }}>{filtered.length} dokumen ditemukan</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            style={{ ...inp, width: 'auto', padding: '0.5rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value={10}>10 baris</option>
            <option value={25}>25 baris</option>
            <option value={50}>50 baris</option>
          </select>
          <Btn variant="ghost" onClick={fetchData} disabled={tableLoading}>
            <RefreshCw size={13} style={tableLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            {tableLoading ? 'Memuat...' : 'Refresh'}
          </Btn>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: token.muted, pointerEvents: 'none' }} />
          <Inp type="text" placeholder="Cari PT, nomor, judul, user..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ ...inp, paddingLeft: '2.2rem' }}
          />
        </div>
        <Inp type="date" value={searchDate} onChange={e => { setSearchDate(e.target.value); setCurrentPage(1); }} style={{ ...inp, width: 'auto' }} />
        {(searchTerm || searchDate) && (
          <Btn variant="danger" onClick={() => { setSearchTerm(''); setSearchDate(''); setCurrentPage(1); }}>
            <X size={13} /> Reset
          </Btn>
        )}
      </div>

      {/* Table — borderless style */}
      <div style={{ overflowX: 'auto', background: token.surface, borderRadius: '0.875rem', border: `1px solid ${token.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${token.border}` }}>
              {[
                ['Aksi', '10rem'],
                ['No', '3rem'],
                ['Nomor Dokumen', 'auto'],
                ['Tanggal', '7rem'],
                ['PT', '4rem'],
                ['Judul', 'auto'],
                ['User', 'auto'],
                ['Divisi', 'auto'],
                ['Int/Ext', 'auto'],
                ['Klasifikasi', 'auto'],
                ['Perihal', 'auto'],
                ['Penandatangan', 'auto'],
                ['Keterangan', '15rem'],
                ['Link', '4rem']
              ].map(([h, w]) => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: token.muted, width: w, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((doc, idx) => (
              <tr
                key={doc.id}
                style={{ borderBottom: `1px solid ${token.border}`, background: editingDoc?.id === doc.id ? 'rgba(254,243,199,0.5)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (editingDoc?.id !== doc.id) e.currentTarget.style.background = 'rgba(26,42,87,0.025)'; }}
                onMouseLeave={e => { if (editingDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '0.8rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Btn variant="soft"   style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => startDuplicate(doc)} title="Duplikat"><Copy size={12} /></Btn>
                    <Btn variant="ghost"  style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => startEdit(doc)} title="Edit"><Edit size={12} /></Btn>
                    <Btn variant="success" style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => hDownload(doc)} title="Download Docx"><Download size={12} /></Btn>
                  </div>
                </td>
                <td style={{ padding: '0.8rem 1rem', color: token.muted, fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: token.blue, whiteSpace: 'nowrap' }}>{doc.doc_number}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.muted, whiteSpace: 'nowrap' }}>{doc.doc_date}</td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <span style={{ ...(badgeStyles[doc.company] || badgeStyles.PKP), padding: '0.18rem 0.55rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>{doc.company}</span>
                </td>
                <td style={{ padding: '0.8rem 1rem', color: token.text, minWidth: 200, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.judul_dokumen || <span style={{ color: token.muted }}>—</span>}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.user_name}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.division}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.text }}>{doc.internal_external}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.text }}>{doc.klasifikasi || '—'}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.text, minWidth: 150 }}>{doc.perihal || '—'}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.signed_by || '—'}</td>
                <td style={{ padding: '0.8rem 1rem', color: token.muted, fontSize: '0.78rem', minWidth: 200 }}>{doc.keterangan || '—'}</td>
                <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                  {doc.link_document ? (
                    <a href={doc.link_document} target="_blank" rel="noopener noreferrer" style={{ color: token.blue }}>
                      <Link size={14} />
                    </a>
                  ) : <span style={{ color: token.muted }}>—</span>}
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr><td colSpan={14} style={{ padding: '3.5rem', textAlign: 'center', color: token.muted }}>
                <FileText size={28} style={{ display: 'block', margin: '0 auto 0.6rem', opacity: 0.35 }} />
                Tidak ada data
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: token.muted }}>
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <Btn variant="ghost" style={{ padding: '0.35rem 0.65rem' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </Btn>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              return (
                <Btn key={page} variant={page === currentPage ? 'primary' : 'ghost'} style={{ padding: '0.35rem 0.65rem', minWidth: '2.2rem' }} onClick={() => setCurrentPage(page)}>
                  {page}
                </Btn>
              );
            })}
            <Btn variant="ghost" style={{ padding: '0.35rem 0.65rem' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight size={16} />
            </Btn>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Dashboard;
