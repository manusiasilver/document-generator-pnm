const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const templatesDir = path.resolve(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir);


const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, templatesDir),
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.docx')) cb(null, true);
    else cb(new Error('Hanya file .docx yang diizinkan'));
  },
});

const dbPath = fs.existsSync(path.join(__dirname, 'database.sqllite'))
  ? path.join(__dirname, 'database.sqllite')
  : path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper function to convert month to Roman Numeral
function getRomanMonth(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const romanNumerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return romanNumerals[month];
}

// Get Master Data (Users & Divisions)
app.get('/api/data', (req, res) => {
    db.all("SELECT * FROM users", [], (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all("SELECT * FROM divisions", [], (err, divisions) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ users, divisions });
        });
    });
});

// Get List of Templates
app.get('/api/templates', (req, res) => {
    fs.readdir(templatesDir, (err, files) => {
        if (err) return res.status(500).json({ error: err.message });
        const docxFiles = files.filter(f => f.endsWith('.docx') && !f.startsWith('~$'));
        res.json(docxFiles);
    });
});

// Upload Template
app.post('/api/templates/upload', upload.single('template'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    res.json({ message: 'Template berhasil diupload', name: req.file.originalname });
});

// Delete Template
app.delete('/api/templates/:name', (req, res) => {
    const name = path.basename(req.params.name);
    if (!name.endsWith('.docx')) return res.status(400).json({ error: 'Nama file tidak valid' });
    const filePath = path.join(templatesDir, name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Template tidak ditemukan' });
    fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Template berhasil dihapus' });
    });
});

// Get Documents
app.get('/api/documents', (req, res) => {
    db.all("SELECT * FROM documents ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Generate Document Number
app.post('/api/generate', (req, res) => {
    const { company, user_name, division, internal_external, doc_date, klasifikasi, perihal, signed_by, keterangan, link_document, judul_dokumen, template_name } = req.body;

    const dateObj = new Date(doc_date);
    const year = dateObj.getFullYear();
    const romanMonth = getRomanMonth(doc_date);

    // Get Division Code
    db.get("SELECT * FROM divisions WHERE name = ?", [division], (err, divRow) => {
        if (err || !divRow) return res.status(400).json({ error: "Division not found" });

        const divCode = divRow.code;
        const klasif = divRow.klasifikasi || '-'; // Using DB or fallback

        // Find the latest running number for the given company AND year
        db.get(
            "SELECT running_number FROM documents WHERE company = ? AND strftime('%Y', doc_date) = ? ORDER BY running_number DESC LIMIT 1",
            [company, year.toString()],
            (err, lastDoc) => {
                if (err) return res.status(500).json({ error: err.message });

                let nextNumber = 1;
                if (lastDoc) {
                    nextNumber = lastDoc.running_number + 1;
                }

                const paddedNumber = String(nextNumber).padStart(4, '0');
                let formattedDocNumber = "";

                if (company === 'PNM') {
                    formattedDocNumber = `${paddedNumber}/PNM-${divCode}/${romanMonth}/${year}`;
                } else if (company === 'PKS') {
                    formattedDocNumber = `${paddedNumber}/PKS/${romanMonth}/${year}`;
                } else if (company === 'PKP') {
                    formattedDocNumber = `${paddedNumber}/PKP/${romanMonth}/${year}`;
                }

                // Insert to database
                db.run(
                    `INSERT INTO documents (company, running_number, doc_number, user_name, division, internal_external, doc_date, klasifikasi, perihal, signed_by, keterangan, link_document, judul_dokumen, template_name)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [company, nextNumber, formattedDocNumber, user_name, division, internal_external, doc_date, klasifikasi, perihal, signed_by, keterangan, link_document, judul_dokumen, template_name],
                    function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        db.get("SELECT * FROM documents WHERE id = ?", [this.lastID], (err, newDoc) => {
                            res.json(newDoc);
                        });
                    }
                );
            }
        );
    });
});

// Update Existing Document
app.put('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const { user_name, division, internal_external, doc_date, klasifikasi, perihal, signed_by, keterangan, link_document, judul_dokumen, template_name } = req.body;

    db.run(
        `UPDATE documents SET 
            user_name = ?, division = ?, internal_external = ?, doc_date = ?, 
            klasifikasi = ?, perihal = ?, signed_by = ?, keterangan = ?, 
            link_document = ?, judul_dokumen = ?, template_name = ?
         WHERE id = ?`,
        [user_name, division, internal_external, doc_date, klasifikasi, perihal, signed_by, keterangan, link_document, judul_dokumen, template_name, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.get("SELECT * FROM documents WHERE id = ?", [id], (err, updatedDoc) => {
                res.json(updatedDoc);
            });
        }
    );
});

// Generate & Download .docx template
app.post('/api/download', (req, res) => {
    const { doc_number } = req.body;
    
    // Get full document details from DB
    db.get("SELECT * FROM documents WHERE doc_number = ?", [doc_number], (err, doc) => {
        if (err || !doc) return res.status(404).json({ error: "Document not found" });

        const activeTemplate = doc.template_name || 'template.docx';
        const templatePath = path.resolve(__dirname, 'templates', activeTemplate);
        
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: `File template '${activeTemplate}' belum ditambahkan ke folder backend/templates` });
        }

        try {
            // Load the docx file as binary content
            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);
            const docTemplater = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            // Set the template variables
            docTemplater.render({
                company: doc.company,
                doc_number: doc.doc_number,
                judul_dokumen: doc.judul_dokumen || '',
                user_name: doc.user_name,
                division: doc.division,
                doc_date: doc.doc_date,
                klasifikasi: doc.klasifikasi,
                perihal: doc.perihal,
                signed_by: doc.signed_by,
                keterangan: doc.keterangan
            });

            const buf = docTemplater.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE'
            });

            // Send file to client
            let docJudul = doc.judul_dokumen ? doc.judul_dokumen.replace(/[^a-zA-Z0-9 -]/g, '') : "Dokumen";
            const sanitizedName = doc_number.replace(/\//g, '_');
            const finalName = `${docJudul}_${sanitizedName}.docx`;
            res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.send(buf);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Gagal memproses template dokumen. Pastikan tag template Anda menggunakan penulisan yang benar." });
        }
    });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
