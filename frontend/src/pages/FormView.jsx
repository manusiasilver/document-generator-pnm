import React, { useEffect, useState } from 'react';
import { Copy, Download, RefreshCw, Save, Plus, CalendarDays } from 'lucide-react';
import { token, Btn, wrap, card, Divider, Field, Sel, Inp } from './SharedUI';

const MOBILE_BREAKPOINT = 768;
const ANIMATION_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function ResponsiveGrid({ isMobile, columns, children }) {
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

function DateInputField({ name, value, onChange, required = false }) {
  const openPicker = event => {
    if (typeof event.currentTarget.showPicker === 'function') {
      event.currentTarget.showPicker();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          width: '100%',
          minHeight: '2.6rem',
          borderRadius: '0.7rem',
          border: `1px solid ${token.border}`,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,249,252,0.92) 100%)',
          padding: '0.6rem 0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          color: value ? token.text : token.muted,
          fontSize: '0.88rem',
          boxShadow: '0 1px 0 rgba(255,255,255,0.72) inset',
          transition: `transform 180ms ${ANIMATION_EASE}, box-shadow 180ms ${ANIMATION_EASE}, border-color 180ms ${ANIMATION_EASE}`,
        }}
      >
        <span>{value || 'Pilih tanggal'}</span>
        <CalendarDays size={16} style={{ color: token.muted, flex: '0 0 auto' }} />
      </div>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={openPicker}
        onClick={openPicker}
        required={required}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          border: 'none',
          padding: 0,
        }}
      />
    </div>
  );
}

function FormView({
  editingDoc,
  generatedDoc,
  formData,
  templates,
  masterData,
  loading,
  hChange,
  hUser,
  hSubmit,
  hDownload,
  resetForm,
  startDuplicate
}) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT);
  const [hoveredAction, setHoveredAction] = useState(false);
  const inpRO = { background: '#f1f5f9', color: token.muted, cursor: 'not-allowed' };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const textareaStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    fontSize: '0.88rem',
    color: token.text,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,249,252,0.92) 100%)',
    border: `1px solid ${token.border}`,
    borderRadius: '0.7rem',
    outline: 'none',
    transition: `border-color 180ms ${ANIMATION_EASE}, box-shadow 180ms ${ANIMATION_EASE}, transform 180ms ${ANIMATION_EASE}`,
    fontFamily: 'inherit',
    resize: 'vertical',
    boxShadow: '0 1px 0 rgba(255,255,255,0.65) inset',
  };

  const sectionStyle = delay => ({
    position: 'relative',
    zIndex: 1,
    animation: `formFadeUp 720ms ${ANIMATION_EASE} both`,
    animationDelay: `${delay}ms`,
  });

  const floatingOrbStyle = (style, duration, delay) => ({
    position: 'absolute',
    borderRadius: '999px',
    pointerEvents: 'none',
    animationName: 'formFloat, formPulse',
    animationDuration: `${duration}ms, ${duration + 1800}ms`,
    animationTimingFunction: 'ease-in-out, ease-in-out',
    animationIterationCount: 'infinite, infinite',
    animationDelay: `${delay}ms, ${delay}ms`,
    ...style,
  });

  return (
    <div style={{
      ...(isMobile ? wrap : {}),
      position: isMobile ? 'static' : 'fixed',
      top: isMobile ? 'auto' : '170px',
      left: isMobile ? 'auto' : 'calc(var(--sidebar-current-width, 280px) + 0px)',
      right: 0,
      bottom: isMobile ? 'auto' : 0,
      padding: isMobile ? '1rem 0.75rem' : '0.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflowY: 'auto',
      background: 'transparent',
    }}>
      <style>{`
        @keyframes formFadeUp {
          from { opacity: 0; transform: translate3d(0, 28px, 0) scale(0.985); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes formSheen {
          0% { transform: translateX(-135%) skewX(-24deg); opacity: 0; }
          10% { opacity: 0.18; }
          34% { transform: translateX(165%) skewX(-24deg); opacity: 0; }
          100% { transform: translateX(165%) skewX(-24deg); opacity: 0; }
        }
        @keyframes formPulse {
          0%, 100% { opacity: 0.42; transform: scale(1); }
          50% { opacity: 0.82; transform: scale(1.08); }
        }
        @keyframes formFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -14px, 0); }
        }
      `}</style>

      <div style={{
        ...card,
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: isMobile ? '0.9rem' : '1rem',
        flex: '0 0 auto',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.98) 28%, rgba(241,245,252,0.92) 100%)',
        boxShadow: '0 28px 60px rgba(17, 38, 75, 0.10), 0 10px 24px rgba(26, 42, 87, 0.06)',
        backdropFilter: 'blur(14px)',
        animation: `formFadeUp 780ms ${ANIMATION_EASE} both`,
      }}>
        <div style={floatingOrbStyle({
          top: '-44px',
          right: isMobile ? '-24px' : '24px',
          width: isMobile ? '110px' : '160px',
          height: isMobile ? '110px' : '160px',
          background: 'radial-gradient(circle, rgba(45,74,140,0.14) 0%, rgba(45,74,140,0) 72%)',
        }, 9000, 0)} />
        <div style={floatingOrbStyle({
          bottom: '12%',
          left: '-30px',
          width: isMobile ? '86px' : '118px',
          height: isMobile ? '86px' : '118px',
          background: 'radial-gradient(circle, rgba(244,169,64,0.18) 0%, rgba(244,169,64,0) 74%)',
        }, 10800, 700)} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.46) 50%, transparent 100%)',
          transform: 'translateX(-135%) skewX(-24deg)',
          animation: 'formSheen 7.5s linear infinite',
          pointerEvents: 'none',
        }} />

        <div style={{ ...sectionStyle(80), display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '1.75rem', gap: '0.9rem', flexDirection: isMobile ? 'column' : 'row' }}>
          <div>
            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: token.blue,
              marginBottom: '0.2rem',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              textShadow: '0 10px 25px rgba(26,42,87,0.10)',
            }}>
              {editingDoc ? 'Edit Dokumen' : 'Generate Dokumen Baru'}
            </h1>
            <p style={{ fontSize: '0.83rem', color: token.muted, maxWidth: '42rem' }}>
              {editingDoc ? `Nomor aktif: ${editingDoc.doc_number}` : 'Isi form di bawah untuk membuat nomor dokumen'}
            </p>
          </div>
        </div>

        <form onSubmit={hSubmit}>
          <div style={sectionStyle(140)}>
            <Divider label="Perusahaan" />
          </div>
          <div style={sectionStyle(190)}>
            <ResponsiveGrid isMobile={isMobile} columns="1fr 1fr 1fr">
              <Field label="Pilih Perusahaan">
                <Sel name="company" value={formData.company} onChange={hChange} disabled={!!editingDoc} style={editingDoc ? inpRO : { boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }}>
                  <option value="PNM">PT Pilar Niaga Makmur (PNM)</option>
                  <option value="PKS">PT Pilkada (PKS)</option>
                  <option value="PKP">PT Pikasa (PKP)</option>
                </Sel>
              </Field>
              <Field label="Template Dokumen">
                <Sel name="template_name" value={formData.template_name} onChange={hChange} style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }}>
                  {templates.length === 0 ? <option value="">-- Belum ada template --</option> : templates.map(t => <option key={t} value={t}>{t}</option>)}
                </Sel>
              </Field>
              <Field label="Internal / External">
                <Sel name="internal_external" value={formData.internal_external} onChange={hChange} style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }}>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </Sel>
              </Field>
            </ResponsiveGrid>
          </div>

          <div style={{ ...sectionStyle(240), marginTop: '1rem' }}>
            <Field label="Judul Dokumen *">
              <Inp type="text" name="judul_dokumen" value={formData.judul_dokumen} onChange={hChange} placeholder="Contoh: Perjanjian Kerja Sama..." required style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }} />
            </Field>
          </div>

          <div style={sectionStyle(290)}>
            <Divider label="Pengguna & Tanggal" />
          </div>
          <div style={sectionStyle(340)}>
            <ResponsiveGrid isMobile={isMobile} columns="1fr 1fr 1fr 1fr">
              <Field label="User *">
                <Sel name="user_name" value={formData.user_name} onChange={hUser} required style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }}>
                  <option value="">-- Pilih --</option>
                  {masterData.users.map((u, i) => <option key={i} value={u.name}>{u.name}</option>)}
                </Sel>
              </Field>
              <Field label="Divisi">
                <Inp value={formData.division} readOnly placeholder="Otomatis" />
              </Field>
              <Field label="Tanggal Dokumen *">
                <DateInputField
                  name="doc_date"
                  value={formData.doc_date}
                  onChange={hChange}
                  required
                />
              </Field>
              <Field label="Klasifikasi">
                <Inp type="text" name="klasifikasi" value={formData.klasifikasi} onChange={hChange} placeholder="Surat Edaran..." style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }} />
              </Field>
            </ResponsiveGrid>
          </div>

          <div style={sectionStyle(390)}>
            <Divider label="Detail Dokumen" />
          </div>
          <div style={sectionStyle(440)}>
            <ResponsiveGrid isMobile={isMobile} columns="1fr 1fr">
              <Field label="Perihal">
                <Inp type="text" name="perihal" value={formData.perihal} onChange={hChange} placeholder="Deskripsi perihal..." style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }} />
              </Field>
              <Field label="Di Tanda Tangani Oleh">
                <Inp type="text" name="signed_by" value={formData.signed_by} onChange={hChange} placeholder="Nama penandatangan" style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }} />
              </Field>
              <Field label="Link Dokumen">
                <Inp type="text" name="link_document" value={formData.link_document} onChange={hChange} placeholder="https://..." style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset' }} />
              </Field>
              <Field label="Keterangan">
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={hChange}
                  placeholder="Catatan opsional..."
                  rows={isMobile ? 3 : 2}
                  style={textareaStyle}
                  onFocus={e => {
                    e.target.style.borderColor = token.blueMid;
                    e.target.style.boxShadow = '0 0 0 4px rgba(45,74,140,0.10)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = token.border;
                    e.target.style.boxShadow = '0 1px 0 rgba(255,255,255,0.65) inset';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </Field>
            </ResponsiveGrid>
          </div>

          <div style={{ ...sectionStyle(510), marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            {generatedDoc ? (
              <div style={{
                background: 'linear-gradient(145deg, rgba(233,240,255,0.88) 0%, rgba(248,250,255,0.96) 100%)',
                border: `1px solid rgba(26,42,87,0.12)`,
                borderRadius: '1rem',
                padding: isMobile ? '1.25rem 1rem' : '1.5rem',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(26, 42, 87, 0.10)',
                position: 'relative',
                overflow: 'hidden',
                animation: `formFadeUp 720ms ${ANIMATION_EASE} both`,
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 'auto -20% -55% auto',
                  width: isMobile ? '180px' : '240px',
                  height: isMobile ? '180px' : '240px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(45,74,140,0.14) 0%, rgba(45,74,140,0) 72%)',
                  animationName: 'formFloat, formPulse',
                  animationDuration: '9000ms, 7600ms',
                  animationTimingFunction: 'ease-in-out, ease-in-out',
                  animationIterationCount: 'infinite, infinite',
                }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: token.muted, display: 'block', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                  Nomor Dokumen Berhasil Dibuat:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: isMobile ? '1.4rem' : '1.75rem', fontWeight: 800, color: token.blue, letterSpacing: '1px', wordBreak: 'break-all', textShadow: '0 10px 24px rgba(26,42,87,0.08)' }}>{generatedDoc.doc_number}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDoc.doc_number);
                      alert('Nomor disalin!');
                    }}
                    style={{
                      background: 'white',
                      border: `1px solid ${token.border}`,
                      borderRadius: '0.7rem',
                      cursor: 'pointer',
                      color: token.blue,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      boxShadow: '0 10px 22px rgba(0,0,0,0.06)',
                      transition: `transform 180ms ${ANIMATION_EASE}, box-shadow 180ms ${ANIMATION_EASE}`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 16px 28px rgba(26,42,87,0.10)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.06)';
                    }}
                    title="Salin Nomor"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', position: 'relative', zIndex: 1 }}>
                  <Btn variant="soft" type="button" onClick={() => startDuplicate(generatedDoc)} style={{ width: isMobile ? '100%' : 'auto', boxShadow: '0 14px 26px rgba(67, 56, 202, 0.10)' }}>
                    <Copy size={15} /> Duplikat
                  </Btn>
                  <Btn variant="success" type="button" onClick={() => hDownload(generatedDoc)} style={{ width: isMobile ? '100%' : 'auto', boxShadow: '0 14px 26px rgba(5, 122, 90, 0.12)' }}>
                    <Download size={15} /> Download .docx
                  </Btn>
                  <Btn variant="primary" type="submit" disabled={loading} style={{ width: isMobile ? '100%' : 'auto', boxShadow: '0 18px 32px rgba(26, 42, 87, 0.18)' }}>
                    {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={18} /> Simpan Perubahan</>}
                  </Btn>
                  <Btn variant="ghost" type="button" onClick={resetForm} style={{ width: isMobile ? '100%' : 'auto', boxShadow: '0 12px 24px rgba(26, 42, 87, 0.06)' }}>
                    <Plus size={15} /> Buat Baru
                  </Btn>
                </div>
              </div>
            ) : (
              <Btn
                variant="primary"
                type="submit"
                disabled={loading}
                onMouseEnter={() => setHoveredAction(true)}
                onMouseLeave={() => setHoveredAction(false)}
                style={{
                  padding: '0.8rem 2.5rem',
                  fontSize: '1rem',
                  width: isMobile ? '100%' : 'auto',
                  boxShadow: hoveredAction
                    ? '0 24px 44px rgba(26, 42, 87, 0.24)'
                    : '0 18px 34px rgba(26, 42, 87, 0.18)',
                  transform: hoveredAction ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
                  transition: `transform 180ms ${ANIMATION_EASE}, box-shadow 180ms ${ANIMATION_EASE}`,
                }}
              >
                {loading ? <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (editingDoc ? <><Save size={18} /> Simpan Perubahan</> : <><Plus size={20} /> Generate Nomor Baru</>)}
              </Btn>
            )}

            {!generatedDoc && editingDoc && (
              <p style={{ fontSize: '0.85rem', color: token.muted, animation: `formFadeUp 720ms ${ANIMATION_EASE} both`, animationDelay: '560ms' }}>
                Mengedit dokumen: <b>{editingDoc.doc_number}</b>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormView;
