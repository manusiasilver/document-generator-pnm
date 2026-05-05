import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import BackgroundMain from './components/BackgroundMain.jsx'

import HistoryView from './pages/HistoryView'
import FormView from './pages/FormView'
import TemplatesView from './pages/TemplatesView'

const API_URL = '/api'
const asArray = (value) => (Array.isArray(value) ? value : [])

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activePage, setActivePage] = useState('form')
  const [masterData, setMasterData] = useState({ users: [], divisions: [] })
  const [documents, setDocuments] = useState([])
  const [templates, setTemplates] = useState([])
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
    link_document: '',
  })
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [generatedDoc, setGeneratedDoc] = useState(null)
  const [editingDoc, setEditingDoc] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' })
  const [showNote, setShowNote] = useState(false)

  const fileInputRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [searchIntExt, setSearchIntExt] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (templates.length > 0 && !editingDoc && !generatedDoc) {
      const match = templates.find((t) =>
        t.toLowerCase().includes(formData.company.toLowerCase()),
      )
      setFormData((p) => ({ ...p, template_name: match || templates[0] }))
    }
  }, [formData.company, templates, editingDoc, generatedDoc])

  const fetchData = async () => {
    setTableLoading(true)
    try {
      const [d, doc, tpl] = await Promise.all([
        axios.get(`${API_URL}/data`),
        axios.get(`${API_URL}/documents`),
        axios.get(`${API_URL}/templates`),
      ])
      setMasterData({
        users: asArray(d.data?.users),
        divisions: asArray(d.data?.divisions),
      })
      setDocuments(asArray(doc.data))
      setTemplates(asArray(tpl.data))
    } catch (e) {
      console.error(e)
    } finally {
      setTableLoading(false)
    }
  }

  const hUser = (e) => {
    const u = masterData.users.find((user) => user.name === e.target.value)
    const div = masterData.divisions.find((d) => d.name === u?.division)
    setFormData((p) => ({
      ...p,
      user_name: e.target.value,
      division: u?.division || '',
      klasifikasi:
        div?.klasifikasi && div.klasifikasi !== '-' ? div.klasifikasi : p.klasifikasi,
    }))
  }

  const hChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))

  const hSubmit = async (e) => {
    e.preventDefault()
    if (!formData.judul_dokumen.trim() || !formData.user_name || !formData.doc_date) {
      alert('Harap isi Judul Dokumen, User, dan Tanggal!')
      return
    }
    setLoading(true)
    try {
      if (editingDoc) {
        const r = await axios.put(`${API_URL}/documents/${editingDoc.id}`, formData)
        alert('Dokumen diperbarui!')
        setGeneratedDoc(r.data)
      } else {
        const r = await axios.post(`${API_URL}/generate`, formData)
        setGeneratedDoc(r.data)
        setEditingDoc(r.data)
      }
      fetchData()
    } catch {
      alert('Gagal memproses dokumen.')
    } finally {
      setLoading(false)
    }
  }

  const hDownload = async (doc) => {
    try {
      const r = await axios.post(
        `${API_URL}/download`,
        { doc_number: doc.doc_number },
        { responseType: 'blob' },
      )
      const url = URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${(doc.judul_dokumen || 'Dokumen').replace(/[^a-zA-Z0-9 -]/g, '')}_${doc.doc_number.replace(/\//g, '_')}.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      let msg = 'Gagal men-download.'
      if (err.response?.data instanceof Blob) {
        try {
          msg = JSON.parse(await err.response.data.text()).error || msg
        } catch {}
      }
      alert(msg)
    }
  }

  const resetForm = () => {
    setGeneratedDoc(null)
    setEditingDoc(null)
    setFormData({
      company: 'PNM',
      template_name: templates[0] || '',
      judul_dokumen: '',
      user_name: '',
      division: '',
      internal_external: 'Internal',
      doc_date: new Date().toISOString().split('T')[0],
      klasifikasi: '',
      perihal: '',
      signed_by: '',
      keterangan: '',
      link_document: '',
    })
  }

  const startEdit = (doc) => {
    setEditingDoc(doc)
    setGeneratedDoc(doc)
    setFormData({
      company: doc.company,
      template_name: doc.template_name || templates[0] || '',
      judul_dokumen: doc.judul_dokumen || '',
      user_name: doc.user_name,
      division: doc.division,
      internal_external: doc.internal_external || 'Internal',
      doc_date: doc.doc_date,
      klasifikasi: doc.klasifikasi || '',
      perihal: doc.perihal || '',
      signed_by: doc.signed_by || '',
      keterangan: doc.keterangan || '',
      link_document: doc.link_document || '',
    })
    setActivePage('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startDuplicate = (doc) => {
    setEditingDoc(null)
    setGeneratedDoc(null)
    setFormData({
      company: doc.company,
      template_name: doc.template_name || templates[0] || '',
      judul_dokumen: doc.judul_dokumen || '',
      user_name: doc.user_name,
      division: doc.division,
      internal_external: doc.internal_external || 'Internal',
      doc_date: new Date().toISOString().split('T')[0],
      klasifikasi: doc.klasifikasi || '',
      perihal: doc.perihal || '',
      signed_by: doc.signed_by || '',
      keterangan: doc.keterangan || '',
      link_document: doc.link_document || '',
    })
    setActivePage('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.docx')) {
      setUploadMsg({ type: 'err', text: 'Hanya file .docx.' })
      return
    }
    setUploadLoading(true)
    setUploadMsg({ type: '', text: '' })
    const fd = new FormData()
    fd.append('template', file)
    try {
      const r = await axios.post(`${API_URL}/templates/upload`, fd)
      setUploadMsg({ type: 'ok', text: r.data.message || 'Berhasil diupload!' })
      fetchData()
    } catch (err) {
      setUploadMsg({ type: 'err', text: err.response?.data?.error || 'Gagal upload.' })
    } finally {
      setUploadLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const hDeleteTemplate = async (name) => {
    if (!confirm(`Hapus template "${name}"?`)) return
    try {
      await axios.delete(`${API_URL}/templates/${encodeURIComponent(name)}`)
      setUploadMsg({ type: 'ok', text: `"${name}" dihapus.` })
      fetchData()
    } catch (err) {
      setUploadMsg({ type: 'err', text: err.response?.data?.error || 'Gagal hapus.' })
    }
  }

  const filtered = asArray(documents).filter((doc) => {
    const s =
      !searchTerm ||
      [doc.company, doc.doc_number, doc.judul_dokumen, doc.user_name].some((f) =>
        f?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    const d = !searchDate || doc.doc_date === searchDate
    const ie = !searchIntExt || doc.internal_external === searchIntExt
    return s && d && ie
  })
  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const pageTitles = {
    form: 'Generate Dokumen',
    history: 'Riwayat Dokumen',
    templates: 'Kelola Template',
  }
  const pageTitle = pageTitles[activePage] ?? 'Generate Dokumen'

  return (
    <div className={`dashboard-shell${collapsed ? ' dashboard-shell--sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        activePage={activePage}
        onNavigate={setActivePage}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="dashboard-stage">
        <Header
          title="QuickNum"
          showMenuButton={true}
          onMenuToggle={() => setMobileOpen((o) => !o)}
          breadcrumb={[{ label: pageTitle, href: '#', active: true }]}
          editAction={
            activePage === 'form' && editingDoc
              ? {
                  show: true,
                  label: 'Batal Edit',
                  onClick: resetForm,
                }
              : undefined
          }
        />
        <main
          className="dashboard-main"
          style={{
            position: 'relative',
            minHeight: 0,
          }}
        >
          <BackgroundMain position="absolute" zIndex={0} />
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100%' }}>
            {activePage === 'templates' && (
              <TemplatesView
                templates={templates}
                uploadLoading={uploadLoading}
                uploadMsg={uploadMsg}
                showNote={showNote}
                setShowNote={setShowNote}
                hUpload={hUpload}
                hDeleteTemplate={hDeleteTemplate}
                fileInputRef={fileInputRef}
                setUploadMsg={setUploadMsg}
              />
            )}
            {activePage === 'form' && (
              <FormView
                editingDoc={editingDoc}
                generatedDoc={generatedDoc}
                formData={formData}
                templates={templates}
                masterData={masterData}
                loading={loading}
                hChange={hChange}
                hUser={hUser}
                hSubmit={hSubmit}
                hDownload={hDownload}
                resetForm={resetForm}
                startDuplicate={startDuplicate}
              />
            )}
            {activePage === 'history' && (
              <HistoryView
                filtered={filtered}
                pageSize={pageSize}
                setPageSize={setPageSize}
                setCurrentPage={setCurrentPage}
                fetchData={fetchData}
                tableLoading={tableLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchDate={searchDate}
                setSearchDate={setSearchDate}
                searchIntExt={searchIntExt}
                setSearchIntExt={setSearchIntExt}
                pageData={pageData}
                currentPage={currentPage}
                startDuplicate={startDuplicate}
                hDownload={hDownload}
                totalPages={totalPages}
                masterData={masterData}
                templates={templates}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
