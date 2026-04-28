import React from 'react';
import { X, Copy, Download, RefreshCw, Save, Plus } from 'lucide-react';
import { token, Btn, wrap, card, Divider, Field, Sel, Inp } from './SharedUI';

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
  const inpRO = { background: '#f1f5f9', color: token.muted, cursor: 'not-allowed' };

  return (
    <div style={wrap}>
      <div style={card}>
        {/* Page title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.2rem' }}>
              {editingDoc ? 'Edit Dokumen' : 'Generate Dokumen Baru'}
            </h1>
            <p style={{ fontSize: '0.83rem', color: token.muted }}>
              {editingDoc ? `Nomor aktif: ${editingDoc.doc_number}` : 'Isi form di bawah untuk membuat nomor dokumen'}
            </p>
          </div>
          {editingDoc && (
            <Btn variant="danger" onClick={resetForm}>
              <X size={14} /> Batal Edit
            </Btn>
          )}
        </div>

        <form onSubmit={hSubmit}>
          {/* ─── Perusahaan ─── */}
          <Divider label="Perusahaan" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Field label="Judul Dokumen">
              <Inp type="text" name="judul_dokumen" value={formData.judul_dokumen} onChange={hChange} placeholder="Contoh: Perjanjian Kerja Sama..." />
            </Field>
          </div>

          {/* ─── Pengguna ─── */}
          <Divider label="Pengguna & Tanggal" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
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
          </div>

          {/* ─── Detail ─── */}
          <Divider label="Detail Dokumen" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              <textarea name="keterangan" value={formData.keterangan} onChange={hChange} placeholder="Catatan opsional..." rows={2}
                style={{ 
                  width: '100%', padding: '0.6rem 0.8rem',
                  fontSize: '0.88rem', color: token.text,
                  background: token.surface,
                  border: `1px solid ${token.border}`,
                  borderRadius: '0.5rem', outline: 'none',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                  resize: 'vertical' 
                }}
                onFocus={e => e.target.style.borderColor = token.blueMid}
                onBlur={e => e.target.style.borderColor = token.border}
              />
            </Field>
          </div>

          {/* ─── Action bar ─── */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${token.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            {generatedDoc ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: token.muted }}>Nomor:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: token.blue, letterSpacing: '0.5px' }}>{generatedDoc.doc_number}</span>
              </div>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {generatedDoc && (
                <>
                  <Btn variant="soft" onClick={() => startDuplicate(generatedDoc)}>
                    <Copy size={15} /> Duplikat
                  </Btn>
                  <Btn variant="success" onClick={() => hDownload(generatedDoc)}>
                    <Download size={15} /> Download .docx
                  </Btn>
                </>
              )}
              <Btn variant="primary" type="submit" disabled={loading}>
                {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (editingDoc ? <><Save size={18} /> Simpan Perubahan</> : <><Plus size={18} /> Generate Nomor</>)}
              </Btn>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormView;
