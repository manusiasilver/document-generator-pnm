import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, X, Copy, Edit, Download, Link, FileText, ChevronLeft, ChevronRight, ChevronDown, Save } from 'lucide-react';
import { token, Btn, wrap, card, Inp, badgeStyles, Field, Sel, Divider } from './SharedUI';
import { useAuth } from '../context/AuthContext'

const API_URL = '/api';
const MOBILE_BREAKPOINT = 768;
const COMPACT_MOBILE_BREAKPOINT = 480;

const getToday = () => new Date().toISOString().split('T')[0];
const dash = value => value || '-';
const formatTimestamp = value => new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(value);

const formatDate = value => {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value + 'T00:00:00'));
  } catch {
    return value;
  }
};

function useViewportFlag(breakpoint) {
  const getMatches = () => (typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false);
  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const onResize = () => setMatches(getMatches());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return matches;
}

function Overlay({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9000,
      }}
    />
  );
}

function ModalBox({ children, maxWidth = '700px', scrollable = false, isMobile = false }) {
  return (
    <div style={{
      position: 'fixed',
      top: isMobile ? 'max(12px, env(safe-area-inset-top, 0px))' : '50%',
      left: '50%',
      transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
      zIndex: 9001,
      background: token.surface,
      borderRadius: isMobile ? '1rem' : '1.1rem',
      boxShadow: '0 30px 80px rgba(15,23,42,0.25)',
      border: `1px solid ${token.border}`,
      maxHeight: isMobile ? 'calc(100dvh - 24px)' : '92vh',
      display: 'flex',
      flexDirection: 'column',
      width: isMobile ? 'calc(100vw - 24px)' : '92vw',
      maxWidth,
      ...(scrollable && { overflowY: 'auto' }),
    }}>
      {children}
    </div>
  );
}

function ModalHeader({ title, subtitle, right, onClose, isMobile = false }) {
  return (
    <div style={{
      padding: isMobile ? '1rem' : '1.25rem 1.75rem',
      borderBottom: `1px solid ${token.border}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
      position: 'sticky', top: 0, background: token.surface, zIndex: 1,
      borderRadius: '1.1rem 1.1rem 0 0',
    }}>
      <div style={{ minWidth: 0, flex: '1 1 220px' }}>
        {subtitle && <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.muted, marginBottom: '0.2rem' }}>{subtitle}</div>}
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: token.blue, lineHeight: 1.35, wordBreak: 'break-word' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: isMobile ? 'auto' : 0 }}>
        {right}
        <button
          onClick={onClose}
          style={{ background: 'rgba(26,42,87,0.07)', border: 'none', cursor: 'pointer', color: token.muted, padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function DetailGrid({ children, isMobile, columns }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : columns,
      gap: '1rem',
    }}>
      {children}
    </div>
  );
}

function EditModal({ doc, templates, masterData, onClose, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    company:           doc.company,
    template_name:     doc.template_name || templates[0] || '',
    judul_dokumen:     doc.judul_dokumen || '',
    user_name:         doc.user_name || '',
    division:          doc.division || '',
    internal_external: doc.internal_external || 'Internal',
    doc_date:          doc.doc_date || '',
    klasifikasi:       doc.klasifikasi || '',
    perihal:           doc.perihal || '',
    signed_by:         doc.signed_by || '',
    keterangan:        doc.keterangan || '',
    link_document:     doc.link_document || '',
  });
  const [saving, setSaving] = useState(false);
  const isMobile = useViewportFlag(MOBILE_BREAKPOINT);

  const hChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const hSubmit = async e => {
    e.preventDefault();
    if (!form.division || !form.doc_date) { alert('Harap isi Divisi dan Tanggal!'); return; }
    setSaving(true);
    try {
      await axios.put(`${API_URL}/documents/${doc.id}`, form);
      onSaved();
      onClose();
    } catch {
      alert('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const taStyle = {
    width: '100%', padding: '0.6rem 0.8rem',
    fontSize: '0.88rem', color: token.text,
    background: token.surface, border: `1px solid ${token.border}`,
    borderRadius: '0.5rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <ModalBox maxWidth="800px" scrollable isMobile={isMobile}>
        <ModalHeader subtitle="Edit Dokumen" title={doc.doc_number} onClose={onClose} isMobile={isMobile} />
        <form onSubmit={hSubmit} style={{ padding: isMobile ? '1rem' : '1rem 1.75rem 1.5rem' }}>
          <Divider label="Perusahaan" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr 1fr">
            <Field label="Template Dokumen">
              <Sel name="template_name" value={form.template_name} onChange={hChange}>
                {templates.map(t => <option key={t} value={t}>{t}</option>)}
              </Sel>
            </Field>
            <Field label="Internal / External">
              <Sel name="internal_external" value={form.internal_external} onChange={hChange}>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </Sel>
            </Field>
            <Field label="Kode PT">
              <Inp value={form.company} readOnly />
            </Field>
          </DetailGrid>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Judul Dokumen">
              <Inp type="text" name="judul_dokumen" value={form.judul_dokumen} onChange={hChange} placeholder="Judul dokumen..." />
            </Field>
          </div>

          <Divider label="Pengguna & Tanggal" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr 1fr 1fr">
            <Field label="User">
              <Inp value={user?.name || ''} readOnly />
            </Field>
            <Field label="Divisi *">
              <Sel name="division" value={form.division} onChange={hChange} required>
                <option value="">-- Pilih --</option>
                {masterData.divisions.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
              </Sel>
            </Field>
            <Field label="Tanggal *">
              <Inp type="date" name="doc_date" value={form.doc_date} onChange={hChange} required />
            </Field>
            <Field label="Klasifikasi">
              <Inp type="text" name="klasifikasi" value={form.klasifikasi} onChange={hChange} />
            </Field>
          </DetailGrid>

          <Divider label="Detail" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr">
            <Field label="Perihal">
              <Inp type="text" name="perihal" value={form.perihal} onChange={hChange} />
            </Field>
            <Field label="Di Tanda Tangani Oleh">
              <Inp type="text" name="signed_by" value={form.signed_by} onChange={hChange} />
            </Field>
            <Field label="Link Dokumen">
              <Inp type="text" name="link_document" value={form.link_document} onChange={hChange} placeholder="https://..." />
            </Field>
            <Field label="Keterangan">
              <textarea
                name="keterangan"
                value={form.keterangan}
                onChange={hChange}
                rows={2}
                style={taStyle}
                onFocus={e => { e.target.style.borderColor = token.blueMid; }}
                onBlur={e => { e.target.style.borderColor = token.border; }}
              />
            </Field>
          </DetailGrid>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${token.border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Btn variant="ghost" type="button" onClick={onClose}>Batal</Btn>
            <Btn variant="primary" type="submit" disabled={saving}>
              {saving
                ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</>
                : <><Save size={13} /> Simpan Perubahan</>
              }
            </Btn>
          </div>
        </form>
      </ModalBox>
    </>
  );
}

function DuplicateModal({ doc, templates, masterData, onClose, onSaved }) {
  const [form, setForm] = useState({
    company:           doc.company,
    template_name:     doc.template_name || templates[0] || '',
    judul_dokumen:     doc.judul_dokumen || '',
    user_name:         doc.user_name || '',
    division:          doc.division || '',
    internal_external: doc.internal_external || 'Internal',
    doc_date:          getToday(),
    klasifikasi:       doc.klasifikasi || '',
    perihal:           doc.perihal || '',
    signed_by:         doc.signed_by || '',
    keterangan:        doc.keterangan || '',
    link_document:     doc.link_document || '',
  });
  const [saving, setSaving] = useState(false);
  const isMobile = useViewportFlag(MOBILE_BREAKPOINT);

  const hChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const hSubmit = async e => {
    e.preventDefault();
    if (!form.division || !form.doc_date) { alert('Harap isi Divisi dan Tanggal!'); return; }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/generate`, { ...form, user_name: user?.name });
      onSaved();
      onClose();
    } catch {
      alert('Gagal membuat salinan dokumen.');
    } finally {
      setSaving(false);
    }
  };

  const taStyle = {
    width: '100%', padding: '0.6rem 0.8rem',
    fontSize: '0.88rem', color: token.text,
    background: token.surface, border: `1px solid ${token.border}`,
    borderRadius: '0.5rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <ModalBox maxWidth="800px" scrollable isMobile={isMobile}>
        <ModalHeader subtitle="Duplikat Dokumen" title={doc.doc_number} onClose={onClose} isMobile={isMobile} />
        <form onSubmit={hSubmit} style={{ padding: isMobile ? '1rem' : '1rem 1.75rem 1.5rem' }}>
          <Divider label="Perusahaan" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr 1fr">
            <Field label="Template Dokumen">
              <Sel name="template_name" value={form.template_name} onChange={hChange}>
                {templates.map(t => <option key={t} value={t}>{t}</option>)}
              </Sel>
            </Field>
            <Field label="Internal / External">
              <Sel name="internal_external" value={form.internal_external} onChange={hChange}>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </Sel>
            </Field>
            <Field label="Kode PT">
              <Inp value={form.company} readOnly />
            </Field>
          </DetailGrid>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Judul Dokumen">
              <Inp type="text" name="judul_dokumen" value={form.judul_dokumen} onChange={hChange} placeholder="Judul dokumen..." />
            </Field>
          </div>

          <Divider label="Pengguna & Tanggal" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr 1fr 1fr">
            <Field label="User">
              <Inp value={user?.name || ''} readOnly />
            </Field>
            <Field label="Divisi *">
              <Sel name="division" value={form.division} onChange={hChange} required>
                <option value="">-- Pilih --</option>
                {masterData.divisions.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
              </Sel>
            </Field>
            <Field label="Tanggal *">
              <Inp type="date" name="doc_date" value={form.doc_date} onChange={hChange} required />
            </Field>
            <Field label="Klasifikasi">
              <Inp type="text" name="klasifikasi" value={form.klasifikasi} onChange={hChange} />
            </Field>
          </DetailGrid>

          <Divider label="Detail" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr">
            <Field label="Perihal">
              <Inp type="text" name="perihal" value={form.perihal} onChange={hChange} />
            </Field>
            <Field label="Di Tanda Tangani Oleh">
              <Inp type="text" name="signed_by" value={form.signed_by} onChange={hChange} />
            </Field>
            <Field label="Link Dokumen">
              <Inp type="text" name="link_document" value={form.link_document} onChange={hChange} placeholder="https://..." />
            </Field>
            <Field label="Keterangan">
              <textarea
                name="keterangan"
                value={form.keterangan}
                onChange={hChange}
                rows={2}
                style={taStyle}
                onFocus={e => { e.target.style.borderColor = token.blueMid; }}
                onBlur={e => { e.target.style.borderColor = token.border; }}
              />
            </Field>
          </DetailGrid>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${token.border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Btn variant="ghost" type="button" onClick={onClose}>Batal</Btn>
            <Btn variant="primary" type="submit" disabled={saving}>
              {saving
                ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Membuat...</>
                : <><Copy size={13} /> Buat Salinan</>
              }
            </Btn>
          </div>
        </form>
      </ModalBox>
    </>
  );
}

function MobileDocCard({ doc, index, onDuplicate, onEdit, onDownload, isCompact = false }) {
  const mobileCardRadius = '0.9rem';
  const mobileSectionRadius = '0.75rem';

  const renderMetaBlock = (label, value, span = '1fr') => (
    <div style={{ minWidth: 0, gridColumn: span }}>
      <div style={{ fontSize: '0.68rem', color: token.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.18rem' }}>{label}</div>
      <div style={{ fontSize: '0.82rem', color: token.text, lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ border: `1px solid ${token.border}`, borderRadius: mobileCardRadius, background: token.surface, padding: isCompact ? '1rem' : '1.1rem', boxShadow: '0 14px 32px rgba(17, 38, 75, 0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: isCompact ? 'stretch' : 'flex-start', marginBottom: '0.95rem', flexDirection: isCompact ? 'column' : 'row' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.68rem', color: token.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Dokumen #{index}
          </div>
          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: token.blue, lineHeight: 1.35, wordBreak: 'break-word' }}>
            {doc.doc_number}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: isCompact ? 'flex-start' : 'flex-end' }}>
          <span style={{ ...(badgeStyles[doc.company] || badgeStyles.PKP), padding: '0.24rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{doc.company}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '0.6rem', marginBottom: '0.95rem' }}>
        <div style={{ padding: '0.75rem 0.85rem', borderRadius: mobileSectionRadius, background: 'linear-gradient(180deg, rgba(26,42,87,0.06) 0%, rgba(26,42,87,0.03) 100%)', border: `1px solid ${token.border}` }}>
          <div style={{ fontSize: '0.66rem', color: token.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Tanggal</div>
          <div style={{ fontSize: '0.83rem', color: token.text, fontWeight: 700 }}>{formatDate(doc.doc_date)}</div>
        </div>
        <div style={{ padding: '0.75rem 0.85rem', borderRadius: mobileSectionRadius, background: 'linear-gradient(180deg, rgba(26,42,87,0.06) 0%, rgba(26,42,87,0.03) 100%)', border: `1px solid ${token.border}` }}>
          <div style={{ fontSize: '0.66rem', color: token.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Internal / External</div>
          <div style={{ fontSize: '0.83rem', color: token.text, fontWeight: 700 }}>{dash(doc.internal_external)}</div>
        </div>
      </div>

      <div style={{ fontSize: '0.94rem', color: token.text, fontWeight: 700, marginBottom: '0.95rem', lineHeight: 1.45, wordBreak: 'break-word' }}>
        {dash(doc.judul_dokumen)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: '0.8rem 0.85rem', marginBottom: '1rem', padding: isCompact ? '0.85rem' : '0.95rem', borderRadius: mobileSectionRadius, background: 'rgba(26,42,87,0.035)', border: `1px solid ${token.border}` }}>
        {renderMetaBlock('User', dash(doc.user_name))}
        {renderMetaBlock('Divisi', dash(doc.division))}
        {renderMetaBlock('Klasifikasi', dash(doc.klasifikasi))}
        {renderMetaBlock('Penandatangan', dash(doc.signed_by))}
        {renderMetaBlock('Perihal', dash(doc.perihal), '1 / -1')}
        {renderMetaBlock('Keterangan', dash(doc.keterangan), '1 / -1')}
      </div>

      <div style={{ display: 'grid', gap: '0.6rem', paddingTop: '0.95rem', borderTop: `1px solid ${token.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr 1fr' : 'repeat(3, minmax(0, 1fr))', gap: '0.45rem' }}>
          <Btn variant="soft" style={{ padding: '0.6rem 0.45rem', fontSize: '0.74rem', justifyContent: 'center', gridColumn: isCompact ? '1 / -1' : 'auto' }} onClick={() => onDuplicate(doc)}>
            <Copy size={13} /> Duplikat
          </Btn>
          <Btn variant="ghost" style={{ padding: '0.6rem 0.45rem', fontSize: '0.74rem', justifyContent: 'center' }} onClick={() => onEdit(doc)}>
            <Edit size={13} /> Edit
          </Btn>
          <Btn variant="success" style={{ padding: '0.6rem 0.45rem', fontSize: '0.74rem', justifyContent: 'center' }} onClick={() => onDownload(doc)}>
            <Download size={13} /> Download
          </Btn>
        </div>
        {doc.link_document ? (
          <a href={doc.link_document} target="_blank" rel="noopener noreferrer" style={{ color: token.blue, textDecoration: 'none', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, minHeight: '2.5rem', borderRadius: '0.7rem', background: 'rgba(26,42,87,0.05)', border: `1px solid ${token.border}`, padding: '0.5rem 0.75rem', textAlign: 'center' }}>
            <Link size={14} />
            Buka Link
          </a>
        ) : (
          <span style={{ color: token.muted, fontSize: '0.78rem', textAlign: 'center', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.7rem', background: 'rgba(148,163,184,0.08)', padding: '0.5rem 0.75rem' }}>Tidak ada link</span>
        )}
      </div>
    </div>
  );
}

const tableHeaderCellStyle = {
  padding: '0.9rem 1rem',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '0.68rem',
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: token.muted,
  whiteSpace: 'nowrap',
  background: 'rgba(248, 250, 252, 0.96)',
};

const tableBodyCellStyle = {
  padding: '1rem',
  verticalAlign: 'top',
  borderBottom: `1px solid ${token.border}`,
};

const tableBodyCellComfortStyle = {
  ...tableBodyCellStyle,
  padding: '0.95rem 1rem',
};

const tableLabelStyle = {
  fontSize: '0.66rem',
  color: token.muted,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const tablePrimaryTextStyle = {
  fontSize: '0.86rem',
  color: token.text,
  fontWeight: 500,
  lineHeight: 1.45,
};

const tableSecondaryTextStyle = {
  fontSize: '0.86rem',
  color: token.text,
  fontWeight: 500,
  lineHeight: 1.45,
};

const clampTwoLinesStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const clampThreeLinesStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

function InfoPair({ label, value, muted = false, full = false }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={tableLabelStyle}>{label}</div>
      <div style={{ ...(muted ? tableSecondaryTextStyle : tablePrimaryTextStyle), ...(full ? { wordBreak: 'break-word' } : clampTwoLinesStyle), marginTop: '0.2rem' }}>
        {dash(value)}
      </div>
    </div>
  );
}


function HistoryView({
  filtered,
  pageSize,
  setPageSize,
  setCurrentPage,
  fetchData,
  tableLoading,
  searchTerm,
  setSearchTerm,
  searchDate,
  setSearchDate,
  searchIntExt,
  setSearchIntExt,
  pageData,
  currentPage,
  hDownload,
  totalPages,
  masterData,
  templates,
}) {
  const [editDoc, setEditDoc] = useState(null);
  const [duplicateDoc, setDuplicateDoc] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const toggleRow = id => setExpandedRows(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const isMobile = useViewportFlag(MOBILE_BREAKPOINT);
  const isCompactMobile = useViewportFlag(COMPACT_MOBILE_BREAKPOINT);

  const handleRefresh = () => {
    fetchData();
  };


  return (
    <div style={{
      position: isMobile ? 'static' : 'fixed',
      top: isMobile ? 'auto' : '170px',
      left: isMobile ? 'auto' : 'calc(var(--sidebar-current-width, 280px))',
      right: 0,
      bottom: isMobile ? 'auto' : 0,
      padding: isMobile ? '1rem 0.75rem' : '0.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: isMobile ? 'visible' : 'hidden',
      background: 'transparent',
    }}>
      {editDoc && (
        <EditModal
          doc={editDoc}
          templates={templates}
          masterData={masterData}
          onClose={() => setEditDoc(null)}
          onSaved={() => { handleRefresh(); setEditDoc(null); }}
        />
      )}
      {duplicateDoc && (
        <DuplicateModal
          doc={duplicateDoc}
          templates={templates}
          masterData={masterData}
          onClose={() => setDuplicateDoc(null)}
          onSaved={() => { handleRefresh(); setDuplicateDoc(null); }}
        />
      )}

      <div style={{ ...card, padding: isMobile ? '1rem' : '1.5rem', borderRadius: '1rem', flex: isMobile ? '0 0 auto' : 1, display: 'flex', flexDirection: 'column', minHeight: isMobile ? 'auto' : 0, overflow: isMobile ? 'visible' : 'hidden' }}>

        {/* ── Filter Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: 160, flex: '1 1 160px', maxWidth: 220 }}>
              <input
                type="search"
                value={searchTerm}
                placeholder="Cari dokumen..."
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                autoComplete="off"
                style={{ width: '100%', height: '2.1rem', padding: '0 0.75rem', fontSize: '0.82rem', border: `1px solid ${token.border}`, borderRadius: '0.5rem', outline: 'none', fontFamily: 'inherit', color: token.text, background: '#fff', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = token.blueMid}
                onBlur={e => e.target.style.borderColor = token.border}
              />
            </div>
            {/* Int/Ext */}
            <select
              value={searchIntExt}
              onChange={e => { setSearchIntExt(e.target.value); setCurrentPage(1); }}
              style={{ height: '2.1rem', padding: '0 1.8rem 0 0.65rem', fontSize: '0.82rem', border: `1px solid ${token.border}`, borderRadius: '0.5rem', outline: 'none', fontFamily: 'inherit', color: token.text, background: '#fff', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
            >
              <option value="">Semua</option>
              <option value="Internal">Internal</option>
              <option value="External">External</option>
            </select>
            {/* Date */}
            <input
              type="date"
              value={searchDate}
              onChange={e => { setSearchDate(e.target.value); setCurrentPage(1); }}
              style={{ height: '2.1rem', padding: '0 0.65rem', fontSize: '0.82rem', border: `1px solid ${token.border}`, borderRadius: '0.5rem', outline: 'none', fontFamily: 'inherit', color: searchDate ? token.text : '#94a3b8', background: '#fff', cursor: 'pointer' }}
            />
            {/* Page size */}
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{ height: '2.1rem', padding: '0 1.8rem 0 0.65rem', fontSize: '0.82rem', border: `1px solid ${token.border}`, borderRadius: '0.5rem', outline: 'none', fontFamily: 'inherit', color: token.text, background: '#fff', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
            >
              {[10,25,50,75,100].map(n => <option key={n} value={n}>{n} / hal</option>)}
            </select>
            {/* Reset */}
            {(searchTerm || searchDate || searchIntExt) && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSearchDate(''); setSearchIntExt(''); setCurrentPage(1); }}
                title="Reset Filter"
                style={{ height: '2.1rem', padding: '0 0.65rem', fontSize: '0.82rem', fontWeight: 600, border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.07)', color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
          {/* Right: count + refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: token.muted, background: 'rgba(26,42,87,0.07)', border: `1px solid ${token.border}`, padding: '0.22rem 0.65rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
              {filtered.length} dokumen
            </span>
            <button
              type="button"
              onClick={fetchData}
              disabled={tableLoading}
              title="Refresh"
              style={{ height: '2.1rem', width: '2.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${token.border}`, borderRadius: '0.5rem', background: '#fff', cursor: tableLoading ? 'not-allowed' : 'pointer', color: token.muted, flexShrink: 0 }}
            >
              <RefreshCw size={13} style={tableLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
          </div>
        </div>

        {isMobile ? (
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.1rem' }}>
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {pageData.map((doc, idx) => (
                <MobileDocCard
                  key={doc.id}
                  doc={doc}
                  index={(currentPage - 1) * pageSize + idx + 1}
                  onDuplicate={setDuplicateDoc}
                  onEdit={setEditDoc}
                  onDownload={hDownload}
                  isCompact={isCompactMobile}
                />
              ))}
              {pageData.length === 0 && (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: token.muted, border: `1px solid ${token.border}`, borderRadius: '0.9rem' }}>
                  <FileText size={28} style={{ display: 'block', margin: '0 auto 0.6rem', opacity: 0.35 }} />
                  Tidak ada data
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: token.surface, borderRadius: '1rem', border: `1px solid ${token.border}`, boxShadow: '0 18px 44px rgba(15, 23, 42, 0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.855rem', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  {[
                    'No',
                    'Kode PT',
                    'No. Dokumen',
                    'Judul',
                    'Tanggal',
                    'User',
                    'Divisi',
                    'Int/Ext',
                    'Aksi',
                  ].map(h => (
                    <th key={h} style={{ ...tableHeaderCellStyle, borderBottom: `1px solid ${token.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((doc, idx) => {
                  const isExpanded = expandedRows.has(doc.id);
                  return (
                    <React.Fragment key={doc.id}>
                      <tr
                        style={{ transition: 'background 0.15s ease', cursor: 'pointer', background: isExpanded ? 'rgba(26,42,87,0.025)' : 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,42,87,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isExpanded ? 'rgba(26,42,87,0.025)' : 'transparent'; }}
                        onClick={() => toggleRow(doc.id)}
                      >
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle', textAlign: 'center', padding: '0.75rem 0.45rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.18rem' }}>
                            <span style={{ fontSize: '0.72rem', color: token.muted, fontWeight: 700, lineHeight: 1 }}>{(currentPage - 1) * pageSize + idx + 1}</span>
                            <ChevronDown size={12} style={{ color: token.muted, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                          </div>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle', textAlign: 'center' }}>
                          <span style={{ ...(badgeStyles[doc.company] || badgeStyles.PKP), padding: '0.18rem 0.5rem', borderRadius: '999px', fontSize: '0.67rem', fontWeight: 700, whiteSpace: 'nowrap', display: 'inline-block' }}>
                            {doc.company}
                          </span>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle' }}>
                          <div style={{ ...tablePrimaryTextStyle, display: 'flex', alignItems: 'flex-start', gap: '0.4rem', minWidth: 0 }}>
                            <span style={{ flex: 1, lineHeight: 1.5, fontWeight: 700, wordBreak: 'break-word' }}>{doc.doc_number}</span>
                            <button
                              onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(doc.doc_number); alert('Nomor disalin!'); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.muted, display: 'flex', alignItems: 'center', padding: '0.15rem 0', flex: '0 0 auto' }}
                              title="Salin Nomor"
                              onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = token.blue; }}
                              onMouseLeave={e => { e.stopPropagation(); e.currentTarget.style.color = token.muted; }}
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle' }}>
                          <div style={{ ...tablePrimaryTextStyle, ...clampThreeLinesStyle, fontWeight: 600 }}>{dash(doc.judul_dokumen)}</div>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle' }}>
                          <div style={{ ...tablePrimaryTextStyle, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatDate(doc.doc_date)}</div>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle' }}>
                          <div style={{ ...tablePrimaryTextStyle, ...clampThreeLinesStyle }}>{dash(doc.user_name)}</div>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle' }}>
                          <div style={{ ...tableSecondaryTextStyle, ...clampThreeLinesStyle }}>{dash(doc.division)}</div>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle' }}>
                          <div style={{ ...tablePrimaryTextStyle, whiteSpace: 'nowrap' }}>{dash(doc.internal_external)}</div>
                        </td>
                        <td style={{ ...tableBodyCellComfortStyle, verticalAlign: 'middle' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.35rem', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <Btn variant="soft" style={{ padding: '0.42rem', justifyContent: 'center', flex: '0 0 auto' }} onClick={() => setDuplicateDoc(doc)} title="Duplikat">
                              <Copy size={13} />
                            </Btn>
                            <Btn variant="ghost" style={{ padding: '0.42rem', justifyContent: 'center', flex: '0 0 auto' }} onClick={() => setEditDoc(doc)} title="Edit">
                              <Edit size={13} />
                            </Btn>
                            <Btn variant="success" style={{ padding: '0.42rem', justifyContent: 'center', flex: '0 0 auto' }} onClick={() => hDownload(doc)} title="Unduh">
                              <Download size={13} />
                            </Btn>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} style={{ padding: '0 0.9rem 1rem', borderBottom: `1px solid ${token.border}`, background: 'rgba(248,250,252,0.72)' }}>
                            <div style={{ padding: '0.95rem 1.1rem', borderRadius: '0.85rem', background: token.surface, border: `1px solid ${token.border}`, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.9rem 1.3rem' }}>
                              <InfoPair label="Klasifikasi" value={doc.klasifikasi} muted full />
                              <InfoPair label="Penandatangan" value={doc.signed_by} full />
                              <div style={{ minWidth: 0 }}>
                                <div style={tableLabelStyle}>Link</div>
                                {doc.link_document
                                  ? <a href={doc.link_document} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '0.82rem', color: token.blue, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', textDecoration: 'none' }}>
                                      <Link size={12} style={{ flex: '0 0 auto' }} /> Buka Link
                                    </a>
                                  : <div style={{ ...tableSecondaryTextStyle, marginTop: '0.2rem' }}>-</div>
                                }
                              </div>
                              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.9rem 1.3rem' }}>
                                <InfoPair label="Perihal" value={doc.perihal} full />
                                <InfoPair label="Keterangan" value={doc.keterangan} muted full />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {pageData.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: '3.5rem', textAlign: 'center', color: token.muted }}>
                    <FileText size={28} style={{ display: 'block', margin: '0 auto 0.6rem', opacity: 0.35 }} />
                    Tidak ada data
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginTop: '1rem', padding: '0 0.25rem', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
            <span style={{ fontSize: '0.78rem', color: token.muted, textAlign: isMobile ? 'center' : 'left' }}>
              {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-end' }}>
              <Btn variant="ghost" style={{ padding: '0.35rem 0.65rem', justifyContent: 'center' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </Btn>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <Btn key={page} variant={page === currentPage ? 'primary' : 'ghost'} style={{ padding: '0.35rem 0.65rem', minWidth: '2.2rem', justifyContent: 'center' }} onClick={() => setCurrentPage(page)}>
                    {page}
                  </Btn>
                );
              })}
              <Btn variant="ghost" style={{ padding: '0.35rem 0.65rem', justifyContent: 'center' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight size={16} />
              </Btn>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default HistoryView;
