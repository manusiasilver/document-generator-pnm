import React from 'react';
import { RefreshCw, Search, X, Copy, Edit, Download, Link, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { token, Btn, wrap, card, Inp, badgeStyles } from './SharedUI';

function HistoryView({
  filtered,
  pageSize,
  setPageSize,
  setCurrentPage,
  fetchData,
  tableLoading,
  searchTerm,
  setSearchTerm,
  searchDate,
  setSearchDate,
  pageData,
  currentPage,
  editingDoc,
  startDuplicate,
  startEdit,
  hDownload,
  totalPages
}) {
  return (
    <div style={wrap}>
      <div style={card}>
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: token.blue, marginBottom: '0.2rem' }}>
              Riwayat Dokumen
            </h1>
            <p style={{ fontSize: '0.83rem', color: token.muted }}>{filtered.length} dokumen ditemukan</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              style={{ 
                padding: '0.5rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer',
                background: token.surface, border: `1px solid ${token.border}`, borderRadius: '0.5rem'
              }}
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
            </select>
            <Btn variant="ghost" onClick={fetchData} disabled={tableLoading}>
              <RefreshCw size={13} style={tableLoading ? { animation: 'spin 1s linear infinite' } : {}} />
              {tableLoading ? 'Memuat...' : 'Refresh'}
            </Btn>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: '0 0 70%', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: token.muted, pointerEvents: 'none' }} />
            <Inp type="text" placeholder="Cari PT, nomor, judul, user..." value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
          <div style={{ flex: '0 0 30%', display: 'flex', gap: '0.5rem' }}>
            <Inp type="date" value={searchDate} onChange={e => { setSearchDate(e.target.value); setCurrentPage(1); }} style={{ flex: 1 }} />
            {(searchTerm || searchDate) && (
              <Btn variant="danger" onClick={() => { setSearchTerm(''); setSearchDate(''); setCurrentPage(1); }} style={{ padding: '0.55rem' }}>
                <X size={16} />
              </Btn>
            )}
          </div>
        </div>

        {/* Table — borderless style */}
        <div style={{ overflowX: 'auto', background: token.surface, borderRadius: '0.875rem', border: `1px solid ${token.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${token.border}` }}>
                {[
                  ['Aksi', '10rem'],
                  ['No', '3rem'],
                  ['Nomor Dokumen', 'auto'],
                  ['Tanggal', '7rem'],
                  ['PT', '4rem'],
                  ['Judul', 'auto'],
                  ['User', 'auto'],
                  ['Divisi', 'auto'],
                  ['Int/Ext', 'auto'],
                  ['Klasifikasi', 'auto'],
                  ['Perihal', 'auto'],
                  ['Penandatangan', 'auto'],
                  ['Keterangan', '15rem'],
                  ['Link', '4rem']
                ].map(([h, w]) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.09em', textTransform: 'uppercase', color: token.muted, width: w, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((doc, idx) => (
                <tr
                  key={doc.id}
                  style={{ borderBottom: `1px solid ${token.border}`, background: editingDoc?.id === doc.id ? 'rgba(254,243,199,0.5)' : 'transparent', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (editingDoc?.id !== doc.id) e.currentTarget.style.background = 'rgba(26,42,87,0.025)'; }}
                  onMouseLeave={e => { if (editingDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Btn variant="soft"   style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => startDuplicate(doc)} title="Duplikat"><Copy size={12} /></Btn>
                      <Btn variant="ghost"  style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => startEdit(doc)} title="Edit"><Edit size={12} /></Btn>
                      <Btn variant="success" style={{ padding: '0.28rem 0.5rem', fontSize: '0.7rem' }} onClick={() => hDownload(doc)} title="Download Docx"><Download size={12} /></Btn>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', color: token.muted, fontWeight: 600 }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: token.blue, whiteSpace: 'nowrap' }}>{doc.doc_number}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.muted, whiteSpace: 'nowrap' }}>{doc.doc_date}</td>
                  <td style={{ padding: '0.8rem 1rem' }}>
                    <span style={{ ...(badgeStyles[doc.company] || badgeStyles.PKP), padding: '0.18rem 0.55rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700 }}>{doc.company}</span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', color: token.text, minWidth: 200, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.judul_dokumen || <span style={{ color: token.muted }}>—</span>}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.user_name}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.division}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.text }}>{doc.internal_external}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.text }}>{doc.klasifikasi || '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.text, minWidth: 150 }}>{doc.perihal || '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.text, whiteSpace: 'nowrap' }}>{doc.signed_by || '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', color: token.muted, fontSize: '0.78rem', minWidth: 200 }}>{doc.keterangan || '—'}</td>
                  <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                    {doc.link_document ? (
                      <a href={doc.link_document} target="_blank" rel="noopener noreferrer" style={{ color: token.blue }}>
                        <Link size={14} />
                      </a>
                    ) : <span style={{ color: token.muted }}>—</span>}
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr><td colSpan={14} style={{ padding: '3.5rem', textAlign: 'center', color: token.muted }}>
                  <FileText size={28} style={{ display: 'block', margin: '0 auto 0.6rem', opacity: 0.35 }} />
                  Tidak ada data
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 0.25rem' }}>
            <span style={{ fontSize: '0.78rem', color: token.muted }}>
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <Btn variant="ghost" style={{ padding: '0.35rem 0.65rem' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </Btn>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <Btn key={page} variant={page === currentPage ? 'primary' : 'ghost'} style={{ padding: '0.35rem 0.65rem', minWidth: '2.2rem' }} onClick={() => setCurrentPage(page)}>
                    {page}
                  </Btn>
                );
              })}
              <Btn variant="ghost" style={{ padding: '0.35rem 0.65rem' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight size={16} />
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryView;
