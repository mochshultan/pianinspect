# Revisi: Kesesuaian Pipeline `estimateFreq()` terhadap Paper YIN

> Referensi: de Cheveigné, A., & Kawahara, H. (2002). *YIN, a fundamental frequency
> estimator for speech and music*. J. Acoust. Soc. Am., 111(4), 1917–1930.

Dokumen ini merangkum hasil pengecekan kode `AudioEngine.estimateFreq()` (file
`pianika-qc.js`) terhadap enam langkah algoritma YIN pada paper. Gunakan ini sebagai
acuan saat merevisi Bab Metode / slide landasan teori skripsi agar klaim kesesuaian
metode akurat dan dapat dipertanggungjawabkan ke penguji.

---

## 1. Ringkasan Status

| # | Tahap Paper | Status di Kode | Catatan |
|---|---|---|---|
| 1 | Windowing / ACF dasar | ⚠️ Disederhanakan | Non-simetris, bukan varian Eq. (A1) yang dipakai paper di evaluasi akhir |
| 2 | Difference function (Eq. 6) | ✅ Sesuai | Identik |
| 3 | CMNDF (Eq. 8) | ✅ Sesuai | Bentuk running-sum, ekuivalen matematis |
| 4 | Absolute threshold | ✅ Sesuai | Termasuk fallback ke minimum global |
| 5 | Parabolic interpolation | ✅ Sesuai | Rumus standar sesuai paper |
| 6 | Best Local Estimate | ❌ Diganti | Diganti median filtering 21-frame, bukan implementasi asli |
| – | Band-pass filter 150–1200 Hz | ➕ Ekstensi | Tidak ada di paper inti — tambahan untuk noise EMI/EMF pabrik |
| – | Ekstensi Bab VI (amplitudo/DC/noise) | ➖ Tidak dipakai | Konsisten dengan kesimpulan paper (tidak terbukti efektif) |

**Klaim yang AMAN ditulis di laporan:**
> "Implementasi inti algoritma YIN (Langkah 2–5: difference function, CMNDF,
> absolute threshold, parabolic interpolation) sesuai dengan de Cheveigné &
> Kawahara (2002), dengan modifikasi pada Langkah 1 (windowing non-simetris)
> dan penggantian Langkah 6 (Best Local Estimate) dengan median filtering
> 21-frame sebagai adaptasi untuk stabilitas real-time pada lingkungan
> industri dengan interferensi EMI/EMF tinggi."

**Klaim yang TIDAK akurat (hindari):**
> ~~"Sistem ini mengimplementasikan algoritma YIN sepenuhnya sesuai paper
> de Cheveigné & Kawahara (2002), Langkah 1–6."~~

---

## 2. Detail Per Tahap

### 2.1 Langkah 1 — Windowing (⚠️ disederhanakan)

**Paper** (varian akhir, Apendiks bagian "YIN"):

```
rt(τ) = Σ xⱼxⱼ₊τ   untuk j = t−τ/2−W/2 ... t−τ/2+W/2
```
Window bergeser **simetris** terhadap titik analisis.

**Kode saat ini:**
```js
for (let i = 0; i < wLen; i++) {
    const diff = this.timeData[i] - this.timeData[i + tau];
    df[tau] += diff * diff;
}
```
Window **tidak simetris** — mulai dari `i = 0` tetap, bukan bergeser mengikuti `τ`.

**Dampak:** Kecil untuk sinyal stasioner (nada pianika yang stabil selama ditiup),
tapi tetap merupakan simplifikasi yang perlu disebutkan secara eksplisit di laporan.

---

### 2.2 Langkah 2 — Difference Function (✅ sesuai)

**Paper Eq. (6):**
```
dt(τ) = Σ (xⱼ − xⱼ₊τ)²
```

**Kode:**
```js
const diff = this.timeData[i] - this.timeData[i + tau];
df[tau] += diff * diff;
```
Identik.

---

### 2.3 Langkah 3 — CMNDF (✅ sesuai)

**Paper Eq. (8):**
```
d't(τ) = dt(τ) / [ (1/τ) Σ(j=1..τ) dt(j) ]
```

**Kode:**
```js
runningSum += df[tau];
cmndf[tau] = (df[tau] * tau) / runningSum;
```
Bentuk running-sum, secara matematis ekuivalen dengan rata-rata kumulatif paper.

---

### 2.4 Langkah 4 — Absolute Threshold (✅ sesuai)

**Paper:** pilih τ terkecil dengan `d'(τ) < threshold`; jika tidak ada yang lolos,
ambil minimum global. Threshold default = 0.1.

**Kode:**
```js
const threshold = 0.1;
for (let tau = tMin; tau < tMax; tau++) {
    if (cmndf[tau] < threshold) {
        while (tau + 1 < tMax && cmndf[tau + 1] < cmndf[tau]) tau++;
        tauEstimate = tau;
        break;
    }
}
if (tauEstimate === -1) {
    // fallback ke minimum global
}
```
Sesuai, termasuk fallback-nya.

---

### 2.5 Langkah 5 — Parabolic Interpolation (✅ sesuai)

**Kode:**
```js
const alpha = cmndf[tauEstimate - 1];
const beta = cmndf[tauEstimate];
const gamma = cmndf[tauEstimate + 1];
const denom = alpha - 2 * beta + gamma;
if (denom !== 0) {
    tauEstimate += 0.5 * (alpha - gamma) / denom;
}
```
Rumus interpolasi parabolik standar, sesuai dengan deskripsi paper.

---

### 2.6 Langkah 6 — Best Local Estimate (❌ diganti)

**Paper:** untuk tiap titik waktu `t`, cari estimasi dengan nilai `d'(T)` (kualitas)
terendah dalam jendela `[t−Tmax/2, t+Tmax/2]` — bukan median, bukan kontinuitas, tapi
**kualitas estimasi**.

**Kode saat ini (median filter, bukan Langkah 6):**
```js
this.rawFreqHist.push(rawFreq);
if (this.rawFreqHist.length > 21) this.rawFreqHist.shift();
let slice = [...this.rawFreqHist].sort((a, b) => a - b);
freq = slice[Math.floor(slice.length / 2)]; // median 21 frame
```

**Perbedaan kunci:**
- Paper memilih berdasarkan **nilai d' (confidence) terendah** di sekitar titik analisis.
- Kode memilih **nilai tengah (median) statistik** dari 21 frame terakhir, tanpa
  melihat nilai d' masing-masing kandidat.

**Catatan:** keduanya sama-sama bertujuan menstabilkan output, tapi mekanismenya
berbeda secara fundamental. Paper bahkan secara eksplisit membedakan keduanya:
> "Step 6 is reminiscent of median smoothing... but differs in that it... bases
> its choice on quality rather than mere continuity."

---

### 2.7 Band-pass Filter 150–1200 Hz (➕ ekstensi di luar paper)

```js
hpFilter.frequency.value = 150;   // highpass
lpFilter.frequency.value = 1200;  // lowpass
```

Bukan bagian dari algoritma inti YIN. Paper hanya menyebut low-pass prefiltering
sebagai parameter opsional yang diuji pengaruhnya (Fig. 4c), bukan band-pass.
Filter ini ditambahkan sebagai **adaptasi domain spesifik** untuk meredam:
- Noise EMI/EMF pada lini produksi (frekuensi tinggi)
- Noise napas/handling (frekuensi sangat rendah, < 150 Hz)

Sah sebagai keputusan rekayasa, tapi harus dicatat sebagai **ekstensi tambahan**,
bukan bagian dari Langkah 1–6 algoritma YIN asli.

---

### 2.8 Ekstensi Bab VI paper (➖ tidak dipakai — dan ini wajar)

Paper menawarkan model lanjutan: variable amplitude (VI.A), variable F0 (VI.B),
additive noise — DC/periodic/spectrum (VI.C–F). Tidak satupun diimplementasikan
di kode, dan ini **sesuai rekomendasi paper sendiri**:

> "none of these extensions improved error rates, probably because the periodic
> model used by YIN was sufficiently accurate for this task"

Tidak perlu direvisi — cukup disebutkan sebagai justifikasi *kenapa tidak dipakai*.

---

## 3. Daftar Tindakan Revisi (untuk laporan/slide)

- [ ] **Bab Metode**: ganti klaim "implementasi penuh Langkah 1–6" menjadi
      "implementasi inti Langkah 2–5, dengan modifikasi pada Langkah 1 dan 6"
      (lihat kalimat siap pakai di Bagian 1).
- [ ] **Tambahkan sub-bab/paragraf**: *Adaptasi terhadap Algoritma YIN Asli*,
      isi 3 poin:
      1. Windowing non-simetris (Langkah 1) — alasan: simplifikasi implementasi,
         dampak minor pada sinyal stasioner.
      2. Median filtering 21-frame menggantikan Best Local Estimate (Langkah 6)
         — alasan: kebutuhan real-time monitoring tanpa lookahead window
         simetris penuh seperti paper.
      3. Band-pass filter 150–1200 Hz sebagai pre-processing tambahan —
         alasan: mitigasi noise EMI/EMF spesifik lingkungan pabrik PT. YMPI.
- [ ] **Tabel kesesuaian** (lihat Bagian 1) dimasukkan ke laporan sebagai
      bukti transparansi metodologis — auditor/penguji menghargai kejujuran
      ini lebih dari klaim "100% sesuai paper" yang tidak akurat.
- [ ] **Slide presentasi** (slide implementasi pipeline): tandai Langkah 1 dan 6
      dengan badge "Dimodifikasi" agar konsisten dengan laporan tertulis.
- [ ] (Opsional, peningkatan lanjutan) Jika ada waktu sebelum sidang:
      pertimbangkan implementasi Best Local Estimate sesuai paper (pencarian
      berbasis nilai d' terendah dalam window, bukan median) sebagai bagian
      "Saran Pengembangan" atau eksperimen tambahan pembanding akurasi.

---

## 4. Pertanyaan yang Mungkin Diajukan Penguji (latihan)

1. **"Kenapa tidak pakai Best Local Estimate asli dari paper?"**
   → Jawaban: median filtering dipilih karena lebih sederhana diimplementasikan
   untuk monitoring real-time per-frame tanpa perlu menyimpan riwayat nilai d'
   tiap kandidat τ; trade-off-nya adalah median tidak mempertimbangkan kualitas
   sinyal (confidence) saat memilih, hanya posisi statistik dalam jendela waktu.

2. **"Apakah band-pass filter mengubah karakteristik dasar algoritma YIN?"**
   → Jawaban: tidak mengubah Langkah 2–5 (perhitungan inti tetap sama), filter
   hanya membatasi rentang frekuensi sinyal masukan sebelum diproses — analog
   dengan pre-filtering Sec. IV/Fig. 4c paper, hanya saja band-pass bukan
   low-pass.

3. **"Apakah hasil tetap valid secara akademis meski ada modifikasi?"**
   → Jawaban: ya, karena inti matematis (difference function, CMNDF, threshold,
   interpolasi parabolik) — yang menjadi kontribusi utama paper dan penyebab
   utama penurunan error rate (10,0% → 0,78%) — diimplementasikan sesuai
   spesifikasi asli. Modifikasi hanya pada langkah pendukung (windowing,
   smoothing akhir).
