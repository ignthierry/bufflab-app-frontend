---
name: Urban Edge Shoecare
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#444748'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c9c6c5'
  secondary: '#003ec6'
  on-secondary: '#ffffff'
  secondary-container: '#0052fe'
  on-secondary-container: '#dfe3ff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001452'
  on-secondary-fixed-variant: '#0038b6'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

Sistem desain ini mencerminkan etos **Urban, Energetic, dan Premium**. Fokus utama adalah memberikan kesan presisi dan kebersihan tingkat tinggi bagi komunitas sneakerhead dan profesional urban. Visual harus memancarkan kepercayaan diri—seperti perasaan mengenakan sepatu baru langsung dari kotaknya.

Gaya desain mengadopsi **Corporate Modern** dengan sentuhan **High-Contrast**. Penggunaan ruang putih (white space) yang luas melambangkan kebersihan, sementara aksen warna elektrik memberikan energi "cleaning power" yang dinamis. Elemen visual harus terasa kokoh namun ramping, menghindari dekorasi yang tidak perlu untuk menonjolkan kualitas layanan.

## Colors

Palet warna dirancang untuk menciptakan kontras yang tajam antara profesionalisme dan inovasi.

- **Primary (Midnight Black):** Digunakan untuk teks judul, navigasi utama, dan elemen brand inti untuk memberikan kesan premium dan mapan.
- **Secondary (Electric Blue):** Mewakili energi pembersihan dan modernitas. Digunakan untuk tombol aksi (CTA) dan elemen interaktif.
- **Accent (Cyan Glow):** Digunakan secara hemat untuk indikator status, highlight kecil, atau ikon untuk memberikan kesan "bersinar" dan segar.
- **Neutral (Cool Gray & White):** Digunakan sebagai latar belakang untuk memastikan konten tetap terbaca dan memberikan kesan lingkungan yang steril dan bersih.

## Typography

Tipografi dalam sistem desain ini dibagi menjadi dua peran strategis:

1.  **Montserrat (Headlines):** Memberikan karakter yang kuat, tebal, dan energetik. Gunakan bobot *Extra Bold* untuk judul utama (Hero) guna menangkap perhatian pengguna secara instan.
2.  **Inter (Body & Labels):** Dipilih karena kejernihannya yang luar biasa pada layar digital. Fokus pada legibilitas tinggi untuk informasi layanan, harga, dan instruksi perawatan.

Semua teks harus mempertahankan kontras yang cukup terhadap latar belakang. Judul menggunakan *tight letter-spacing* untuk kesan urban yang lebih modern.

## Layout & Spacing

Sistem ini menggunakan **8pt Grid System** untuk konsistensi di seluruh antarmuka. 

- **Grid:** Menggunakan 12-kolom fluid grid untuk desktop dengan margin 64px. Untuk mobile, gunakan sistem 1-kolom dengan margin 16px.
- **Rhythm:** Jarak antar elemen dalam komponen (seperti ikon ke teks) menggunakan kelipatan 4px atau 8px. Jarak antar section besar menggunakan 80px (xl) untuk memberikan "napas" pada desain.
- **Alignment:** Semua elemen harus sejajar dengan grid vertikal untuk mempertahankan kesan presisi teknis.

## Elevation & Depth

Kedalaman visual diciptakan melalui **Ambient Shadows** dan **Tonal Layering** untuk menghindari kesan desain yang terlalu datar (flat).

- **Surface Levels:** Latar belakang utama menggunakan warna putih murni. Kontainer sekunder (seperti kartu layanan) menggunakan warna `Neutral Gray` yang sangat muda untuk pemisahan visual.
- **Shadows:** Gunakan bayangan yang sangat halus dan tersebar luas (blur tinggi, opasitas rendah 5-8%) dengan sedikit tint warna biru primer. Ini menciptakan efek kartu yang "mengapung" dengan elegan di atas permukaan bersih.
- **Active States:** Saat elemen ditekan atau di-hover, elevasi dapat meningkat sedikit atau menggunakan outline tipis berwarna `Secondary Blue` untuk memberikan umpan balik taktil.

## Shapes

Bahasa bentuk dalam sistem desain ini adalah **Rounded** (16px) untuk menyeimbangkan tipografi yang tajam dan tegas.

- **Cards & Containers:** Menggunakan radius 16px (`rounded-lg`) untuk memberikan kesan modern dan ramah pengguna.
- **Buttons:** Menggunakan radius 12px atau 16px untuk konsistensi dengan kontainer.
- **Form Inputs:** Menggunakan radius 8px untuk menjaga presisi pada area fungsional yang lebih kecil.
- **Ikonografi:** Gunakan ikon dengan goresan (stroke) yang konsisten dan ujung yang sedikit membulat (rounded caps) untuk menyelaraskan dengan komponen UI lainnya.

## Components

### 1. Hero Section
- **Visual:** Background bersih dengan foto sepatu berkualitas tinggi yang memiliki pencahayaan tajam.
- **Typography:** Judul utama menggunakan `Headline-XL` warna `Primary`.
- **CTA:** Tombol utama berukuran besar dengan warna `Secondary Blue` dan teks putih.

### 2. Service Cards (Kartu Layanan)
- **Struktur:** Gambar hasil (sebelum/sesudah), judul layanan (`Headline-MD`), deskripsi singkat, dan harga.
- **Style:** Latar belakang putih, radius 16px, dengan bayangan halus. Tambahkan label (chip) kecil di sudut atas untuk kategori (misal: "Deep Clean", "Repaint").

### 3. Call-to-Action (CTA) Buttons
- **Primary:** Latar belakang `Secondary Blue`, teks Montserrat Bold putih. Efek hover: warna berubah sedikit lebih gelap atau muncul bayangan lebih dalam.
- **Secondary:** Outline biru dengan latar belakang transparan.
- **State:** Pastikan status *loading* dan *disabled* terlihat jelas dengan warna abu-abu netral.

### 4. Input Fields
- Latar belakang abu-abu sangat muda atau putih dengan border 1px solid.
- Fokus state: Border berubah menjadi `Secondary Blue` dengan *glow* halus.

### 5. Chips/Badges
- Digunakan untuk status pesanan (misal: "Sedang Dicuci", "Selesai").
- Warna background soft (low opacity) dari warna aksen dengan teks warna pekat.