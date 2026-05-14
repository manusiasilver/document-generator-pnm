import React, { useState, useEffect } from 'react';
import { FileText, Trash2, StickyNote, X, CheckCircle2, AlertCircle, CloudUpload } from 'lucide-react';
import { token, Btn, card } from './SharedUI';

const MOBILE_BREAKPOINT = 768;

function NoteModal({ onClose, isMobile }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 9000,
        }}
      />
      <div style={{
        position: 'fixed',
        ...(isMobile ? {
          bottom: 0,
          left: 0,
          right: 0,
          top: 'auto',
          transform: 'none',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '85dvh',
          borderRadius: '1.25rem 1.25rem 0 0',
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '92vw',
          maxWidth: '560px',
          maxHeight: '88vh',
          borderRadius: '1.1rem',
        }),
        zIndex: 9001,
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)',
        border: '1.5px solid #fde68a',
        boxShadow: '0 -8px 40px rgba(15,23,42,0.18)',
      }}>
        {/* Drag handle (mobile only) */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.65rem', paddingBottom: '0.25rem', flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(180,83,9,0.25)' }} />
          </div>
        )}

        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.1rem 1.25rem', borderBottom: '1px solid #fde68a',
          position: 'sticky', top: 0,
          background: 'linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)',
          zIndex: 1, borderRadius: isMobile ? 0 : '1.1rem 1.1rem 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '0.4rem', background: 'rgba(180,83,9,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StickyNote size={14} style={{ color: '#92400e' }} />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Cara Menyiapkan Template
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(180,83,9,0.1)', border: 'none', cursor: 'pointer', color: '#a16207', padding: '0.35rem', borderRadius: '0.45rem', display: 'flex', alignItems: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#78350f', marginBottom: '1rem', lineHeight: 1.6 }}>
            Buka file <b>.docx</b> di MS Word, lalu masukkan tag berikut di posisi yang diinginkan:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.4rem 1.25rem', background: 'rgba(255,255,255,0.65)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #fde68a' }}>
            {[
              ['{doc_number}', 'Nomor Dokumen'],
              ['{company}', 'Perusahaan'],
              ['{user_name}', 'Nama User'],
              ['{division}', 'Divisi'],
              ['{doc_date}', 'Tanggal'],
              ['{perihal}', 'Perihal'],
              ['{klasifikasi}', 'Klasifikasi'],
              ['{signed_by}', 'Penandatangan'],
              ['{judul_dokumen}', 'Judul Dokumen'],
              ['{keterangan}', 'Keterangan'],
            ].map(([tag, label]) => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ fontFamily: 'monospace', background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.22)', borderRadius: '0.3rem', padding: '0.07rem 0.45rem', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap', color: '#92400e' }}>{tag}</span>
                <span style={{ color: '#a16207', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '0.85rem', fontSize: '0.74rem', color: '#a16207', fontStyle: 'italic' }}>
            * Gunakan kurung kurawal ganda seperti contoh di atas.
          </p>
        </div>
      </div>
    </>
  );
}

function TemplatesView({
  templates,
  uploadLoading,
  uploadMsg,
  showNote,
  setShowNote,
  hUpload,
  hDeleteTemplate,
  fileInputRef,
  setUploadMsg
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) hUpload({ target: { files: [file] } });
  };

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      padding: isMobile ? '0.75rem' : '0.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {showNote && <NoteModal onClose={() => setShowNote(false)} isMobile={isMobile} />}

      <div style={{
        ...card,
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: '1rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
          <Btn variant={showNote ? 'primary' : 'ghost'} onClick={() => setShowNote(!showNote)}>
            <StickyNote size={14} /> Petunjuk Tag
          </Btn>
        </div>

        {/* ── Upload Zone ── */}
        <div
          onClick={() => { setUploadMsg({ type: '', text: '' }); fileInputRef.current?.click(); }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? token.blueMid : uploadMsg.type === 'ok' ? '#16a34a' : uploadMsg.type === 'err' ? '#dc2626' : token.border}`,
            borderRadius: '1rem',
            padding: isMobile ? '1.75rem 1.25rem' : '2.25rem 2rem',
            textAlign: 'center',
            cursor: uploadLoading ? 'wait' : 'pointer',
            background: dragOver ? 'rgba(45,74,140,0.04)' : uploadMsg.type === 'ok' ? 'rgba(22,163,74,0.03)' : uploadMsg.type === 'err' ? 'rgba(220,38,38,0.03)' : token.surface,
            marginBottom: '1.25rem',
            transition: 'border-color 0.2s, background 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (!uploadLoading) e.currentTarget.style.borderColor = token.blueMid; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = dragOver ? token.blueMid : uploadMsg.type === 'ok' ? '#16a34a' : uploadMsg.type === 'err' ? '#dc2626' : token.border; }}
        >
          <input ref={fileInputRef} type="file" accept=".docx" style={{ display: 'none' }} onChange={hUpload} />
          <div style={{
            width: 52, height: 52, borderRadius: '0.875rem',
            background: uploadMsg.type === 'ok' ? 'rgba(22,163,74,0.1)' : uploadMsg.type === 'err' ? 'rgba(220,38,38,0.1)' : 'rgba(26,42,87,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            transition: 'background 0.2s',
          }}>
            {uploadMsg.type === 'ok'
              ? <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
              : uploadMsg.type === 'err'
              ? <AlertCircle size={24} style={{ color: '#dc2626' }} />
              : <CloudUpload size={24} style={{ color: token.blueMid }} />
            }
          </div>
          <p style={{ fontWeight: 700, color: uploadMsg.type === 'ok' ? '#15803d' : uploadMsg.type === 'err' ? '#b91c1c' : token.blue, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            {uploadLoading ? 'Mengupload...' : uploadMsg.text ? uploadMsg.text : 'Klik atau seret file .docx ke sini'}
          </p>
          {!uploadMsg.text && (
            <p style={{ fontSize: '0.77rem', color: token.muted }}>Hanya file <b>.docx</b> yang didukung</p>
          )}
        </div>

        {/* ── Template List Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: token.muted }}>Template tersimpan</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: token.blueMid, background: 'rgba(26,42,87,0.08)', border: `1px solid rgba(26,42,87,0.12)`, padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
            {templates.length}
          </span>
        </div>

        {/* ── Template List (scrollable) ── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {templates.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', border: `1.5px dashed ${token.border}`, borderRadius: '0.75rem', background: 'rgba(26,42,87,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '0.875rem', background: 'rgba(26,42,87,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem', boxShadow: '0 0 0 8px rgba(26,42,87,0.04)' }}>
                <FileText size={24} style={{ color: token.blueMid, opacity: 0.6 }} />
              </div>
              <p style={{ color: token.text, fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>Belum ada template</p>
              <p style={{ color: token.muted, fontSize: '0.79rem' }}>Upload file .docx pertama Anda di atas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {templates.map(t => (
                <div key={t} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.7rem',
                  background: token.surface,
                  border: `1.5px solid ${token.border}`,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,42,87,0.18)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,42,87,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = token.border; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '0.45rem', background: 'rgba(26,42,87,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={15} style={{ color: token.blueMid }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: token.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</div>
                      <div style={{ fontSize: '0.71rem', color: token.muted, marginTop: '0.05rem' }}>.docx template</div>
                    </div>
                  </div>
                  <button
                    onClick={() => hDeleteTemplate(t)}
                    title={`Hapus "${t}"`}
                    style={{
                      background: 'none', border: '1.5px solid rgba(220,38,38,0.2)',
                      borderRadius: '0.45rem', padding: '0.35rem', cursor: 'pointer',
                      color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TemplatesView;
