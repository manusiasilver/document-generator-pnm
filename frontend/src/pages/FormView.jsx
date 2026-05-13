import React, { useEffect, useState } from 'react';
import {
  Copy, Download, RefreshCw, Save, Plus, CalendarDays,
  Building2, FileText, User, AlignLeft, CheckCircle2,
} from 'lucide-react';
import { token, Btn } from './SharedUI';
import { useAuth } from '../context/AuthContext';

const MOBILE_BP = 768;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/* ─── Primitives ─────────────────────────────────────────────── */

function Label({ children, required }) {
  return (
    <span style={{
      display: 'block',
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#64748b',
      marginBottom: '0.35rem',
    }}>
      {children}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </span>
  );
}

const baseInp = {
  width: '100%',
  height: '2.65rem',
  padding: '0 0.85rem',
  fontSize: '0.875rem',
  color: token.text,
  background: '#fff',
  border: '1.5px solid #e2e8f0',
  borderRadius: '0.6rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: `border-color 150ms ${EASE}, box-shadow 150ms ${EASE}`,
  boxSizing: 'border-box',
};

function Inp({ readOnly, style, ...props }) {
  const ro = readOnly ? {
    background: '#f8fafc',
    color: '#94a3b8',
    cursor: 'not-allowed',
    borderColor: '#f1f5f9',
  } : {};
  return (
    <input
      readOnly={readOnly}
      {...props}
      style={{ ...baseInp, ...ro, ...style }}
      onFocus={e => { if (!readOnly) { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; } }}
      onBlur={e => { e.target.style.borderColor = ro.borderColor || '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function Sel({ children, style, ...props }) {
  return (
    <select
      {...props}
      style={{ ...baseInp, cursor: 'pointer', paddingRight: '2rem', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', ...style }}
      onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
    >
      {children}
    </select>
  );
}

function Textarea({ style, ...props }) {
  return (
    <textarea
      {...props}
      style={{ ...baseInp, height: 'auto', padding: '0.65rem 0.85rem', resize: 'vertical', lineHeight: 1.6, ...style }}
      onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function DatePicker({ name, value, onChange, required }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        ...baseInp,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        color: value ? token.text : '#94a3b8',
      }}>
        <span style={{ fontSize: '0.875rem' }}>{value || 'Pilih tanggal'}</span>
        <CalendarDays size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
      </div>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 'none' }}
        onFocus={e => e.currentTarget.previousSibling.style.borderColor = '#3b82f6'}
        onBlur={e => e.currentTarget.previousSibling.style.borderColor = '#e2e8f0'}
        onClick={e => e.currentTarget.showPicker?.()}
      />
    </div>
  );
}

/* ─── Section card ───────────────────────────────────────────── */

function Section({ icon: Icon, label, accent = '#3b82f6', delay = 0, children }) {
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #f1f5f9',
      borderRadius: '1rem',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(26,42,87,0.04)',
      animation: `fUp 600ms ${EASE} both`,
      animationDelay: `${delay}ms`,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '0.9rem 1.25rem',
        borderBottom: '1.5px solid #f1f5f9',
        background: 'linear-gradient(90deg, rgba(248,250,252,0.8) 0%, #fff 100%)',
      }}>
        <div style={{
          width: 30, height: 30,
          borderRadius: '0.5rem',
          background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} color={accent} />
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' }}>
          {label}
        </span>
      </div>
      <div style={{ padding: '1.25rem' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Grid helper ────────────────────────────────────────────── */
function Grid({ cols, isMobile, children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : cols,
      gap: '1rem',
    }}>
      {children}
    </div>
  );
}

/* ─── Field wrapper ──────────────────────────────────────────── */
function F({ label, required, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

/* ─── Result Banner ──────────────────────────────────────────── */
function ResultBanner({ doc, isMobile, loading, onCopy, onDownload, onDuplicate, onSave, onNew }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a2a57 0%, #2d4a8c 100%)',
      borderRadius: '1rem',
      padding: isMobile ? '1.5rem 1.25rem' : '2rem',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 48px rgba(26,42,87,0.22)',
      animation: `fUp 500ms ${EASE} both`,
    }}>
      {/* subtle pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.05) 0%, transparent 45%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <CheckCircle2 size={16} color="#4ade80" />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
            Nomor Dokumen
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: isMobile ? '1.3rem' : '1.65rem', fontWeight: 800, letterSpacing: '0.5px', wordBreak: 'break-all', lineHeight: 1.2 }}>
            {doc.doc_number}
          </span>
          <button
            type="button"
            onClick={onCopy}
            title="Salin"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '0.5rem',
              padding: '6px',
              cursor: 'pointer',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              transition: `background 150ms ${EASE}`,
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <Copy size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
          <button type="button" onClick={onNew} style={actionBtn('#fff', token.blue)}>
            <Plus size={14} /> Buat Baru
          </button>
          <button type="button" onClick={onDuplicate} style={actionBtn('rgba(255,255,255,0.12)', '#fff', true)}>
            <Copy size={14} /> Duplikat
          </button>
          <button type="button" onClick={onDownload} style={actionBtn('#4ade80', '#14532d')}>
            <Download size={14} /> Download .docx
          </button>
          <button type="submit" onClick={onSave} disabled={loading} style={actionBtn('rgba(255,255,255,0.1)', '#fff', true, loading)}>
            {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function actionBtn(bg, color, bordered = false, disabled = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    borderRadius: '0.55rem',
    border: bordered ? '1px solid rgba(255,255,255,0.22)' : 'none',
    background: bg,
    color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    fontFamily: 'inherit',
    transition: 'opacity 150ms, transform 120ms',
    flexShrink: 0,
  };
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function FormView({
  editingDoc,
  generatedDoc,
  formData,
  templates,
  masterData,
  loading,
  hChange,
  hSubmit,
  hDownload,
  resetForm,
  startDuplicate,
}) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BP);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const copyDocNumber = () => {
    navigator.clipboard.writeText(generatedDoc.doc_number);
    alert('Nomor disalin!');
  };

  return (
    <div style={{
      position: isMobile ? 'static' : 'fixed',
      top: isMobile ? 'auto' : '170px',
      left: isMobile ? 'auto' : 'calc(var(--sidebar-current-width, 280px))',
      right: 0,
      bottom: isMobile ? 'auto' : 0,
      padding: isMobile ? '1rem 0.75rem' : '1.25rem 1.75rem',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes fUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Page Header ── */}
        <div style={{ animation: `fUp 500ms ${EASE} both`, paddingBottom: '0.25rem' }}>
          <h1 style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', fontWeight: 800, color: token.blue, margin: 0, letterSpacing: '-0.02em' }}>
            {editingDoc ? 'Edit Dokumen' : 'Generate Dokumen Baru'}
          </h1>
          <p style={{ fontSize: '0.83rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
            {editingDoc ? `Mengedit: ${editingDoc.doc_number}` : 'Isi form untuk membuat nomor dokumen baru'}
          </p>
        </div>

        <form onSubmit={hSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* ── Konfigurasi Dokumen ── */}
          <Section icon={Building2} label="Konfigurasi Dokumen" accent="#6366f1" delay={60}>
            <Grid cols="1fr 1fr 1fr" isMobile={isMobile}>
              <F label="Perusahaan">
                <Sel name="company" value={formData.company} onChange={hChange} disabled={!!editingDoc}
                  style={editingDoc ? { background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' } : {}}>
                  <option value="PNM">PT Pilar Niaga Makmur (PNM)</option>
                  <option value="PKS">PT Pilkada (PKS)</option>
                  <option value="PKP">PT Pikasa (PKP)</option>
                </Sel>
              </F>
              <F label="Template">
                <Sel name="template_name" value={formData.template_name} onChange={hChange}>
                  {templates.length === 0
                    ? <option value="">— Belum ada template —</option>
                    : templates.map(t => <option key={t} value={t}>{t}</option>)
                  }
                </Sel>
              </F>
              <F label="Jenis Dokumen">
                <Sel name="internal_external" value={formData.internal_external} onChange={hChange}>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </Sel>
              </F>
            </Grid>
          </Section>

          {/* ── Judul ── */}
          <Section icon={FileText} label="Judul Dokumen" accent="#3b82f6" delay={120}>
            <F label="Judul Dokumen" required>
              <Inp
                type="text"
                name="judul_dokumen"
                value={formData.judul_dokumen}
                onChange={hChange}
                placeholder="Contoh: Perjanjian Kerja Sama Pemasaran..."
                required
              />
            </F>
          </Section>

          {/* ── Pengguna & Tanggal ── */}
          <Section icon={User} label="Pengguna & Tanggal" accent="#10b981" delay={180}>
            <Grid cols="1fr 1fr 1fr 1fr" isMobile={isMobile}>
              <F label="User">
                <Inp value={user?.name || ''} readOnly />
              </F>
              <F label="Divisi" required>
                <Sel name="division" value={formData.division} onChange={hChange} required>
                  <option value="">— Pilih Divisi —</option>
                  {masterData.divisions.map((d, i) => (
                    <option key={i} value={d.name}>{d.name}</option>
                  ))}
                </Sel>
              </F>
              <F label="Tanggal Dokumen" required>
                <DatePicker name="doc_date" value={formData.doc_date} onChange={hChange} required />
              </F>
              <F label="Klasifikasi">
                <Inp
                  type="text"
                  name="klasifikasi"
                  value={formData.klasifikasi}
                  onChange={hChange}
                  placeholder="Surat Edaran..."
                />
              </F>
            </Grid>
          </Section>

          {/* ── Detail ── */}
          <Section icon={AlignLeft} label="Detail Dokumen" accent="#f59e0b" delay={240}>
            <Grid cols="1fr 1fr" isMobile={isMobile}>
              <F label="Perihal">
                <Inp type="text" name="perihal" value={formData.perihal} onChange={hChange} placeholder="Perihal dokumen..." />
              </F>
              <F label="Ditandatangani Oleh">
                <Inp type="text" name="signed_by" value={formData.signed_by} onChange={hChange} placeholder="Nama penandatangan" />
              </F>
              <F label="Link Dokumen">
                <Inp type="text" name="link_document" value={formData.link_document} onChange={hChange} placeholder="https://..." />
              </F>
              <F label="Keterangan">
                <Textarea name="keterangan" value={formData.keterangan} onChange={hChange} placeholder="Catatan opsional..." rows={2} />
              </F>
            </Grid>
          </Section>

          {/* ── Result / Submit ── */}
          {generatedDoc ? (
            <ResultBanner
              doc={generatedDoc}
              isMobile={isMobile}
              loading={loading}
              onCopy={copyDocNumber}
              onDownload={() => hDownload(generatedDoc)}
              onDuplicate={() => startDuplicate(generatedDoc)}
              onSave={hSubmit}
              onNew={resetForm}
            />
          ) : (
            <div style={{ animation: `fUp 600ms ${EASE} both`, animationDelay: '280ms', display: 'flex', justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: '0.7rem',
                  border: 'none',
                  background: `linear-gradient(135deg, ${token.blue} 0%, ${token.blueMid} 100%)`,
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 8px 24px rgba(26,42,87,0.22)',
                  fontFamily: 'inherit',
                  transition: `transform 150ms ${EASE}, box-shadow 150ms ${EASE}`,
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(26,42,87,0.28)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,42,87,0.22)'; }}
              >
                {loading
                  ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
                  : editingDoc
                    ? <><Save size={18} /> Simpan Perubahan</>
                    : <><Plus size={18} /> Generate Nomor</>
                }
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
