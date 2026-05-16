import React, { useEffect, useState } from 'react';
import {
  Copy, Download, RefreshCw, Save, Plus, CalendarDays,
  Building2, FileText, User, AlignLeft, CheckCircle2,
} from 'lucide-react';
import { token, card } from './SharedUI';
import { useAuth } from '../context/AuthContext';

const MOBILE_BP = 768;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const MOBILE_INPUT_FONT_SIZE = '16px';
const FIELD_HEIGHT = '2.75rem';
const FIELD_PADDING_X = '0.95rem';
const FIELD_BORDER_COLOR = 'rgba(26,42,87,0.10)';
const FIELD_SHADOW = '0 8px 18px rgba(148,163,184,0.08), inset 0 1px 0 rgba(255,255,255,0.75)';

/* ─── Primitives ─────────────────────────────────────────────── */

const baseInp = {
  width: '100%',
  height: FIELD_HEIGHT,
  padding: `0 ${FIELD_PADDING_X}`,
  fontSize: '0.875rem',
  color: token.text,
  background: 'linear-gradient(180deg, #f4f6f8 0%, #eceff3 100%)',
  border: `1px solid ${FIELD_BORDER_COLOR}`,
  borderRadius: '0.9rem',
  outline: 'none',
  fontFamily: 'inherit',
  transition: `border-color 150ms ${EASE}, box-shadow 150ms ${EASE}, background 150ms ${EASE}`,
  boxSizing: 'border-box',
  boxShadow: FIELD_SHADOW,
};

function Inp({ readOnly, style, isMobile, ...props }) {
  const ro = readOnly ? { background: 'linear-gradient(180deg, #f3f6fa 0%, #e9eef5 100%)', color: '#7c8aa5', cursor: 'not-allowed', borderColor: 'rgba(26,42,87,0.08)', boxShadow: 'none' } : {};
  return (
    <input
      readOnly={readOnly}
      {...props}
      style={{ ...baseInp, ...(isMobile ? { fontSize: MOBILE_INPUT_FONT_SIZE } : null), ...ro, ...style }}
      onFocus={e => { if (!readOnly) { e.target.style.borderColor = '#2a9d8f'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(42,157,143,0.12)'; } }}
      onBlur={e => { e.target.style.borderColor = ro.borderColor || FIELD_BORDER_COLOR; e.target.style.background = ro.background || 'linear-gradient(180deg, #f4f6f8 0%, #eceff3 100%)'; e.target.style.boxShadow = ro.boxShadow || FIELD_SHADOW; }}
    />
  );
}

function Sel({ children, style, disabled, isMobile, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        disabled={disabled}
        {...props}
        style={{
          ...baseInp,
          ...(isMobile ? { fontSize: MOBILE_INPUT_FONT_SIZE } : null),
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: disabled ? 'linear-gradient(180deg, #f1f4f7 0%, #e7ebf0 100%)' : 'linear-gradient(180deg, #f4f6f8 0%, #eceff3 100%)',
          color: disabled ? '#7c8aa5' : token.text,
          height: FIELD_HEIGHT,
          paddingLeft: FIELD_PADDING_X,
          paddingRight: '3rem',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          borderColor: disabled ? 'rgba(26,42,87,0.08)' : FIELD_BORDER_COLOR,
          boxShadow: disabled ? 'none' : FIELD_SHADOW,
          ...style,
        }}
        onFocus={e => { if (!disabled) { e.target.style.borderColor = '#2a9d8f'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(42,157,143,0.12)'; } }}
        onBlur={e => { e.target.style.borderColor = disabled ? 'rgba(26,42,87,0.08)' : FIELD_BORDER_COLOR; e.target.style.background = disabled ? 'linear-gradient(180deg, #f1f4f7 0%, #e7ebf0 100%)' : 'linear-gradient(180deg, #f4f6f8 0%, #eceff3 100%)'; e.target.style.boxShadow = disabled ? 'none' : FIELD_SHADOW; }}
      >
        {children}
      </select>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '0.8rem',
          transform: 'translateY(-50%)',
          width: '1.8rem',
          height: '1.8rem',
          borderRadius: '0.7rem',
          background: disabled ? 'rgba(148,163,184,0.12)' : 'linear-gradient(180deg, #ffffff 0%, #eef2f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          border: '1px solid rgba(26,42,87,0.08)',
          boxShadow: '0 4px 12px rgba(148,163,184,0.10)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

function Textarea({ style, isMobile, ...props }) {
  return (
    <textarea
      {...props}
      style={{ ...baseInp, ...(isMobile ? { fontSize: MOBILE_INPUT_FONT_SIZE } : null), height: 'auto', padding: '0.6rem 0.8rem', resize: 'vertical', lineHeight: 1.6, ...style }}
      onFocus={e => { e.target.style.borderColor = '#2a9d8f'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(42,157,143,0.12)'; }}
      onBlur={e => { e.target.style.borderColor = 'rgba(26,42,87,0.12)'; e.target.style.background = 'linear-gradient(180deg, #f4f6f8 0%, #eceff3 100%)'; e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.7)'; }}
    />
  );
}

function DatePicker({ name, value, onChange, required, isMobile }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type="date"
        className="formview-date-input"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          ...baseInp,
          ...(isMobile ? { fontSize: MOBILE_INPUT_FONT_SIZE } : null),
          height: FIELD_HEIGHT,
          paddingLeft: FIELD_PADDING_X,
          paddingRight: '3.1rem',
          color: value ? token.text : '#94a3b8',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          colorScheme: 'light',
        }}
        onFocus={e => { e.target.style.borderColor = '#2a9d8f'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(42,157,143,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = FIELD_BORDER_COLOR; e.target.style.background = 'linear-gradient(180deg, #f4f6f8 0%, #eceff3 100%)'; e.target.style.boxShadow = FIELD_SHADOW; }}
        onClick={e => e.currentTarget.showPicker?.()}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '0.75rem',
          transform: 'translateY(-50%)',
          width: '1.8rem',
          height: '1.8rem',
          borderRadius: '0.7rem',
          background: 'linear-gradient(180deg, #ffffff 0%, #eef2f7 100%)',
          border: '1px solid rgba(26,42,87,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(148,163,184,0.10)',
        }}
      >
        <CalendarDays size={14} style={{ color: '#64748b', flexShrink: 0 }} />
      </div>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.65rem 0 1rem' }}>
      <div style={{ width: 30, height: 30, borderRadius: '0.75rem', background: `linear-gradient(135deg, ${accent}24 0%, rgba(255,255,255,0.95) 100%)`, border: `1px solid ${accent}26`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color={accent} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${accent}30 0%, rgba(26,42,87,0.08) 60%, transparent 100%)` }} />
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
      padding: isMobile ? '0.5rem 0' : '0',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      minHeight: '100%',
    }}>
      <style>{`
        @keyframes fUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .formview-date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .formview-date-input::-webkit-datetime-edit {
          color: inherit;
        }
      `}</style>

      <div style={{
        ...card,
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: isMobile ? '1rem' : '1.2rem',
        flex: '0 0 auto',
        animation: `fUp 600ms ${EASE} both`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
        border: '1px solid rgba(26,42,87,0.10)',
        boxShadow: '0 24px 48px rgba(17,38,75,0.08)',
        overflow: 'hidden',
      }}>
        <form onSubmit={hSubmit}>

          {/* ── Perusahaan ── */}
          <SectionDivider icon={Building2} label="Perusahaan" accent="#6366f1" />
          <Grid cols="1fr 1fr 1fr" isMobile={isMobile}>
            <Field label="Pilih Perusahaan">
              <Sel name="company" value={formData.company} onChange={hChange} disabled={!!editingDoc} isMobile={isMobile}>
                <option value="PNM">PT Pilar Niaga Makmur (PNM)</option>
                <option value="PKS">PT Pilkada (PKS)</option>
                <option value="PKP">PT Pikasa (PKP)</option>
              </Sel>
            </Field>
            <Field label="Template Dokumen">
              <Sel name="template_name" value={formData.template_name} onChange={hChange} isMobile={isMobile}>
                {templates.length === 0
                  ? <option value="">— Belum ada template —</option>
                  : templates.map(t => <option key={t} value={t}>{t}</option>)
                }
              </Sel>
            </Field>
            <Field label="Internal / External">
              <Sel name="internal_external" value={formData.internal_external} onChange={hChange} isMobile={isMobile}>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </Sel>
            </Field>
          </Grid>

          {/* ── Judul ── */}
          <SectionDivider icon={FileText} label="Judul Dokumen" accent="#3b82f6" />
          <Field label="Judul Dokumen" required>
            <Inp type="text" name="judul_dokumen" value={formData.judul_dokumen} onChange={hChange} placeholder="Contoh: Perjanjian Kerja Sama Pemasaran..." required isMobile={isMobile} />
          </Field>

          {/* ── Pengguna & Tanggal ── */}
          <SectionDivider icon={User} label="Pengguna & Tanggal" accent="#10b981" />
          <Grid cols="1fr 1fr 1fr 1fr" isMobile={isMobile}>
            <Field label="User">
              <Inp value={user?.name || ''} readOnly isMobile={isMobile} />
            </Field>
            <Field label="Divisi" required>
              <Sel name="division" value={formData.division} onChange={hChange} required isMobile={isMobile}>
                <option value="">— Pilih —</option>
                {masterData.divisions.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
              </Sel>
            </Field>
            <Field label="Tanggal Dokumen" required>
              <DatePicker name="doc_date" value={formData.doc_date} onChange={hChange} required isMobile={isMobile} />
            </Field>
            <Field label="Klasifikasi">
              <Inp type="text" name="klasifikasi" value={formData.klasifikasi} onChange={hChange} placeholder="Surat Edaran..." isMobile={isMobile} />
            </Field>
          </Grid>

          {/* ── Detail ── */}
          <SectionDivider icon={AlignLeft} label="Detail Dokumen" accent="#f59e0b" />
          <Grid cols="1fr 1fr" isMobile={isMobile}>
            <Field label="Perihal">
              <Inp type="text" name="perihal" value={formData.perihal} onChange={hChange} placeholder="Perihal dokumen..." isMobile={isMobile} />
            </Field>
            <Field label="Ditandatangani Oleh">
              <Inp type="text" name="signed_by" value={formData.signed_by} onChange={hChange} placeholder="Nama penandatangan" isMobile={isMobile} />
            </Field>
            <Field label="Link Dokumen">
              <Inp type="text" name="link_document" value={formData.link_document} onChange={hChange} placeholder="https://..." isMobile={isMobile} />
            </Field>
            <Field label="Keterangan">
              <Textarea name="keterangan" value={formData.keterangan} onChange={hChange} placeholder="Catatan opsional..." rows={2} isMobile={isMobile} />
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
