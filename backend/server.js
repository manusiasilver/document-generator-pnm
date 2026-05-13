const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const multer = require('multer');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env', override: false });

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connections ───────────────────────────────────────────
// DB papertrail — untuk tabel documents
const ptPool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'papertrail',
});

// DB pilargroup — untuk master_departments (read-only)
const pgPool = mysql.createPool({
  host:     process.env.PG_DB_HOST  || 'localhost',
  port:     process.env.PG_DB_PORT  || 3306,
  user:     process.env.PG_DB_USER  || 'root',
  password: process.env.PG_DB_PASS  || '',
  database: 'pilargroup',
});

// ─── Templates Dir ────────────────────────────────────────────
const templatesDir = path.resolve(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, templatesDir),
    filename:    (req, file, cb) => cb(null, file.originalname),
  }),
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.docx')) cb(null, true);
    else cb(new Error('Hanya file .docx yang diizinkan'));
  },
});

// ─── Helpers ──────────────────────────────────────────────────
function getRomanMonth(dateString) {
  const month = new Date(dateString).getMonth() + 1;
  return ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][month];
}

// ─── JWT Middleware ───────────────────────────────────────────
function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek apakah user punya akses ke papertrail
    const apps = decoded.apps || [];
    if (!apps.includes('papertrail')) {
      return res.status(403).json({ error: 'Akses ditolak: tidak terdaftar di project papertrail' });
    }

    req.user = decoded; // { sub, department_id, department, apps, cv }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah expired' });
  }
}

// ─── Mock Auth (local only) ───────────────────────────────────
if (process.env.APP_ENV === 'local') {
  app.post('/api/dev/login', async (req, res) => {
    const username = req.body.username || process.env.DEV_MOCK_USERNAME;
    const password = req.body.password || process.env.DEV_MOCK_PASSWORD;

    try {
      const response = await axios.post(
        `${process.env.PILARGROUP_API_URL}/auth/login`,
        { username, password },
      );
      res.json(response.data); // { token, user }
    } catch (err) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || 'Gagal konek ke pilargroup';
      res.status(status).json({ error: message });
    }
  });
}

// ─── Master Data ──────────────────────────────────────────────
// GET /api/data?company=PNM
// Return departments dari pilargroup DB, difilter by company
app.get('/api/data', verifyJWT, async (req, res) => {
  const company = req.query.company || 'PNM';
  try {
    const [rows] = await pgPool.query(
      'SELECT id, name, code FROM master_departments WHERE company = ? ORDER BY name',
      [company],
    );
    res.json({ departments: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Templates ────────────────────────────────────────────────
app.get('/api/templates', verifyJWT, (req, res) => {
  fs.readdir(templatesDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(files.filter(f => f.endsWith('.docx') && !f.startsWith('~$')));
  });
});

app.post('/api/templates/upload', verifyJWT, upload.single('template'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' });
  res.json({ message: 'Template berhasil diupload', name: req.file.originalname });
});

app.delete('/api/templates/:name', verifyJWT, (req, res) => {
  const name = path.basename(req.params.name);
  if (!name.endsWith('.docx')) return res.status(400).json({ error: 'Nama file tidak valid' });
  const filePath = path.join(templatesDir, name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Template tidak ditemukan' });
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Template berhasil dihapus' });
  });
});

// ─── Documents ────────────────────────────────────────────────
app.get('/api/documents', verifyJWT, async (req, res) => {
  try {
    const [rows] = await ptPool.query(
      'SELECT * FROM documents ORDER BY id DESC',
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate — buat nomor dokumen baru
app.post('/api/generate', verifyJWT, async (req, res) => {
  const {
    company, judul_dokumen, division, internal_external,
    doc_date, klasifikasi, perihal, signed_by, keterangan,
    link_document, template_name,
  } = req.body;

  // user_id dan user_name dari JWT (bukan dari body)
  const user_id   = req.user.sub;
  const user_name = req.user.name; // dari /api/auth/me di localStorage FE

  if (!company || !doc_date) {
    return res.status(400).json({ error: 'company dan doc_date wajib diisi' });
  }

  const year       = new Date(doc_date).getFullYear();
  const romanMonth = getRomanMonth(doc_date);

  try {
    // Ambil division code dari pilargroup
    const [[deptRow]] = await pgPool.query(
      'SELECT code FROM master_departments WHERE name = ? AND company = ?',
      [division, company],
    );
    if (!deptRow) return res.status(400).json({ error: 'Department tidak ditemukan' });

    const divCode = deptRow.code;

    // Running number per company per tahun
    const [[lastDoc]] = await ptPool.query(
      `SELECT running_number FROM documents
       WHERE company = ? AND YEAR(doc_date) = ?
       ORDER BY running_number DESC LIMIT 1`,
      [company, year],
    );
    const nextNumber   = (lastDoc?.running_number ?? 0) + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');

    let doc_number;
    if (company === 'PNM')      doc_number = `${paddedNumber}/PNM-${divCode}/${romanMonth}/${year}`;
    else if (company === 'PKS') doc_number = `${paddedNumber}/PKS/${romanMonth}/${year}`;
    else if (company === 'PKP') doc_number = `${paddedNumber}/PKP/${romanMonth}/${year}`;
    else return res.status(400).json({ error: 'Company tidak valid' });

    const [result] = await ptPool.query(
      `INSERT INTO documents
        (company, user_id, running_number, doc_number, user_name, division,
         internal_external, doc_date, klasifikasi, perihal, judul_dokumen,
         signed_by, keterangan, link_document, template_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company, user_id, nextNumber, doc_number, user_name, division,
       internal_external, doc_date, klasifikasi, perihal, judul_dokumen,
       signed_by, keterangan, link_document, template_name],
    );

    const [[newDoc]] = await ptPool.query(
      'SELECT * FROM documents WHERE id = ?', [result.insertId],
    );
    res.json(newDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update dokumen existing
app.put('/api/documents/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const {
    division, internal_external, doc_date, klasifikasi,
    perihal, signed_by, keterangan, link_document, judul_dokumen, template_name,
  } = req.body;

  try {
    await ptPool.query(
      `UPDATE documents SET
        division = ?, internal_external = ?, doc_date = ?, klasifikasi = ?,
        perihal = ?, signed_by = ?, keterangan = ?, link_document = ?,
        judul_dokumen = ?, template_name = ?
       WHERE id = ?`,
      [division, internal_external, doc_date, klasifikasi,
       perihal, signed_by, keterangan, link_document, judul_dokumen, template_name, id],
    );

    const [[updatedDoc]] = await ptPool.query(
      'SELECT * FROM documents WHERE id = ?', [id],
    );
    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download .docx
app.post('/api/download', verifyJWT, async (req, res) => {
  const { doc_number } = req.body;

  try {
    const [[doc]] = await ptPool.query(
      'SELECT * FROM documents WHERE doc_number = ?', [doc_number],
    );
    if (!doc) return res.status(404).json({ error: 'Dokumen tidak ditemukan' });

    const activeTemplate = doc.template_name || 'template.docx';
    const templatePath   = path.resolve(__dirname, 'templates', activeTemplate);

    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        error: `File template '${activeTemplate}' belum ditambahkan ke folder backend/templates`,
      });
    }

    const content     = fs.readFileSync(templatePath, 'binary');
    const zip         = new PizZip(content);
    const docTemplate = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    docTemplate.render({
      company:       doc.company,
      doc_number:    doc.doc_number,
      judul_dokumen: doc.judul_dokumen || '',
      user_name:     doc.user_name,
      division:      doc.division,
      doc_date:      doc.doc_date,
      klasifikasi:   doc.klasifikasi,
      perihal:       doc.perihal,
      signed_by:     doc.signed_by,
      keterangan:    doc.keterangan,
    });

    const buf = docTemplate.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    const sanitizedNumber = doc_number.replace(/\//g, '_');
    const judulClean      = (doc.judul_dokumen || 'Dokumen').replace(/[^a-zA-Z0-9 -]/g, '');
    res.setHeader('Content-Disposition', `attachment; filename="${judulClean}_${sanitizedNumber}.docx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memproses template dokumen' });
  }
});

// ─── Serve Frontend ───────────────────────────────────────────
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

const PORT = process.env.PORT || 8096;
app.listen(PORT, () => console.log(`Papertrail running on http://localhost:${PORT}`));