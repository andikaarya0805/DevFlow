# DevFlow - Enterprise Project Management System 🚀

DevFlow adalah aplikasi manajemen proyek berarsitektur *full-stack* berbasis Next.js 15 dan Firebase yang dirancang khusus untuk memusatkan progres internal tim, standarisasi kode, serta orientasi kerja (onboarding) developer baru tanpa miskomunikasi.

---

## 🌟 Fitur Utama (Core Features)

### 1. Role-Based Access Control (RBAC) Cerdas
Sistem mengidentifikasi hak akses pengguna secara otomatis sejak saat pertama login melalui akun Google (Firebase Auth).
- **Admin/Project Manager (PM):** Memiliki hak penuh (God Mode). Akses terbuka untuk mengelola seluruh data sistem dari Menu *Dashboard*, *Team Progress*, *Checklists*, dan *Code Standards*.
- **Developer:** Memiliki kendali terbatas pada menu operasional. Hanya dapat mengakses dan mencentang *Checklists*, serta membaca *Code Standards* tanpa bisa mengubah referensi data *Global*. 

### 2. Live Dynamic Dashboard (`/dashboard`)
Layar intelijen bisnis yang menavigasikan angka riil performa tim tanpa data tiruan (*dummy*):
- **Pending Checklists:** Menghitung total skor dan tugas teknis tersisa dari keseluruhan tim yang harus dibereskan.
- **Team Alignment:** Mengalkulasi rata-rata adopsi standar tim Anda menjadi persentase tingkat global secara akurat, disertai *Standards Drift* untuk anomali regresi (apabila di atas 20%).
- **Cetak Laporan Otomatis:** Tombol "New Report" memanfaatkan konversi Native Browser UI ke format file presentasi cetak/PDF khusus laporan PM.

### 3. CMS Checklist & Sync (*Global Real-time CRUD*)
Menggantikan daftar tugas yang dulunya dikodekan manual (*hardcoded*) menjadi *Database Live Collection*:
- Admin dilengkapi mode "Manage Tasks" untuk Menambah (Create), Mengubah (Update), dan Menghapus (Delete) daftar tugas *(Environment, Workflow, dll)* di sistem aplikasi secara langsung (`/checklist`).
- Developer akan langsung melihat tugas tambahan ini muncul di layar mereka pada detik yang sama (menggunakan *listeners* Web Socket Firebase) sehingga semua tugas tim selalu sinkron tanpa penyampaian manual.

### 4. Intelijen Progress Tim Berjenjang (`/team`)
Layar navigasi performa bagi PM:
- Menampilkan semua Developer aktif lengkap dengan bar persentase penyelesaian keseluruhan yang responsif.
- Fitur **Accordion Detail (X-Ray Mode)**: PM dapat menekan panah ke bawah untuk melihat centang persis "*Tugas mana yang belum selesai dikerjakan anggota tim A?*" secara transparan.

### 5. Dokumentasi Terpusat Multi-Klien (`/standards`)
Buku saku online (Wiki) bagi Developer baru.
- Mode Admin membuka *text area* dan dapat mengubah pakem cara coding tim di platform dengan interaksi langsung.
- Perubahan pakem ini meng-update ke database tunggal dan langsung memantulkan pembaruan ke ribuan layar Developer lain secara sinkron.

---

## 🛡️ Cara Kerja Arsitektur Aplikasi (Under the Hood)

### 1. Engine Front-End (React + Next.js App Router)
Aplikasi memisahkan kerangka statis dan dinamis dengan perintah `use client` pada halaman yang membutuhkan state/hook. Sistem sepenuhnya di-desain menggunakan **Tailwind CSS** dengan pakem *Glassmorphism* yang gelap (Cyberpunk/Dark Indigo), menghindari *bug-bug* bawaan *styling* Native OS.

### 2. Live WebSocket Database (Firebase Firestore)
Data tidak menggunakan mekanisme konvensional (mengambil dan menunggu/REST API). DevFlow menggunakan metode **`onSnapshot()`**—sistem merajut kanal terbuka ke server yang menyebabkan perubahan data apapun (contoh: PM mengubah satu poin checklist, Staf mencentang 1 tugas) didorong kembali oleh Google ke lokal PC pada latensi hanya sekitar < 50ms (*seamless* dan tanpa-Refresh browser).

### 3. Skema Database NoSQL Sentral
- `global_tasks`: Berisi pondasi tugas pokok *(title, description, category)*.
- `users`: Dokumentasi progress setiap pegawai *(completedTaskIDs list, percentage, role)*.
- `settings`: Dokumentasi konfigurasi statis *(Misal: Core Standards Text)*.  

---

## 🛠️ Instalasi & Setup Developer

1. Lakukan kloning instalasi dependensi (Node.js):
   ```bash
   npm install
   ```
2. Pastikan file `.env.local` telah dimasukkan kunci API *Firebase Config* milik Anda.
3. Jalankan server Development:
   ```bash
   npm run dev
   ```
Aplikasi DevFlow dapat diakses di URL `http://localhost:3000`.
