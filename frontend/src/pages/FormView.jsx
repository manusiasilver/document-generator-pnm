import React, { useEffect, useState } from 'react';
import {
  Copy, Download, RefreshCw, Save, Plus, CalendarDays,
  Building2, FileText, User, AlignLeft, CheckCircle2,
} from 'lucide-react';
import { token, card } from './SharedUI';
import { useAuth } from '../context/AuthContext';

const MOBILE_BP = 768;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/* ─── Primitives ─────────────────────────────────────────────── */

const baseInp = {
  width: '100%',
  height: '2.5rem',
  padding: '0 0.8rem',
  fontSize: '0.875rem',
  color: token.text,
  background: '#fff',
  border: '1.5px solid #e2e8f0',
  borderRadius: '0.55rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: `border-color 150ms ${EASE}, box-shadow 150ms ${EASE}`,
  boxSizing: 'border-box',
};

function Inp({ readOnly, style, ...props }) {
  const ro = readOnly ? { background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', borderColor: '#f1f5f9' } : {};
  return (
    <input
      readOnly={readOnly}
      {...props}
      style={{ ...baseInp, ...ro, ...style }}
      onFocus={e => { if (!readOnly) { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.10)'; } }}
      onBlur={e => { e.target.style.borderColor = ro.borderColor || '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function Sel({ children, style, disabled, ...props }) {
  return (
    <select
      disabled={disabled}
      {...props}
      style={{
        ...baseInp,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? '#f8fafc' : '#fff',
        color: disabled ? '#94a3b8' : token.text,
        paddingRight: '2rem',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.7rem center',
        ...style,
      }}
      onFocus={e => { if (!disabled) { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.10)'; } }}
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
      style={{ ...baseInp, height: 'auto', padding: '0.6rem 0.8rem', resize: 'vertical', lineHeight: 1.6, ...style }}
      onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.10)'; }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function DatePicker({ name, value, onChange, required }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ ...baseInp, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: value ? token.text : '#94a3b8' }}>
        <span style={{ fontSize: '0.875rem' }}>{value || 'Pilih tanggal'}</span>
        <CalendarDays size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
      </div>
      <input
        type="date" name={name} value={value} onChange={onChange} required={required}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 'none' }}
        onFocus={e => { e.currentTarget.previousSibling.style.borderColor = '#3b82f6'; e.currentTarget.previousSibling.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.10)'; }}
        onBlur={e => { e.currentTarget.previousSibling.style.borderColor = '#e2e8f0'; e.currentTarget.previousSibling.style.boxShadow = 'none'; }}
        onClick={e => e.currentTarget.showPicker?.()}
      />
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ fontSize: '0.71rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </span>
      {children}
    </div>
  );
}

function SectionDivider({ icon: Icon, label, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1.5rem 0 1rem' }}>
      <div style={{ width: 26, height: 26, borderRadius: '0.4rem', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color={accent} />
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
    </div>
  );
}

function Grid({ cols, isMobile, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : cols, gap: '0.875rem' }}>
      {children}
    </div>
  );
}

/* ─── Result Banner ──────────────────────────────────────────── */
function ResultBanner({ doc, isMobile, loading, onCopy, onDownload, onDuplicate, onSave, onNew }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a2a57 0%, #2d4a8c 100%)',
      borderRadius: '0.875rem',
      padding: isMobile ? '1.25rem 1rem' : '1.5rem',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 16px 40px rgba(26,42,87,0.20)',
      marginTop: '2rem',
      animation: `fUp 480ms ${EASE} both`,
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.07) 0%, transparent 45%), radial-gradient(circle at 5% 85%, rgba(255,255,255,0.05) 0%, transparent 40%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <CheckCircle2 size={14} color="#4ade80" />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Nomor Dokumen Berhasil Dibuat</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: 800, letterSpacing: '0.5px', wordBreak: 'break-all', lineHeight: 1.2 }}>
            {doc.doc_number}
          </span>
          <button type="button" onClick={onCopy} title="Salin"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '0.45rem', padding: '5px 7px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          ><Copy size={14} /></button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
          {[
            { label: 'Buat Baru', icon: <Plus size={13} />, onClick: onNew, bg: '#fff', color: token.blue },
            { label: 'Duplikat', icon: <Copy size={13} />, onClick: onDuplicate, bg: 'rgba(255,255,255,0.12)', color: '#fff', border: true },
            { label: 'Download .docx', icon: <Download size={13} />, onClick: onDownload, bg: '#4ade80', color: '#14532d' },
          ].map(({ label, icon, onClick, bg, color, border }) => (
            <button key={label} type="button" onClick={onClick}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: '0.5rem', border: border ? '1px solid rgba(255,255,255,0.22)' : 'none', background: bg, color, cursor: 'pointer', fontFamily: 'inherit' }}>
              {icon}{label}
            </button>
          ))}
          <button type="submit" onClick={onSave} disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}>
            {loading ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function FormView({
  editingDoc, generatedDoc, formData, templates, masterData,
  loading, hChange, hSubmit, hDownload, resetForm, startDuplicate,
}) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BP);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= MOBILE_BP);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <div style={{
      ...(isMobile ? {} : {}),
      position: isMobile ? 'static' : 'fixed',
      top: isMobile ? 'auto' : '145px',
      left: isMobile ? 'auto' : 'calc(var(--sidebar-current-width, 280px))',
      right: 0,
      bottom: isMobile ? 'auto' : 0,
      padding: isMobile ? '1rem 0.75rem' : '0.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflowY: 'auto',
    }}>
      <style>{`
        @keyframes fUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ ...card, padding: isMobile ? '1rem' : '1.5rem', borderRadius: isMobile ? '0.9rem' : '1rem', flex: '0 0 auto', animation: `fUp 600ms ${EASE} both` }}>

        <form onSubmit={hSubmit}>

          {/* ── Perusahaan ── */}
          <SectionDivider icon={Building2} label="Perusahaan" accent="#6366f1" />
          <Grid cols="1fr 1fr 1fr" isMobile={isMobile}>
            <Field label="Pilih Perusahaan">
              <Sel name="company" value={formData.company} onChange={hChange} disabled={!!editingDoc}>
                <option value="PNM">PT Pilar Niaga Makmur (PNM)</option>
                <option value="PKS">PT Pilkada (PKS)</option>
                <option value="PKP">PT Pikasa (PKP)</option>
              </Sel>
            </Field>
            <Field label="Template Dokumen">
              <Sel name="template_name" value={formData.template_name} onChange={hChange}>
                {templates.length === 0
                  ? <option value="">— Belum ada template —</option>
                  : templates.map(t => <option key={t} value={t}>{t}</option>)
                }
              </Sel>
            </Field>
            <Field label="Internal / External">
              <Sel name="internal_external" value={formData.internal_external} onChange={hChange}>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </Sel>
            </Field>
          </Grid>

          {/* ── Judul ── */}
          <SectionDivider icon={FileText} label="Judul Dokumen" accent="#3b82f6" />
          <Field label="Judul Dokumen" required>
            <Inp type="text" name="judul_dokumen" value={formData.judul_dokumen} onChange={hChange} placeholder="Contoh: Perjanjian Kerja Sama Pemasaran..." required />
          </Field>

          {/* ── Pengguna & Tanggal ── */}
          <SectionDivider icon={User} label="Pengguna & Tanggal" accent="#10b981" />
          <Grid cols="1fr 1fr 1fr 1fr" isMobile={isMobile}>
            <Field label="User">
              <Inp value={user?.name || ''} readOnly />
            </Field>
            <Field label="Divisi" required>
              <Sel name="division" value={formData.division} onChange={hChange} required>
                <option value="">— Pilih —</option>
                {masterData.divisions.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
              </Sel>
            </Field>
            <Field label="Tanggal Dokumen" required>
              <DatePicker name="doc_date" value={formData.doc_date} onChange={hChange} required />
            </Field>
            <Field label="Klasifikasi">
              <Inp type="text" name="klasifikasi" value={formData.klasifikasi} onChange={hChange} placeholder="Surat Edaran..." />
            </Field>
          </Grid>

          {/* ── Detail ── */}
          <SectionDivider icon={AlignLeft} label="Detail Dokumen" accent="#f59e0b" />
          <Grid cols="1fr 1fr" isMobile={isMobile}>
            <Field label="Perihal">
              <Inp type="text" name="perihal" value={formData.perihal} onChange={hChange} placeholder="Perihal dokumen..." />
            </Field>
            <Field label="Ditandatangani Oleh">
              <Inp type="text" name="signed_by" value={formData.signed_by} onChange={hChange} placeholder="Nama penandatangan" />
            </Field>
            <Field label="Link Dokumen">
              <Inp type="text" name="link_document" value={formData.link_document} onChange={hChange} placeholder="https://..." />
            </Field>
            <Field label="Keterangan">
              <Textarea name="keterangan" value={formData.keterangan} onChange={hChange} placeholder="Catatan opsional..." rows={2} />
            </Field>
          </Grid>

          {/* ── Result / Submit ── */}
          {generatedDoc ? (
            <ResultBanner
              doc={generatedDoc} isMobile={isMobile} loading={loading}
              onCopy={() => { navigator.clipboard.writeText(generatedDoc.doc_number); alert('Nomor disalin!'); }}
              onDownload={() => hDownload(generatedDoc)}
              onDuplicate={() => startDuplicate(generatedDoc)}
              onSave={hSubmit}
              onNew={resetForm}
            />
          ) : (
            <div style={{ display: 'flex', justifyContent: isMobile ? 'stretch' : 'center', marginTop: '2rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.7rem 2.25rem', fontSize: '0.9rem', fontWeight: 700,
                  borderRadius: '0.65rem', border: 'none',
                  background: `linear-gradient(135deg, ${token.blue} 0%, ${token.blueMid} 100%)`,
                  color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  boxShadow: '0 8px 20px rgba(26,42,87,0.22)', fontFamily: 'inherit',
                  transition: `transform 150ms ${EASE}, box-shadow 150ms ${EASE}`,
                  width: isMobile ? '100%' : 'auto',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 28px rgba(26,42,87,0.28)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(26,42,87,0.22)'; }}
              >
                {loading
                  ? <><RefreshCw size={17} style={{ animation: 'spin 1s linear infinite' }} /> Memproses...</>
                  : editingDoc
                    ? <><Save size={17} /> Simpan Perubahan</>
                    : <><Plus size={17} /> Generate Nomor Baru</>
                }
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
