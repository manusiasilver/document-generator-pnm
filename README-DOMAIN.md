# Setup Domain Lokal

## Cara Pakai Domain di Komputer Server

Edit file hosts Windows:
1. Buka Notepad **sebagai Administrator**
2. Buka file: `C:\Windows\System32\drivers\etc\hosts`
3. Tambahkan baris ini di bawah:
   ```
   127.0.0.1   docgen.local
   ```
4. Simpan file
5. Akses di browser: `http://docgen.local`

---

## Cara Akses dari Komputer Lain di Jaringan

Tidak perlu setup apapun. Cukup buka browser dan ketik:
```
http://[IP-KOMPUTER-SERVER]
```

Contoh: `http://192.168.1.100`

Cari IP server dengan cara: buka CMD → ketik `ipconfig` → lihat IPv4 Address

---

## Perintah PM2 Berguna

| Perintah | Fungsi |
|----------|--------|
| `pm2 list` | Lihat status app |
| `pm2 logs doc-generator` | Lihat log |
| `pm2 restart doc-generator` | Restart app |
| `pm2 stop doc-generator` | Stop app |
| `pm2 start doc-generator` | Start app |

---

## Update Setelah Ada Perubahan

Cukup double-click **update.bat**
