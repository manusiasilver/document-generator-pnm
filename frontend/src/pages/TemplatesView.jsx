import React from 'react';
import { Upload, FileText, Trash2, StickyNote, Plus } from 'lucide-react';
import { token, Btn, wrap, card } from './SharedUI';

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
  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.25rem' }}>Kelola Template</h1>
            <p style={{ fontSize: '0.83rem', color: token.muted }}>Upload dan kelola template dokumen .docx</p>
          </div>
          <Btn variant={showNote ? 'primary' : 'ghost'} onClick={() => setShowNote(!showNote)}>
            <StickyNote size={15} /> {showNote ? 'Tutup Petunjuk' : 'Petunjuk Tag Template'}
          </Btn>
        </div>

        {showNote && (
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#854d0e' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> CARA MENYIAPKAN TEMPLATE
            </h3>
            <p style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
              Agar sistem bisa mengisi data secara otomatis, buka file <b>.docx</b> Anda di MS Word, lalu masukkan kode (tag) di bawah ini di posisi yang Anda inginkan:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              <div>• Nomor Dok: <b>{'{doc_number}'}</b></div>
              <div>• Perusahaan: <b>{'{company}'}</b></div>
              <div>• Nama User: <b>{'{user_name}'}</b></div>
              <div>• Divisi: <b>{'{division}'}</b></div>
              <div>• Tanggal: <b>{'{doc_date}'}</b></div>
              <div>• Perihal: <b>{'{perihal}'}</b></div>
              <div>• Klasifikasi: <b>{'{klasifikasi}'}</b></div>
              <div>• Penandatangan: <b>{'{signed_by}'}</b></div>
              <div>• Judul Dok: <b>{'{judul_dokumen}'}</b></div>
              <div>• Keterangan: <b>{'{keterangan}'}</b></div>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', fontStyle: 'italic' }}>
              * Pastikan penulisan tag menggunakan kurung kurawal double seperti di atas.
            </p>
          </div>
        )}

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
}

export default TemplatesView;
