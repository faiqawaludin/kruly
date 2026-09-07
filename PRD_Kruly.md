# Product Requirements Document (PRD)
## Kruly — Project Management Tool Internal (Alternatif ClickUp)

**Versi**: 2.0 (Final)
**Tanggal**: 7 September 2026
**Pemilik Produk**: Faiq
**Status**: Final — Siap Masuk Tahap Development

---

## 1. Latar Belakang & Tujuan

### 1.1 Latar Belakang
Saat ini tim menggunakan ClickUp untuk manajemen proyek magang (workspace "Intern UTPE" dengan beberapa proyek seperti AMS Tracker, KPI Library, dsb), namun ClickUp berbayar untuk fitur-fitur lanjutan (Gantt chart, custom dashboard, dsb). Dibutuhkan alternatif internal bernama **Kruly** yang bisa di-host sendiri (self-hosted) di Vercel, dengan fitur inti yang setara namun tanpa biaya lisensi berulang.

### 1.2 Tujuan Produk
Membangun aplikasi project management berbasis web (Kruly) yang:
- Mengelola banyak proyek dalam satu workspace departemen, dengan isolasi akses antar proyek.
- Mencatat proyek per **tahun aktif**, sehingga record tiap angkatan/periode magang tetap jelas dan terarsip rapi.
- Menyediakan visibilitas progres lewat dashboard, Gantt chart, dan kalender.
- Memfasilitasi komunikasi tim langsung di dalam aplikasi (in-app chat).
- Bisa di-deploy dan dikelola sendiri (self-hosted) di Vercel dengan biaya operasional minimal.

### 1.3 Target Pengguna
Tim kecil (skala magang/kerja internal, estimasi 5–20 pengguna aktif per workspace), terdiri dari:
- **Admin**: mengelola workspace, invite anggota, membuat/menghapus proyek.
- **Member**: mengerjakan task pada proyek yang di-assign kepadanya, tidak bisa melihat proyek lain.

---

## 2. Lingkup Produk (Scope)

### 2.1 Termasuk dalam MVP (Fase 1)
- Autentikasi pengguna (login/register)
- Sistem invite berbasis email dengan kontrol akses per proyek
- Manajemen Workspace → Project (dengan tahun aktif & status archived) → Task
- Dashboard ringkasan progres per proyek
- CRUD Task dasar (nama, status, due date, priority, assignee)
- Link dokumen (URL, misal Google Drive) pada task & dashboard — tidak menyimpan file, hanya tautan

### 2.2 Fase Lanjutan (Post-MVP)
- Gantt chart (timeline & dependency antar task)
- Calendar of Events (jadwal meeting, milestone)
- In-app chat (real-time, per proyek atau per task)
- Notifikasi (email/in-app) untuk due date, assignment, mention di chat

### 2.3 Di Luar Lingkup (Out of Scope)
- Integrasi pihak ketiga (Slack, Google Calendar sync, dsb) — dipertimbangkan setelah MVP stabil
- Aplikasi mobile native
- Fitur billing/subscription (karena ini untuk internal, bukan produk komersial)
- Automasi kompleks (custom workflow rules seperti ClickUp Automations)
- Duplikasi proyek otomatis antar tahun (masuk Fase Lanjutan, bukan MVP)

---

## 3. Peran & Hak Akses (Roles & Permissions)

| Peran | Hak Akses |
|---|---|
| **Admin** | Membuat/menghapus workspace & project, invite/hapus anggota, akses semua proyek dalam workspace, assign role |
| **Member** | Hanya bisa melihat & mengerjakan proyek yang di-assign kepadanya, tidak bisa melihat proyek lain, tidak bisa invite anggota baru |

**Aturan inti**: Data proyek (task, dashboard, chat, dsb) tidak boleh terekspos ke pengguna yang bukan anggota proyek tersebut, sekalipun mereka berada di workspace yang sama. Kontrol ini diterapkan di level database (Row Level Security), bukan hanya di UI.

---

## 4. Kebutuhan Fungsional (Functional Requirements)

### 4.1 Autentikasi & Invite
| ID | Kebutuhan |
|---|---|
| F1.1 | Pengguna dapat login menggunakan email & password atau magic link |
| F1.2 | Admin dapat mengundang anggota baru via email |
| F1.3 | Anggota yang diundang menerima email berisi tautan aktivasi/pendaftaran akun |
| F1.4 | Admin dapat menentukan proyek mana saja yang bisa diakses oleh anggota yang diundang |
| F1.5 | Admin dapat mencabut akses anggota dari proyek tertentu kapan saja |

### 4.2 Manajemen Workspace & Proyek
| ID | Kebutuhan |
|---|---|
| F2.1 | Admin dapat membuat, mengedit, dan menghapus proyek |
| F2.2 | Setiap proyek memiliki nama, deskripsi, **tahun aktif (periode)**, dan daftar anggota |
| F2.3 | Pengguna hanya melihat daftar proyek yang menjadi anggotanya di halaman "My Projects" |
| F2.4 | Halaman "My Projects" dapat difilter berdasarkan tahun aktif, dengan tahun berjalan sebagai default tampilan |
| F2.5 | Proyek memiliki status **Active** atau **Archived** — proyek dari tahun sebelumnya dapat diarsipkan tanpa menghapus datanya |
| F2.6 | Admin dapat menduplikasi proyek dari tahun sebelumnya sebagai starting point untuk tahun baru (Fase Lanjutan) |

### 4.3 Manajemen Task
| ID | Kebutuhan |
|---|---|
| F3.1 | Pengguna dapat membuat, mengedit, menghapus task dalam proyek yang diaksesnya |
| F3.2 | Task memiliki atribut: nama, status (Open/In Progress/Approved/Done, dapat dikustomisasi), due date, priority (Urgent/High/Normal/Low), assignee, deskripsi |
| F3.3 | Task dapat dikelompokkan berdasarkan status (tampilan mirip List view ClickUp) |
| F3.4 | Pengguna dapat menambahkan link dokumen (misal Google Drive) pada task — disimpan sebagai URL, bukan file — dan dapat diklik untuk membuka dokumen tersebut; dapat diubah/dihapus kapan saja lewat UI |
| F3.5 | Dashboard dapat menampilkan kumpulan link penting (dokumen/referensi) yang dapat dikelola (tambah/ubah/hapus) lewat UI |

### 4.4 Dashboard
| ID | Kebutuhan |
|---|---|
| F4.1 | Dashboard menampilkan ringkasan jumlah task per status dalam sebuah proyek |
| F4.2 | Dashboard menampilkan task yang mendekati/melewati due date |
| F4.3 | Dashboard menampilkan distribusi task per anggota (beban kerja) |

### 4.5 Gantt Chart (Fase Lanjutan)
| ID | Kebutuhan |
|---|---|
| F5.1 | Menampilkan timeline task dalam bentuk bar horizontal berdasarkan tanggal mulai & selesai |
| F5.2 | Mendukung drag untuk mengubah durasi/tanggal task |
| F5.3 | Mendukung dependency antar task (task B baru mulai setelah task A selesai) |

### 4.6 Calendar of Events (Fase Lanjutan)
| ID | Kebutuhan |
|---|---|
| F6.1 | Pengguna dapat membuat event (meeting, milestone) dengan tanggal & waktu |
| F6.2 | Event ditampilkan dalam tampilan kalender bulanan/mingguan |
| F6.3 | Event dapat dikaitkan dengan proyek tertentu |

### 4.7 In-App Chat (Fase Lanjutan)
| ID | Kebutuhan |
|---|---|
| F7.1 | Setiap proyek memiliki ruang chat khusus untuk anggotanya |
| F7.2 | Pesan chat muncul secara real-time tanpa perlu refresh halaman |
| F7.3 | Pengguna dapat mention anggota lain dalam chat |

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Kebutuhan |
|---|---|
| **Keamanan** | Data antar proyek terisolasi di level database (RLS); password di-hash; koneksi HTTPS |
| **Performa** | Halaman utama (dashboard, list task) termuat dalam < 2 detik untuk workspace dengan puluhan task |
| **Skalabilitas** | Arsitektur mendukung penambahan proyek & anggota tanpa perubahan struktur besar |
| **Ketersediaan** | Deployment di Vercel (serverless), database terkelola (managed) agar minim downtime |
| **Biaya** | Menggunakan layanan free tier (Vercel Hobby, Supabase Free) selama skala tim kecil & non-komersial. Catatan: Vercel Hobby dibatasi untuk penggunaan personal/non-komersial (aman untuk tool internal magang); Supabase Free project akan pause otomatis setelah 7 hari tanpa aktivitas dan tidak menyediakan backup otomatis — perlu backup manual berkala jika data dianggap penting |
| **Portabilitas** | Kode dapat di-deploy ulang atau dipindahkan penyedia hosting lain jika diperlukan |

---

## 6. Arsitektur & Tumpukan Teknologi (Tech Stack)

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework Full-stack | **Next.js (App Router)** | Native untuk deployment di Vercel, frontend & backend jadi satu |
| Database | **PostgreSQL via Supabase** | Free tier tersedia, sudah termasuk Auth & Realtime |
| Autentikasi | **Supabase Auth** | Mendukung invite-by-email out of the box |
| Kontrol Akses | **Row Level Security (RLS) Postgres** | Keamanan data diterapkan di level DB, bukan hanya UI |
| ORM (opsional) | **Prisma** atau Supabase client langsung | Prisma untuk skema yang lebih kompleks; Supabase client cukup untuk MVP |
| UI | **Tailwind CSS + shadcn/ui** | Cepat membangun tampilan rapi tanpa desain dari nol |
| Gantt Chart | **gantt-task-react / DHTMLX Gantt** | Menghindari membangun timeline interaktif dari nol |
| Calendar | **FullCalendar** | Library matang untuk tampilan kalender |
| Real-time Chat | **Supabase Realtime** | Terintegrasi langsung dengan database yang sudah dipakai |
| Hosting | **Vercel** | Sesuai kebutuhan awal, mendukung Next.js secara native |

---

## 7. Skema Data (Ringkas)

```
workspaces (id, name, owner_id, created_at)
users (id, email, name, created_at)
workspace_members (workspace_id, user_id, role)
projects (id, workspace_id, name, description, year, status, created_at)  -- status: active/archived
project_members (project_id, user_id, role)  -- role: admin/member
tasks (id, project_id, name, description, status, priority, due_date, assignee_id, drive_link, created_at)
project_links (id, project_id, label, url, created_by)  -- link dokumen/referensi untuk dashboard
events (id, project_id, title, start_time, end_time, created_by)
messages (id, project_id, sender_id, content, created_at)
```

**Catatan**: `drive_link` dan `project_links.url` hanya menyimpan string URL (misal tautan Google Drive), bukan file — sehingga tidak memerlukan layanan file storage (Supabase Storage) dan tidak menambah beban kuota database.

**Prinsip akses**: setiap query terhadap `tasks`, `events`, `messages` wajib memverifikasi keanggotaan pengguna pada `project_members` untuk `project_id` terkait, ditegakkan melalui RLS policy di Postgres.

---

## 8. Alur Pengguna Utama (Key User Flows)

### 8.1 Admin Mengundang Anggota
1. Admin membuka halaman "Manage Members" pada sebuah proyek
2. Admin memasukkan email anggota baru
3. Sistem mengirim email undangan berisi tautan aktivasi
4. Anggota membuat akun/login melalui tautan tersebut
5. Anggota otomatis mendapat akses ke proyek yang diundang, dan hanya proyek tersebut

### 8.2 Member Mengelola Task
1. Member login dan melihat daftar proyek yang diaksesnya di "My Projects"
2. Member membuka salah satu proyek, melihat daftar task terkelompok per status
3. Member membuat/mengedit task, mengubah status sesuai progres

---

## 9. Roadmap Implementasi

| Fase | Fitur | Estimasi Fokus |
|---|---|---|
| **Fase 1 — MVP** | Auth + Invite, Workspace/Project/Task CRUD, Dashboard dasar | Fondasi & akses data aman |
| **Fase 2** | Gantt Chart | Visibilitas timeline proyek |
| **Fase 3** | Calendar of Events | Manajemen jadwal meeting |
| **Fase 4** | In-app Chat (real-time) | Komunikasi tim |
| **Fase 5** | Notifikasi, lampiran file, polish UI/UX | Penyempurnaan pengalaman pengguna |

---

## 10. Metrik Keberhasilan (Success Metrics)

- Seluruh anggota tim magang berhasil bermigrasi dari ClickUp ke tool ini untuk pelacakan task harian
- Tidak ada insiden kebocoran data antar proyek (0 laporan akses tidak sah)
- Waktu muat halaman dashboard/list task < 2 detik pada penggunaan normal
- Adopsi fitur chat menggantikan kebutuhan komunikasi terpisah (WhatsApp/Slack) untuk koordinasi task

---

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Kompleksitas membangun Gantt & Chat real-time dari nol | Gunakan library matang (gantt-task-react, Supabase Realtime) alih-alih membangun dari nol |
| Kesalahan konfigurasi akses menyebabkan kebocoran data antar proyek | Terapkan RLS di level database, uji dengan skenario multi-user sebelum rilis |
| Keterbatasan waktu pengembangan (dikerjakan sambil magang) | Prioritaskan MVP, tunda fitur lanjutan sesuai roadmap fase |
| Ketergantungan pada free tier layanan pihak ketiga (Supabase/Vercel) | Pantau penggunaan resource, siapkan rencana upgrade jika melewati batas free tier |
| Project Supabase free tier pause otomatis setelah 7 hari idle | Setup ping berkala (misal cron job/GitHub Actions) jika aplikasi berpotensi idle lama, atau terima downtime singkat saat resume manual |
| Tidak ada backup otomatis di Supabase free tier | Buat backup manual berkala (export data penting) jika volume data mulai signifikan |

---

## 12. Lampiran

- Nama produk: **Kruly** — dipilih dari eksplorasi nama bergaya Notion/Jira/Trello, hasil penyesuaian dari "Krewly" agar lebih natural diucapkan oleh pengguna Indonesia
- Referensi fitur: ClickUp (List view, Dashboard, Gantt, Calendar of Events) sebagaimana digunakan saat ini di workspace magang "Intern UTPE"
- Dokumen ini bersifat final untuk memulai tahap development MVP; perubahan lanjutan akan dicatat sebagai versi baru
