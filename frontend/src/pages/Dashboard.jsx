import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Download, RefreshCw, Edit, Save, X, Copy, ChevronLeft, ChevronRight, Upload, Trash2, FileText, Eye, ExternalLink } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function Dashboard({ activePage, onNavigate }) {
  const [masterData, setMasterData] = useState({ users: [], divisions: [] });
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [formData, setFormData] = useState({
    company: 'PNM',
    template_name: '',
    judul_dokumen: '',
    user_name: '',
    division: '',
    internal_external: 'Internal',
    doc_date: new Date().toISOString().split('T')[0],
    klasifikasi: '',
    perihal: '',
    signed_by: '',
    keterangan: '',
    link_document: ''
  });

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);

  // Template management
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef(null);

  // History pagination & filter
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const renderRealPreview = async () => {
    // Fungsi ini tidak lagi digunakan secara internal di Dashboard
  };

  const handleOpenPrintView = (docObj) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup diblokir! Harap izinkan popup untuk melihat preview.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Preview - ${docObj.doc_number}</title>
          <script src="https://unpkg.com/jszip/dist/jszip.min.js"></script>
          <script src="https://unpkg.com/docx-preview/dist/docx-preview.js"></script>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body { 
              background: #e2e8f0; 
              margin: 0; 
              padding: 0; 
              font-family: 'Inter', sans-serif; 
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            #preview-container { 
              background: white; 
              width: 210mm; 
              min-height: 297mm;
              margin: 60px auto 20px auto; 
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
              box-sizing: border-box;
            }
            /* Override docx-preview internal padding if needed */
            .docx-wrapper {
                background: transparent !important;
                padding: 0 !important;
                display: block !important;
            }
            .docx {
                box-shadow: none !important;
                margin-bottom: 0 !important;
            }
            .toolbar {
              background: #0f172a;
              color: white;
              padding: 0 24px;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 50px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 1000;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .btn-print {
              background: #2563eb;
              color: white;
              border: none;
              padding: 6px 16px;
              border-radius: 4px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            }
            .btn-print:hover { background: #1d4ed8; }
            @media print {
              body { background: white !important; }
              #preview-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 210mm !important;
              }
              .toolbar { display: none !important; }
            }
            .loader {
              border: 3px solid #f3f3f3;
              border-top: 3px solid #2563eb;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <div style="font-size: 14px;">Web Preview: <b>${docObj.doc_number}</b></div>
            <div id="status-area">
               <div style="display:flex; align-items:center; gap:8px; font-size: 13px;">
                 <div class="loader"></div> Menyiapkan Dokumen...
               </div>
            </div>
            <button class="btn-print" onclick="window.print()">Cetak Dokumen (A4)</button>
          </div>
          <div id="preview-container"></div>
          <script>
            async function loadDoc() {
              try {
                const response = await fetch('${API_URL}/download', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ doc_number: '${docObj.doc_number}' })
                });
                
                const blob = await response.blob();
                const container = document.getElementById('preview-container');
                
                // Render menggunakan docx-preview dengan setting presisi
                await docx.renderAsync(blob, container, null, {
                    className: "docx",
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    experimental: true
                });

                document.getElementById('status-area').innerHTML = '<span style="color: #4ade80; font-size: 13px;">✓ Dokumen Siap</span>';
              } catch (e) {
                document.getElementById('status-area').innerHTML = '<span style="color: #f87171; font-size: 13px;">✕ Gagal Memuat</span>';
                console.error(e);
              }
            }
            loadDoc();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    if (templates.length > 0 && !editingDoc && !generatedDoc) {
      const match = templates.find(t => t.toLowerCase().includes(formData.company.toLowerCase()));
      setFormData(prev => ({ ...prev, template_name: match || templates[0] }));
    }
  }, [formData.company, templates, editingDoc, generatedDoc]);

  const fetchData = async () => {
    setTableLoading(true);
    try {
      const [dataRes, docRes, tplRes] = await Promise.all([
        axios.get(`${API_URL}/data`),
        axios.get(`${API_URL}/documents`),
        axios.get(`${API_URL}/templates`),
      ]);
      setMasterData(dataRes.data);
      setDocuments(docRes.data);
      setTemplates(tplRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const userName = e.target.value;
    const userObj = masterData.users.find(u => u.name === userName);
    const userDiv = userObj ? userObj.division : '';
    const divObj = masterData.divisions.find(d => d.name === userDiv);
    const defKlasifikasi = (divObj && divObj.klasifikasi && divObj.klasifikasi !== '-') ? divObj.klasifikasi : '';
    setFormData({ ...formData, user_name: userName, division: userDiv, klasifikasi: defKlasifikasi });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_name || !formData.doc_date) {
      alert('Harap isi User dan Tanggal Dokumen!');
      return;
    }
    setLoading(true);
    try {
      if (editingDoc) {
        const res = await axios.put(`${API_URL}/documents/${editingDoc.id}`, formData);
        alert('Dokumen berhasil diperbarui!');
        setGeneratedDoc(res.data);
      } else {
        const res = await axios.post(`${API_URL}/generate`, formData);
        setGeneratedDoc(res.data);
        setEditingDoc(res.data);
      }
      fetchData();
    } catch (error) {
      console.error('Error saving doc:', error);
      alert('Gagal memproses dokumen.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docObj) => {
    try {
      const res = await axios.post(
        `${API_URL}/download`,
        { doc_number: docObj.doc_number },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const docJudul = docObj.judul_dokumen ? docObj.judul_dokumen.replace(/[^a-zA-Z0-9 -]/g, '') : 'Dokumen';
      const fileName = `${docJudul}_${docObj.doc_number.replace(/\//g, '_')}.docx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading template:', error);
      let errorMsg = 'Gagal men-download.';
      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || errorMsg;
        } catch (e) {}
      }
      alert(errorMsg + '\n\nPastikan template sudah tersimpan di folder backend/templates dengan nama yang sesuai.');
    }
  };

  const resetForm = () => {
    setGeneratedDoc(null);
    setEditingDoc(null);
    setFormData({
      company: 'PNM',
      template_name: templates.length > 0 ? templates[0] : '',
      judul_dokumen: '',
      user_name: '',
      division: '',
      internal_external: 'Internal',
      doc_date: new Date().toISOString().split('T')[0],
      klasifikasi: '',
      perihal: '',
      signed_by: '',
      keterangan: '',
      link_document: ''
    });
  };

  const startEdit = (doc) => {
    setEditingDoc(doc);
    setGeneratedDoc(doc);
    setFormData({
      company: doc.company,
      template_name: doc.template_name || (templates.length > 0 ? templates[0] : ''),
      judul_dokumen: doc.judul_dokumen || '',
      user_name: doc.user_name,
      division: doc.division,
      internal_external: doc.internal_external || 'Internal',
      doc_date: doc.doc_date,
      klasifikasi: doc.klasifikasi || '',
      perihal: doc.perihal || '',
      signed_by: doc.signed_by || '',
      keterangan: doc.keterangan || '',
      link_document: doc.link_document || ''
    });
    onNavigate?.('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startDuplicate = (doc) => {
    setEditingDoc(null);
    setGeneratedDoc(null);
    setFormData({
      company: doc.company,
      template_name: doc.template_name || (templates.length > 0 ? templates[0] : ''),
      judul_dokumen: doc.judul_dokumen || '',
      user_name: doc.user_name,
      division: doc.division,
      internal_external: doc.internal_external || 'Internal',
      doc_date: new Date().toISOString().split('T')[0],
      klasifikasi: doc.klasifikasi || '',
      perihal: doc.perihal || '',
      signed_by: doc.signed_by || '',
      keterangan: doc.keterangan || '',
      link_document: doc.link_document || ''
    });
    onNavigate?.('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      setUploadError('Hanya file .docx yang diizinkan.');
      return;
    }
    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');
    const data = new FormData();
    data.append('template', file);
    try {
      const res = await axios.post(`${API_URL}/templates/upload`, data);
      setUploadSuccess(res.data.message || 'Template berhasil diupload!');
      fetchData();
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Gagal mengupload template.');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTemplateDelete = async (name) => {
    if (!window.confirm(`Hapus template "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/templates/${encodeURIComponent(name)}`);
      setUploadSuccess(`Template "${name}" berhasil dihapus.`);
      fetchData();
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Gagal menghapus template.');
    }
  };

  const getCompanyBadgeClass = (company) => {
    if (company === 'PNM') return 'badge-purple';
    if (company === 'PKS') return 'badge-green';
    return 'badge-blue';
  };

  // Pagination
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm ||
      [doc.company, doc.doc_number, doc.judul_dokumen, doc.user_name]
        .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = !searchDate || doc.doc_date === searchDate;
    return matchesSearch && matchesDate;
  });
  const totalPages = Math.ceil(filteredDocuments.length / pageSize) || 1;
  const currentData = filteredDocuments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── Templates View ──
  if (activePage === 'templates') {
    return (
      <div className="container">
        <div className="card glass">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Kelola Template</h2>

          {/* Upload area */}
          <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '1rem', padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
            <FileText size={40} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
            <p style={{ color: '#64748b', marginBottom: '1rem', fontWeight: 500 }}>Upload file template <strong>.docx</strong> baru</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              style={{ display: 'none' }}
              onChange={handleTemplateUpload}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={uploadLoading}
              onClick={() => { setUploadError(''); setUploadSuccess(''); fileInputRef.current?.click(); }}
            >
              {uploadLoading ? <span className="loading-spinner"></span> : <><Upload size={18} /> Pilih & Upload File</>}
            </button>
            {uploadError && <p style={{ color: '#dc2626', marginTop: '0.75rem', fontWeight: 500 }}>{uploadError}</p>}
            {uploadSuccess && <p style={{ color: '#16a34a', marginTop: '0.75rem', fontWeight: 500 }}>{uploadSuccess}</p>}
          </div>

          {/* Template list */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#374151' }}>
            Template Tersedia ({templates.length})
          </h3>
          {templates.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Belum ada template. Upload file .docx di atas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {templates.map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{t}</span>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b' }}
                    onClick={() => handleTemplateDelete(t)}
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Form View ──
  if (activePage === 'form') {
    return (
      <div className="container">
        <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <img src="/icon.png" alt="Logo" style={{ height: '60px', borderRadius: '8px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          <div>
            <h1>Auto Doc Number Generator</h1>
            <p>Otomatisasi Penomoran Dokumen (PNM, PKS, PKP)</p>
          </div>
        </div>

        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {editingDoc ? `Edit Dokumen: ${editingDoc.doc_number}` : 'Generate Dokumen Baru'}
            </h2>
            {editingDoc && (
              <button type="button" className="btn" style={{ background: '#fecaca', color: '#991b1b', padding: '0.5rem 1rem' }} onClick={resetForm}>
                <X size={16} /> Batal Edit / Buat Baru
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Pilih PT (Perusahaan) {editingDoc && '(Tidak bisa diubah)'}</label>
                <select className="form-control" name="company" value={formData.company} onChange={handleChange} disabled={!!editingDoc}>
                  <option value="PNM">PT Pilar Niaga Makmur (PNM)</option>
                  <option value="PKS">PT Pilkada (PKS)</option>
                  <option value="PKP">PT Pikasa (PKP)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Pilih Template Docx</label>
                <select className="form-control" name="template_name" value={formData.template_name} onChange={handleChange}>
                  {templates.length === 0 ? (
                    <option value="">-- Belum Ada Template di backend/templates --</option>
                  ) : (
                    templates.map(t => <option key={t} value={t}>{t}</option>)
                  )}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Judul Dokumen</label>
                <input type="text" className="form-control" name="judul_dokumen" value={formData.judul_dokumen} onChange={handleChange} placeholder="Contoh: Perjanjian Kerja Sama..." />
              </div>

              <div className="form-group">
                <label>User *</label>
                <select className="form-control" name="user_name" value={formData.user_name} onChange={handleUserChange} required>
                  <option value="">-- Pilih User --</option>
                  {masterData.users.map((u, i) => (
                    <option key={i} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Divisi (Otomatis)</label>
                <input type="text" className="form-control" value={formData.division} readOnly style={{ backgroundColor: '#e5e7eb', cursor: 'not-allowed' }} />
              </div>

              <div className="form-group">
                <label>Tanggal Doc *</label>
                <input type="date" className="form-control" name="doc_date" value={formData.doc_date} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Internal / External</label>
                <select className="form-control" name="internal_external" value={formData.internal_external} onChange={handleChange}>
                  <option value="Internal">Internal</option>
                  <option value="External">External</option>
                </select>
              </div>

              <div className="form-group">
                <label>Klasifikasi Doc</label>
                <input type="text" className="form-control" name="klasifikasi" value={formData.klasifikasi} onChange={handleChange} placeholder="Contoh: Parklaring, Surat Edaran..." />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Perihal</label>
                <input type="text" className="form-control" name="perihal" value={formData.perihal} onChange={handleChange} placeholder="Deskripsi perihal dokumen..." />
              </div>

              <div className="form-group">
                <label>Di Tanda Tangani Oleh</label>
                <input type="text" className="form-control" name="signed_by" value={formData.signed_by} onChange={handleChange} placeholder="Nama penandatangan" />
              </div>

              <div className="form-group">
                <label>Link Document</label>
                <input type="text" className="form-control" name="link_document" value={formData.link_document} onChange={handleChange} placeholder="https://..." />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Keterangan</label>
                <textarea className="form-control" name="keterangan" value={formData.keterangan} onChange={handleChange} placeholder="Tambahkan catatan opsional..."></textarea>
              </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              {generatedDoc && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Nomor Dokumen Aktif:</p>
                  <div className="doc-number-display" style={{ margin: '0.5rem 0' }}>{generatedDoc.doc_number}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <span className="loading-spinner"></span> :
                    editingDoc ? <><Save size={20} /> Simpan Perubahan</> : <><RefreshCw size={20} /> Generate Nomor Baru</>
                  }
                </button>
                {generatedDoc && (
                  <>
                    <button type="button" className="btn btn-success" onClick={() => handleDownload(generatedDoc)}>
                      <Download size={20} /> Download Dokumen (.docx)
                    </button>
                    <button type="button" className="btn" style={{ background: '#e0e7ff', color: '#3730a3' }} onClick={() => startDuplicate(generatedDoc)}>
                      <Copy size={20} /> Duplikat
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── History View ──
  return (
    <div className="container">
      <div className="card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Riwayat Dokumen</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#4b5563' }}>Tampilkan:</label>
              <select className="form-control" style={{ padding: '0.4rem', width: 'auto' }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button type="button" className="btn" style={{ padding: '0.5rem 1rem', background: '#dbeafe', color: '#1e3a8a' }} onClick={fetchData} disabled={tableLoading}>
              <RefreshCw size={16} className={tableLoading ? 'loading-spinner' : ''} /> {tableLoading ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Cari (PT, No Doc, Judul, User)..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div>
            <input
              type="date"
              className="form-control"
              value={searchDate}
              onChange={(e) => { setSearchDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          {(searchTerm || searchDate) && (
            <button type="button" className="btn" style={{ padding: '0.65rem 1rem', background: '#fee2e2', color: '#991b1b' }} onClick={() => { setSearchTerm(''); setSearchDate(''); setCurrentPage(1); }}>
              Reset Filter
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Aksi</th>
                <th>No</th>
                <th>Nomor Dokumen</th>
                <th>Tanggal</th>
                <th>Perusahaan</th>
                <th>Judul Dokumen</th>
                <th>Pembuat</th>
                <th>Divisi</th>
                <th>Int/Ext</th>
                <th>Klasifikasi</th>
                <th>Perihal</th>
                <th>Penandatangan</th>
                <th>Keterangan</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((doc, idx) => (
                <tr key={doc.id} style={{ background: editingDoc && editingDoc.id === doc.id ? '#fef3c7' : 'transparent' }}>
                  <td style={{ display: 'flex', gap: '0.4rem', borderBottom: 'none' }}>
                    <button type="button" className="btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3' }} onClick={() => startDuplicate(doc)} title="Duplikat">
                      <Copy size={12} />
                    </button>
                    <button type="button" className="btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', background: '#f3f4f6', color: '#374151' }} onClick={() => startEdit(doc)} title="Edit">
                      <Edit size={12} />
                    </button>
                    <button type="button" className="btn btn-success" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDownload(doc)} title="Download Docx">
                      <Download size={12} />
                    </button>
                  </td>
                  <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{doc.doc_number}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{doc.doc_date}</td>
                  <td><span className={`badge ${getCompanyBadgeClass(doc.company)}`}>{doc.company}</span></td>
                  <td style={{ minWidth: '180px' }}>{doc.judul_dokumen || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{doc.user_name}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{doc.division}</td>
                  <td>{doc.internal_external}</td>
                  <td>{doc.klasifikasi || '-'}</td>
                  <td style={{ minWidth: '150px' }}>{doc.perihal || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{doc.signed_by || '-'}</td>
                  <td style={{ minWidth: '200px', fontSize: '0.85rem' }}>{doc.keterangan || '-'}</td>
                  <td>
                    {doc.link_document ? (
                      <a href={doc.link_document} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                        <ExternalLink size={14} />
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada riwayat dokumen.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn" style={{ padding: '0.5rem', background: '#f3f4f6' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 600 }}>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button type="button" className="btn" style={{ padding: '0.5rem', background: '#f3f4f6' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
