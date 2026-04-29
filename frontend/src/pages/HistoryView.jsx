import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Search, X, Copy, Edit, Download, Link, FileText, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { token, Btn, wrap, card, Inp, badgeStyles, Field, Sel, Divider } from './SharedUI';

const API_URL = 'http://localhost:3001/api';
const MOBILE_BREAKPOINT = 768;
const COMPACT_MOBILE_BREAKPOINT = 480;

const getToday = () => new Date().toISOString().split('T')[0];
const dash = value => value || '-';

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

  const hUser = e => {
    const u = masterData.users.find(user => user.name === e.target.value);
    const div = masterData.divisions.find(item => item.name === u?.division);
    setForm(p => ({
      ...p,
      user_name: e.target.value,
      division: u?.division || '',
      klasifikasi: (div?.klasifikasi && div.klasifikasi !== '-') ? div.klasifikasi : p.klasifikasi,
    }));
  };

  const hSubmit = async e => {
    e.preventDefault();
    if (!form.user_name || !form.doc_date) { alert('Harap isi User dan Tanggal!'); return; }
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
            <Field label="User *">
              <Sel name="user_name" value={form.user_name} onChange={hUser} required>
                <option value="">-- Pilih --</option>
                {masterData.users.map((u, i) => <option key={i} value={u.name}>{u.name}</option>)}
              </Sel>
            </Field>
            <Field label="Divisi">
              <Inp value={form.division} readOnly placeholder="Otomatis" />
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

  const hUser = e => {
    const u = masterData.users.find(user => user.name === e.target.value);
    const div = masterData.divisions.find(item => item.name === u?.division);
    setForm(p => ({
      ...p,
      user_name: e.target.value,
      division: u?.division || '',
      klasifikasi: (div?.klasifikasi && div.klasifikasi !== '-') ? div.klasifikasi : p.klasifikasi,
    }));
  };

  const hSubmit = async e => {
    e.preventDefault();
    if (!form.user_name || !form.doc_date) { alert('Harap isi User dan Tanggal!'); return; }
    setSaving(true);
    try {
      await axios.post(`${API_URL}/generate`, form);
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
            <Field label="User *">
              <Sel name="user_name" value={form.user_name} onChange={hUser} required>
                <option value="">-- Pilih --</option>
                {masterData.users.map((u, i) => <option key={i} value={u.name}>{u.name}</option>)}
              </Sel>
            </Field>
            <Field label="Divisi">
              <Inp value={form.division} readOnly placeholder="Otomatis" />
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

function DetailModal({ doc, onClose, isMobile = false }) {
  const renderItem = (label, value) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: token.muted }}>
        {label}
      </span>
      <div style={{ 
        width: '100%', padding: '0.6rem 0.8rem', fontSize: '0.88rem', color: token.text,
        background: '#f8fafc', border: `1px solid ${token.border}`, borderRadius: '0.5rem',
        minHeight: '2.4rem', wordBreak: 'break-word'
      }}>
        {value || '-'}
      </div>
    </div>
  );

  return (
    <>
      <Overlay onClick={onClose} />
      <ModalBox maxWidth="700px" scrollable isMobile={isMobile}>
        <ModalHeader subtitle="Detail Dokumen" title={doc.doc_number} onClose={onClose} isMobile={isMobile} />
        <div style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
          <DetailGrid isMobile={isMobile} columns="1fr 1fr 1fr">
            {renderItem('Kode PT', doc.company)}
            {renderItem('Template Dokumen', doc.template_name)}
            {renderItem('Internal / External', doc.internal_external)}
          </DetailGrid>
          <div style={{ marginTop: '1rem' }}>
            {renderItem('Judul Dokumen', doc.judul_dokumen)}
          </div>
          
          <Divider label="Pengguna & Tanggal" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr 1fr 1fr">
            {renderItem('User', doc.user_name)}
            {renderItem('Divisi', doc.division)}
            {renderItem('Tanggal', doc.doc_date)}
            {renderItem('Klasifikasi', doc.klasifikasi)}
          </DetailGrid>

          <Divider label="Detail Tambahan" />
          <DetailGrid isMobile={isMobile} columns="1fr 1fr">
            {renderItem('Perihal', doc.perihal)}
            {renderItem('Di Tanda Tangani Oleh', doc.signed_by)}
            {renderItem('Link Dokumen', doc.link_document ? <a href={doc.link_document} target="_blank" rel="noopener noreferrer" style={{color: token.blue}}>{doc.link_document}</a> : '-')}
            {renderItem('Keterangan', doc.keterangan)}
          </DetailGrid>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${token.border}`, display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={onClose}>Tutup</Btn>
          </div>
        </div>
      </ModalBox>
    </>
  );
}

function MobileDocCard({ doc, index, onDuplicate, onEdit, onDownload, onShowDetail, isCompact = false }) {
  const renderMetaBlock = (label, value, span = '1fr') => (
    <div style={{ minWidth: 0, gridColumn: span }}>
      <div style={{ fontSize: '0.68rem', color: token.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.18rem' }}>{label}</div>
      <div style={{ fontSize: '0.82rem', color: token.text, lineHeight: 1.4, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ border: `1px solid ${token.border}`, borderRadius: '1rem', background: token.surface, padding: isCompact ? '0.85rem' : '1rem', boxShadow: '0 12px 28px rgba(17, 38, 75, 0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.8rem', flexDirection: isCompact ? 'column' : 'row' }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: token.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Dokumen #{index}
          </div>
          <div 
            onClick={() => onShowDetail(doc)}
            style={{ fontSize: '0.96rem', fontWeight: 800, color: token.blue, lineHeight: 1.35, wordBreak: 'break-word', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '4px' }}
            title="Lihat Detail"
          >
            {doc.doc_number}
          </div>
        </div>
        <span style={{ ...(badgeStyles[doc.company] || badgeStyles.PKP), padding: '0.24rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{doc.company}</span>
      </div>

      <div style={{ fontSize: '0.94rem', color: token.text, fontWeight: 700, marginBottom: '0.85rem', lineHeight: 1.45 }}>
        {dash(doc.judul_dokumen)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: '0.75rem 0.8rem', marginBottom: '1rem', padding: isCompact ? '0.75rem' : '0.85rem', borderRadius: '0.8rem', background: 'rgba(26,42,87,0.035)' }}>
        {renderMetaBlock('Tanggal', dash(doc.doc_date))}
        {renderMetaBlock('Int/Ext', dash(doc.internal_external))}
        {renderMetaBlock('User', dash(doc.user_name))}
        {renderMetaBlock('Divisi', dash(doc.division))}
        {renderMetaBlock('Klasifikasi', dash(doc.klasifikasi))}
        {renderMetaBlock('Penandatangan', dash(doc.signed_by))}
        {renderMetaBlock('Perihal', dash(doc.perihal), '1 / -1')}
        {renderMetaBlock('Keterangan', dash(doc.keterangan), '1 / -1')}
      </div>

      <div style={{ display: 'grid', gap: '0.55rem', paddingTop: '0.9rem', borderTop: `1px solid ${token.border}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr 1fr' : '1fr 1fr 1fr', gap: '0.45rem' }}>
          <Btn variant="soft" style={{ padding: '0.55rem 0.35rem', fontSize: '0.74rem', justifyContent: 'center', gridColumn: isCompact ? '1 / -1' : 'auto' }} onClick={() => onDuplicate(doc)}>
            <Copy size={13} /> Duplikat
          </Btn>
          <Btn variant="ghost" style={{ padding: '0.55rem 0.35rem', fontSize: '0.74rem', justifyContent: 'center' }} onClick={() => onEdit(doc)}>
            <Edit size={13} /> Edit
          </Btn>
          <Btn variant="success" style={{ padding: '0.55rem 0.35rem', fontSize: '0.74rem', justifyContent: 'center' }} onClick={() => onDownload(doc)}>
            <Download size={13} /> Download
          </Btn>
        </div>
        {doc.link_document ? (
          <a href={doc.link_document} target="_blank" rel="noopener noreferrer" style={{ color: token.blue, textDecoration: 'none', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, minHeight: '2.35rem', borderRadius: '0.7rem', background: 'rgba(26,42,87,0.05)', border: `1px solid ${token.border}` }}>
            <Link size={14} />
            Buka Link
          </a>
        ) : (
          <span style={{ color: token.muted, fontSize: '0.78rem', textAlign: 'center', minHeight: '2.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.7rem', background: 'rgba(148,163,184,0.08)' }}>Tidak ada link</span>
        )}
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
  const [detailDoc, setDetailDoc] = useState(null);
  const isMobile = useViewportFlag(MOBILE_BREAKPOINT);
  const isCompactMobile = useViewportFlag(COMPACT_MOBILE_BREAKPOINT);

  return (
    <div style={{ ...wrap, padding: isMobile ? '1rem 0.75rem' : '1.5rem 1rem' }}>
      {detailDoc && (
        <DetailModal
          doc={detailDoc}
          onClose={() => setDetailDoc(null)}
          isMobile={isMobile}
        />
      )}
      {editDoc && (
        <EditModal
          doc={editDoc}
          templates={templates}
          masterData={masterData}
          onClose={() => setEditDoc(null)}
          onSaved={() => { fetchData(); setEditDoc(null); }}
        />
      )}
      {duplicateDoc && (
        <DuplicateModal
          doc={duplicateDoc}
          templates={templates}
          masterData={masterData}
          onClose={() => setDuplicateDoc(null)}
          onSaved={() => { fetchData(); setDuplicateDoc(null); }}
        />
      )}

      <div style={{ ...card, padding: isMobile ? '1rem' : '1.5rem', borderRadius: isMobile ? '0.9rem' : '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.2rem' }}>
              Riwayat Dokumen
            </h1>
            <p style={{ fontSize: '0.83rem', color: token.muted }}>{filtered.length} dokumen ditemukan</p>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem', alignItems: 'center', gridTemplateColumns: isMobile ? (isCompactMobile ? '1fr' : '1fr 1fr') : 'repeat(4, auto)', width: isMobile ? '100%' : 'auto' }}>
            <Inp
              type="date"
              value={searchDate}
              onChange={e => { setSearchDate(e.target.value); setCurrentPage(1); }}
              style={{ width: isMobile ? '100%' : '160px' }}
            />
            {(searchTerm || searchDate || searchIntExt) && (
              <Btn
                variant="danger"
                onClick={() => { setSearchTerm(''); setSearchDate(''); setSearchIntExt(''); setCurrentPage(1); }}
                style={{ justifyContent: 'center', width: isMobile ? '100%' : 'auto' }}
                title="Hapus semua filter"
              >
                <X size={16} />
                {isMobile && 'Reset'}
              </Btn>
            )}
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{
                padding: '0.5rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer',
                background: token.surface, border: `1px solid ${token.border}`, borderRadius: '0.5rem',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
            </select>
            <Btn variant="ghost" onClick={fetchData} disabled={tableLoading} style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              <RefreshCw size={13} style={tableLoading ? { animation: 'spin 1s linear infinite' } : {}} />
              {tableLoading ? 'Memuat...' : 'Refresh'}
            </Btn>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ flex: '1 1 260px', position: 'relative', width: isMobile ? '100%' : 'auto' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: token.muted, pointerEvents: 'none' }} />
            <Inp
              type="text"
              placeholder="Cari Kode PT, nomor, judul, user..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
          <select
            value={searchIntExt}
            onChange={e => { setSearchIntExt(e.target.value); setCurrentPage(1); }}
            style={{
              flex: '0 0 140px', padding: '0.6rem 0.8rem', fontSize: '0.88rem',
              background: token.surface, border: `1px solid ${token.border}`,
              borderRadius: '0.5rem', cursor: 'pointer', color: searchIntExt ? token.text : token.muted,
              width: isMobile ? '100%' : '140px',
            }}
          >
            <option value="">Semua</option>
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>

        {isMobile ? (
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {pageData.map((doc, idx) => (
              <MobileDocCard
                key={doc.id}
                doc={doc}
                index={(currentPage - 1) * pageSize + idx + 1}
                onDuplicate={setDuplicateDoc}
                onEdit={setEditDoc}
                onDownload={hDownload}
                onShowDetail={setDetailDoc}
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
        ) : (
          <div style={{ overflowX: 'auto', background: token.surface, borderRadius: '0.875rem', border: `1px solid ${token.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${token.border}` }}>
                  {[
                    ['Aksi', '11rem'],
                    ['No', '3rem'],
                    ['Nomor Dokumen', 'auto'],
                    ['Tanggal', '7rem'],
                    ['Kode PT', '4.5rem'],
                    ['Judul', 'auto'],
                    ['User', 'auto'],
                    ['Divisi', 'auto'],
                    ['Int/Ext', 'auto'],
                    ['Klasifikasi', 'auto'],
                    ['Perihal', 'auto'],
                    ['Penandatangan', 'auto'],
                    ['Keterangan', '15rem'],
                    ['Link', '4rem'],
                  ].map(([h, w]) => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: token.muted, width: w, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    style={{ borderBottom: `1px solid ${token.border}`, transition: 'background 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,42,87,0.025)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <Btn variant="soft" style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setDuplicateDoc(doc)} title="Duplikat">
                          <Copy size={12} />
                        </Btn>
                        <Btn variant="ghost" style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setEditDoc(doc)} title="Edit">
                          <Edit size={12} />
                        </Btn>
                        <Btn variant="success" style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => hDownload(doc)} title="Download Docx">
                          <Download size={12} />
                        </Btn>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: token.muted, fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: token.blue, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span 
                          onClick={() => setDetailDoc(doc)}
                          style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '4px' }}
                          title="Lihat Detail"
                        >
                          {doc.doc_number}
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(doc.doc_number);
                            alert('Nomor disalin!');
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.muted, display: 'flex', alignItems: 'center', padding: '2px' }}
                          title="Salin Nomor"
                          onMouseEnter={e => e.currentTarget.style.color = token.blue}
                          onMouseLeave={e => e.currentTarget.style.color = token.muted}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: token.muted, whiteSpace: 'nowrap' }}>{doc.doc_date}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      <span style={{ ...(badgeStyles[doc.company] || badgeStyles.PKP), padding: '0.18rem 0.55rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>{doc.company}</span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', color: token.text, minWidth: 200, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.judul_dokumen || <span style={{ color: token.muted }}>-</span>}</td>
                    <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.user_name}</td>
                    <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.division}</td>
                    <td style={{ padding: '0.8rem 1rem', color: token.text }}>{doc.internal_external}</td>
                    <td style={{ padding: '0.8rem 1rem', color: token.text }}>{doc.klasifikasi || '-'}</td>
                    <td style={{ padding: '0.8rem 1rem', color: token.text, minWidth: 150 }}>{doc.perihal || '-'}</td>
                    <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.signed_by || '-'}</td>
                    <td style={{ padding: '0.8rem 1rem', color: token.muted, fontSize: '0.78rem', minWidth: 200 }}>{doc.keterangan || '-'}</td>
                    <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                      {doc.link_document ? (
                        <a href={doc.link_document} target="_blank" rel="noopener noreferrer" style={{ color: token.blue }}>
                          <Link size={14} />
                        </a>
                      ) : <span style={{ color: token.muted }}>-</span>}
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
