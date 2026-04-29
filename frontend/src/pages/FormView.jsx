import React, { useEffect, useState } from 'react';
import { X, Copy, Download, RefreshCw, Save, Plus } from 'lucide-react';
import { token, Btn, wrap, card, Divider, Field, Sel, Inp } from './SharedUI';

const MOBILE_BREAKPOINT = 768;

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
    background: token.surface,
    border: `1px solid ${token.border}`,
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
    resize: 'vertical',
  };

  return (
    <div style={{ ...wrap, padding: isMobile ? '1rem 0.75rem' : '1.5rem 1rem' }}>
      <div style={{ ...card, padding: isMobile ? '1rem' : '1.5rem', borderRadius: isMobile ? '0.9rem' : '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '1.75rem', gap: '0.9rem', flexDirection: isMobile ? 'column' : 'row' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.2rem', lineHeight: 1.25 }}>
              {editingDoc ? 'Edit Dokumen' : 'Generate Dokumen Baru'}
            </h1>
            <p style={{ fontSize: '0.83rem', color: token.muted }}>
              {editingDoc ? `Nomor aktif: ${editingDoc.doc_number}` : 'Isi form di bawah untuk membuat nomor dokumen'}
            </p>
          </div>
          {editingDoc && (
            <Btn variant="danger" onClick={resetForm} style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              <X size={14} /> Batal Edit
            </Btn>
          )}
        </div>

        <form onSubmit={hSubmit}>
          <Divider label="Perusahaan" />
          <ResponsiveGrid isMobile={isMobile} columns="1fr 1fr 1fr">
            <Field label="Pilih Perusahaan">
              <Sel name="company" value={formData.company} onChange={hChange} disabled={!!editingDoc} style={editingDoc ? inpRO : {}}>
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
          </ResponsiveGrid>

          <div style={{ marginTop: '1rem' }}>
            <Field label="Judul Dokumen *">
              <Inp type="text" name="judul_dokumen" value={formData.judul_dokumen} onChange={hChange} placeholder="Contoh: Perjanjian Kerja Sama..." required />
            </Field>
          </div>

          <Divider label="Pengguna & Tanggal" />
          <ResponsiveGrid isMobile={isMobile} columns="1fr 1fr 1fr 1fr">
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
          </ResponsiveGrid>

          <Divider label="Detail Dokumen" />
          <ResponsiveGrid isMobile={isMobile} columns="1fr 1fr">
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
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={hChange}
                placeholder="Catatan opsional..."
                rows={isMobile ? 3 : 2}
                style={textareaStyle}
                onFocus={e => { e.target.style.borderColor = token.blueMid; }}
                onBlur={e => { e.target.style.borderColor = token.border; }}
              />
            </Field>
          </ResponsiveGrid>

          {/* ─── Action bar (Centered Box) ─── */}
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            
            {generatedDoc ? (
              <div style={{ 
                background: token.blueLight, 
                border: `1px solid ${token.border}`, 
                borderRadius: '1rem', 
                padding: isMobile ? '1.5rem 1rem' : '2rem', 
                width: '100%', 
                maxWidth: '600px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(26, 42, 87, 0.05)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: token.muted, display: 'block', marginBottom: '0.5rem' }}>
                  Nomor Dokumen Berhasil Dibuat:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: isMobile ? '1.4rem' : '1.75rem', fontWeight: 800, color: token.blue, letterSpacing: '1px', wordBreak: 'break-all' }}>{generatedDoc.doc_number}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDoc.doc_number);
                      alert('Nomor disalin!');
                    }}
                    style={{ background: 'white', border: `1px solid ${token.border}`, borderRadius: '0.5rem', cursor: 'pointer', color: token.blue, display: 'flex', alignItems: 'center', padding: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                    title="Salin Nomor"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
                  <Btn variant="soft" type="button" onClick={() => startDuplicate(generatedDoc)} style={{ width: isMobile ? '100%' : 'auto' }}>
                    <Copy size={15} /> Duplikat
                  </Btn>
                  <Btn variant="success" type="button" onClick={() => hDownload(generatedDoc)} style={{ width: isMobile ? '100%' : 'auto' }}>
                    <Download size={15} /> Download .docx
                  </Btn>
                  <Btn variant="primary" type="submit" disabled={loading} style={{ width: isMobile ? '100%' : 'auto' }}>
                    {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={18} /> Simpan Perubahan</>}
                  </Btn>
                  <Btn variant="ghost" type="button" onClick={resetForm} style={{ width: isMobile ? '100%' : 'auto' }}>
                    <Plus size={15} /> Buat Baru
                  </Btn>
                </div>
              </div>
            ) : (
              <Btn variant="primary" type="submit" disabled={loading} style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', width: isMobile ? '100%' : 'auto' }}>
                {loading ? <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (editingDoc ? <><Save size={18} /> Simpan Perubahan</> : <><Plus size={20} /> Generate Nomor Baru</>)}
              </Btn>
            )}

            {!generatedDoc && editingDoc && (
              <p style={{ fontSize: '0.85rem', color: token.muted }}>
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
