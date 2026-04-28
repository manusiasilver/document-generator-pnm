import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Loader2, RefreshCw, Edit, Save, X, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

function Dashboard() {
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
  
  // Edit mode state
  const [editingDoc, setEditingDoc] = useState(null);

  // Pagination and Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Fetch Master Data
  useEffect(() => {
    fetchData();
  }, []);

  // Set default template when templates or company changes
  useEffect(() => {
    if (templates.length > 0 && !editingDoc && !generatedDoc) {
       const match = templates.find(t => t.toLowerCase().includes(formData.company.toLowerCase()));
       if (match) {
         setFormData(prev => ({ ...prev, template_name: match }));
       } else {
         setFormData(prev => ({ ...prev, template_name: templates[0] }));
       }
    }
  }, [formData.company, templates, editingDoc, generatedDoc]);

  const fetchData = async () => {
    setTableLoading(true);
    try {
      const dataRes = await axios.get(`${API_URL}/data`);
      setMasterData(dataRes.data);
      
      const docRes = await axios.get(`${API_URL}/documents`);
      setDocuments(docRes.data);

      const tplRes = await axios.get(`${API_URL}/templates`);
      setTemplates(tplRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
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

    setFormData({
      ...formData,
      user_name: userName,
      division: userDiv,
      klasifikasi: defKlasifikasi
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_name || !formData.doc_date) {
      alert("Harap isi User dan Tanggal Dokumen!");
      return;
    }

    setLoading(true);
    try {
      if (editingDoc) {
        // Update existing document
        const res = await axios.put(`${API_URL}/documents/${editingDoc.id}`, formData);
        alert("Dokumen berhasil diperbarui!");
        // We do NOT clear editingDoc so they can keep seeing the result card and editing
        // But we update generatedDoc so the UI shows the latest doc number
        setGeneratedDoc(res.data);
      } else {
        // Generate new document
        const res = await axios.post(`${API_URL}/generate`, formData);
        setGeneratedDoc(res.data);
        // Automatically enter edit mode for this new doc so they can update it
        setEditingDoc(res.data);
      }
      fetchData(); // Refresh table
    } catch (error) {
      console.error("Error saving doc:", error);
      alert("Gagal memproses dokumen.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAny = async (docObj) => {
    try {
      const res = await axios.post(`${API_URL}/download`, 
        { doc_number: docObj.doc_number },
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let docJudul = docObj.judul_dokumen ? docObj.judul_dokumen.replace(/[^a-zA-Z0-9 -]/g, '') : "Dokumen";
      let fileName = `${docJudul}_${docObj.doc_number.replace(/\\//g, '_')}.docx`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (error) {
      console.error("Error downloading template:", error);
      alert("Gagal men-download. Pastikan template sudah tersimpan di folder backend/templates.");
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
    setGeneratedDoc(doc); // Show the result card for this doc too
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCompanyBadgeClass = (company) => {
    if (company === 'PNM') return 'badge-purple';
    if (company === 'PKS') return 'badge-green';
    return 'badge-blue';
  };

  // Pagination and Filter Calculations
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      [doc.company, doc.doc_number, doc.judul_dokumen, doc.user_name]
        .some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = !searchDate || doc.doc_date === searchDate;

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredDocuments.length / pageSize) || 1;
  const currentData = filteredDocuments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

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
              <label>Pilih PT (Perusahaan) {editingDoc && "(Tidak bisa diubah)"}</label>
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
              <input type="text" className="form-control" value={formData.division} readOnly style={{backgroundColor: '#e5e7eb', cursor: 'not-allowed'}} />
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
                   <button type="button" className="btn btn-success" onClick={() => handleDownloadAny(generatedDoc)}>
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

      <div className="card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Riwayat Dokumen Terbaru</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#4b5563' }}>Tampilkan:</label>
              <select className="form-control" style={{ padding: '0.4rem', width: 'auto' }} value={pageSize} onChange={handlePageSizeChange}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <button type="button" className="btn" style={{ padding: '0.5rem 1rem', background: '#dbeafe', color: '#1e3a8a' }} onClick={fetchData} disabled={tableLoading}>
              <RefreshCw size={16} className={tableLoading ? "loading-spinner" : ""} /> {tableLoading ? "Memuat..." : "Refresh Tabel"}
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
          { (searchTerm || searchDate) && (
            <button type="button" className="btn" style={{ padding: '0.65rem 1rem', background: '#fee2e2', color: '#991b1b' }} onClick={() => { setSearchTerm(''); setSearchDate(''); setCurrentPage(1); }}>
               Reset Filter
            </button>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Company</th>
                <th>Nomor Dokumen</th>
                <th>Judul Dokumen</th>
                <th>User</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((doc, idx) => (
                <tr key={doc.id} style={{ background: editingDoc && editingDoc.id === doc.id ? '#fef3c7' : 'transparent' }}>
                  <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td><span className={`badge ${getCompanyBadgeClass(doc.company)}`}>{doc.company}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{doc.doc_number}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.judul_dokumen || '-'}
                  </td>
                  <td>{doc.user_name}</td>
                  <td>{doc.doc_date}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: '#e0e7ff', color: '#3730a3' }} onClick={() => startDuplicate(doc)} title="Gunakan data ini untuk bikin dokumen baru">
                      <Copy size={14} /> Duplikat
                    </button>
                    <button type="button" className="btn" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', background: '#f3f4f6', color: '#374151' }} onClick={() => startEdit(doc)}>
                      <Edit size={14} /> Edit
                    </button>
                    <button type="button" className="btn btn-success" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleDownloadAny(doc)}>
                      <Download size={14} /> Docx
                    </button>
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn" 
              style={{ padding: '0.5rem', background: '#f3f4f6', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 600 }}>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button 
              type="button" 
              className="btn" 
              style={{ padding: '0.5rem', background: '#f3f4f6', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
