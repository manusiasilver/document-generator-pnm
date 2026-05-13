import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, StickyNote, X, CheckCircle2, AlertCircle, CloudUpload } from 'lucide-react';
import { token, Btn, card } from './SharedUI';

const MOBILE_BREAKPOINT = 768;

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
      padding: isMobile ? '0.5rem 0' : '0',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      minHeight: '100%',
    }}>
      <div style={{ ...card, padding: isMobile ? '1rem' : '1.5rem', borderRadius: isMobile ? '0.9rem' : '1rem', flex: '0 0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '1.75rem', gap: '0.75rem', flexDirection: isMobile ? 'column' : 'row' }}>
          <div />
          <Btn variant={showNote ? 'primary' : 'ghost'} onClick={() => setShowNote(!showNote)} style={{ flexShrink: 0 }}>
            <StickyNote size={14} /> {showNote ? 'Tutup Petunjuk' : 'Petunjuk Tag'}
          </Btn>
        </div>

        {/* ── Note Panel ── */}
        {showNote && (
          <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fefce8 100%)', border: '1.5px solid #fde68a', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <StickyNote size={14} /> Cara Menyiapkan Template
              </h3>
              <button onClick={() => setShowNote(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a16207', display: 'flex', alignItems: 'center', padding: '0.1rem' }}>
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: '0.85rem', lineHeight: 1.55 }}>
              Buka file <b>.docx</b> di MS Word, lalu masukkan tag berikut di posisi yang diinginkan:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.35rem 1.5rem', background: 'rgba(255,255,255,0.6)', padding: '0.875rem 1rem', borderRadius: '0.6rem', border: '1px solid #fde68a' }}>
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
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#78350f' }}>
                  <span style={{ fontFamily: 'monospace', background: 'rgba(180,83,9,0.1)', border: '1px solid rgba(180,83,9,0.2)', borderRadius: '0.3rem', padding: '0.05rem 0.4rem', fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap', color: '#92400e' }}>{tag}</span>
                  <span style={{ color: '#a16207' }}>{label}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.73rem', color: '#a16207', fontStyle: 'italic' }}>
              * Gunakan kurung kurawal ganda seperti contoh di atas.
            </p>
          </div>
        )}

        {/* ── Upload Zone ── */}
        <div
          onClick={() => { setUploadMsg({ type: '', text: '' }); fileInputRef.current?.click(); }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? token.blueMid : uploadMsg.type === 'ok' ? '#16a34a' : uploadMsg.type === 'err' ? '#dc2626' : token.border}`,
            borderRadius: '1rem',
            padding: isMobile ? '2rem 1.25rem' : '2.75rem 2rem',
            textAlign: 'center',
            cursor: uploadLoading ? 'wait' : 'pointer',
            background: dragOver ? 'rgba(45,74,140,0.04)' : uploadMsg.type === 'ok' ? 'rgba(22,163,74,0.03)' : uploadMsg.type === 'err' ? 'rgba(220,38,38,0.03)' : token.surface,
            marginBottom: '1.75rem',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => { if (!uploadLoading) e.currentTarget.style.borderColor = token.blueMid; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = dragOver ? token.blueMid : uploadMsg.type === 'ok' ? '#16a34a' : uploadMsg.type === 'err' ? '#dc2626' : token.border; }}
        >
          <input ref={fileInputRef} type="file" accept=".docx" style={{ display: 'none' }} onChange={hUpload} />

          {/* Icon */}
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
            {uploadLoading
              ? 'Mengupload...'
              : uploadMsg.text
              ? uploadMsg.text
              : 'Klik atau seret file .docx ke sini'
            }
          </p>
          {!uploadMsg.text && (
            <p style={{ fontSize: '0.77rem', color: token.muted }}>Hanya file <b>.docx</b> yang didukung</p>
          )}
        </div>

        {/* ── Template List ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: token.muted }}>Template tersimpan</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: token.blueMid, background: 'rgba(26,42,87,0.08)', border: `1px solid rgba(26,42,87,0.12)`, padding: '0.15rem 0.55rem', borderRadius: '999px' }}>
            {templates.length}
          </span>
        </div>

        {templates.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', border: `1.5px dashed ${token.border}`, borderRadius: '0.75rem', background: 'rgba(26,42,87,0.02)' }}>
            <FileText size={24} style={{ color: token.muted, opacity: 0.4, display: 'block', margin: '0 auto 0.5rem' }} />
            <p style={{ color: token.muted, fontSize: '0.84rem', fontWeight: 500 }}>Belum ada template</p>
            <p style={{ color: token.muted, fontSize: '0.76rem', marginTop: '0.2rem' }}>Upload file .docx pertama Anda di atas</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {templates.map((t, i) => (
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
                    background: 'none',
                    border: '1.5px solid rgba(220,38,38,0.2)',
                    borderRadius: '0.45rem',
                    padding: '0.35rem',
                    cursor: 'pointer',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.15s, border-color 0.15s',
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
  );
}

export default TemplatesView;
