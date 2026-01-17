## Chart Dashboard - Visualisasi Data

Project ini adalah studi kasus visualisasi data pasien berbasis kategori menggunakan Node.js, Express, EJS, MySQL, dan D3.js. Data dari tabel `categories` dan `patients` diambil melalui REST API (Fetch API) lalu divisualisasikan menjadi 6 jenis chart berbeda di halaman dashboard.

### Studi Kasus

Tujuan project ini adalah menampilkan ringkasan data pasien berdasarkan kategori. Setiap chart menggabungkan data kategori dengan data pasien (umur dan kota) sehingga menghasilkan insight yang lebih lengkap, seperti jumlah pasien per kategori, rata-rata umur per kategori, jumlah kota unik per kategori, serta rentang umur per kategori.

Chart yang ditampilkan:

1. Bar chart: jumlah pasien per kategori.
2. Line chart: rata-rata umur per kategori.
3. Pie chart: proporsi pasien per kategori.
4. Doughnut chart: jumlah kota unik per kategori.
5. Polar area: jumlah pasien dari kota terbanyak per kategori.
6. Radar chart: rentang umur (min & max) per kategori.

### Struktur Data

Tabel yang digunakan:

**categories**

- `id`
- `name`

**patients**

- `id`
- `name`
- `category_id`
- `age`
- `city`
- `info`
- `created_at`

### Package yang Digunakan

- `express` - web framework untuk server dan routing API
- `mysql2` - koneksi database MySQL
- `dotenv` - membaca konfigurasi `.env`
- `ejs` - template engine untuk view
- `method-override` - dukungan method PUT/DELETE pada form
- `d3` - visualisasi chart
- `tailwindcss` + `@tailwindcss/cli` - styling UI
- `nodemon` (dev) - auto reload saat development

### Instalasi

1. Install dependency:

   ```bash
   npm install
   ```

2. Siapkan file `.env`:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_ROOT=root
   DB_PASSWORD=
   DB_NAME=dashboard_data
   ```

3. Jalankan build Tailwind (opsional, jika ingin melihat styling terbaru):

   ```bash
   npm run dev
   ```

4. Jalankan server:

   ```bash
   npm run nodemon
   ```

5. Akses aplikasi:
   ```
   http://localhost:3000
   ```

### Catatan

- Pastikan database `dashboard_data` sudah tersedia.
- Pastikan tabel `categories` dan `patients` sesuai dengan struktur di atas.
- Chart akan otomatis update setelah data diubah atau ditambah melalui form input di dashboard.

# ℹ️link tugas UTS🙏

https://youtu.be/eTPShWEdVac
