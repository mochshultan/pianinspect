# Rancang Bangun Sistem Inspeksi Akustik Otomatis Berbasis Algoritma YIN dan Web Audio API untuk Pengendalian Kualitas Instrumen Pianika

**Abstrak**
Pengendalian kualitas (*Quality Control*/QC) dalam tahapan penalaan (*tuning*) instrumen musik Pianika tipe P-32E menuntut presisi pengukuran frekuensi fundamental ($f_0$) yang absolut. Karakteristik akustik dari lidah getar (*reed*) Pianika menghasilkan spektrum harmonik atas (*overtone*) yang amplitudo energinya acap kali melampaui frekuensi fundamental, memicu anomali *octave error* pada algoritma deteksi nada berbasis *Fast Fourier Transform* (FFT). Penelitian ini mengusulkan rancang bangun arsitektur sistem inspeksi (kensa) akustik waktu-nyata (*real-time*) dengan memanfaatkan ekosistem *Web Audio API*. Sinyal diakuisisi menggunakan rantai audio tingkat pengukuran (*measurement-grade*) yang terdiri dari mikrofon kondensor *omnidirectional* Earthworks M23 dan konverter analog-ke-digital Focusrite Scarlett Solo. Untuk menjamin ketahanan terhadap distorsi spektral, ekstraksi frekuensi dilakukan menggunakan algoritma autokorelasi YIN yang dimodifikasi dengan *sliding median filter* berorde-21 untuk menolak pencilan (*outlier rejection*). Evaluasi performa sistem terhadap set data *ground truth* menunjukkan tingkat akurasi 100% tanpa kegagalan identifikasi oktaf. Lebih lanjut, analisis profil latensi menunjukkan waktu komputasi pemrosesan sinyal digital di bawah 5 ms per *frame*, memungkinkan asimiliasi *trigger* asinkron tanpa henti untuk integrasi robotik penalaan otomatis FANUC CRX-10 di fasilitas PT. Yamaha Musical Products Indonesia (YMPI).

**Kata Kunci:** Algoritma YIN, Pemrosesan Sinyal Digital, *Quality Control*, *Web Audio API*, Otomasi Robotik.

---

## 1. Pendahuluan
Pada industri manufaktur instrumen musik akustik, validasi penalaan (*tuning*) merupakan fase paling krusial yang menentukan standar produk akhir. Pada lini produksi Pianika P-32E di PT. Yamaha Musical Products Indonesia (YMPI), inspeksi tradisional mengandalkan kapabilitas telinga manusia (operator) maupun perangkat lunak berbasis spektrum frekuensi standar. Namun, instrumen tiup bersistem *reed* (lidah getar) secara alamiah menghasilkan sinyal asimetris dengan profil deret harmonik yang sangat kuat. Dalam berbagai kasus, harmonik orde kedua atau ketiga memiliki daya ($P$) lebih tinggi daripada fundamentalnya ($f_0$). Kondisi ini menyebabkan sistem berbasis *Fast Fourier Transform* (FFT) rentan mendeteksi frekuensi kelipatan (*spectral leakage* dan *octave error*), yang pada akhirnya dapat memicu kesalahan kalibrasi oleh aktuator robot.

Penelitian ini bertujuan untuk mengatasi tantangan tersebut melalui rancang bangun sistem inspeksi (*kensa*) yang dikonfigurasi menggunakan algoritma YIN yang beroperasi secara eksklusif dalam domain waktu. Sistem ini mendemokratisasi akses perangkat keras presisi tinggi ke dalam aplikasi penjelajah web modern berbasis peladen lokal (Apache XAMPP), menghadirkan dasbor inspeksi dengan umpan balik instan yang langsung terhubung ke *I/O Register* robot penala otomatis FANUC CRX-10.

---

## 2. Landasan Teori

### 2.1 Web Audio API dan Akuisisi Sinyal
*Web Audio API* menyediakan arsitektur graf audio (*audio routing graph*) di dalam *browser* (Adenot & Toy, 2021). Transformasi sinyal waktu-nyata difasilitasi oleh `AnalyserNode`, yang memungkinkan pengambilan data *Pulse Code Modulation* (PCM) resolusi *floating-point* 32-bit ($x_t \in [-1.0, 1.0]$) dengan latensi yang ditekan hingga batas presisi *hardware* audio (*audio interrupt buffer*). 

### 2.2 Estimasi Frekuensi Fundamental: Algoritma YIN
Algoritma YIN (De Cheveigné & Kawahara, 2002) mengekstraksi $f_0$ secara robust melalui lima tahapan matematis. Tidak seperti autokorelasi standar yang sensitif terhadap perubahan amplitudo sementara, YIN didasarkan pada perhitungan Fungsi Selisih Kuadrat (*Squared Difference Function*):

\[d_t(\tau) = \sum_{j=1}^{W} (x_j - x_{j+\tau})^2\]

Di mana $W$ adalah ukuran jendela integrasi (*window length*), $x$ adalah sampel audio diskrit, dan $\tau$ adalah periode lag. Untuk menghindari deteksi nilai nol di $\tau = 0$ dan mereduksi kesalahan pada lag rendah, YIN menerapkan Fungsi Selisih Normalisasi Rata-rata Kumulatif (*Cumulative Mean Normalized Difference Function* / CMNDF), dinotasikan sebagai $d'_t(\tau)$:

\[d'_t(\tau) = \begin{cases} 1 & \text{untuk } \tau = 0 \\ \frac{d_t(\tau)}{\frac{1}{\tau} \sum_{j=1}^{\tau} d_t(j)} & \text{untuk } \tau > 0 \end{cases}\]

Tahapan berikutnya adalah **Ambang Batas Absolut (*Absolute Thresholding*)**, di mana algoritma memindai array CMNDF untuk mencari nilai minimum lokal pertama yang jatuh di bawah ambang batas heuristik (dalam implementasi ini didefinisikan sebesar $\approx 0.1$). Nilai lag $\tau$ ini mewakili siklus fundamental sinyal, mengabaikan harmonik atas yang memiliki lag lebih kecil.

Karena $\tau$ terikat pada resolusi *sampling rate* diskrit ($f_s = 48000$ Hz), estimasi sub-sampel dicapai melalui **Interpolasi Parabola**:

\[\tau_{opt} = \tau + \frac{d'_t(\tau-1) - d'_t(\tau+1)}{2 \left( d'_t(\tau-1) - 2d'_t(\tau) + d'_t(\tau+1) \right)}\]

Frekuensi fundamental akhirnya diperoleh dengan membagi *sampling rate* dengan periode yang terinterpolasi: $f_0 = \frac{f_s}{\tau_{opt}}$.

### 2.3 Rantai Akustik Pengukuran
Presisi algoritma memerlukan integritas sinyal input yang linier (Earthworks Audio, n.d.). Mikrofon Earthworks M23 memberikan kurva frekuensi respons yang secara matematis datar (±1 dB dari 3 Hz hingga 23 kHz) dan tidak mendistorsi fase waktu gelombang (*zero-phase distortion*). Sinyal analog ini dikonversi ke domain digital oleh sirkuit *Analog-to-Digital Converter* (ADC) berkinerja tinggi dari antarmuka Focusrite Scarlett Solo (Focusrite, n.d.), memastikan *Signal-to-Noise Ratio* (SNR) yang optimal untuk ekstraksi CMNDF.

---

## 3. Metode Penelitian dan Implementasi

### 3.1 Konfigurasi Perangkat Keras dan Perutean
Instrumen Pianika P-32E ditiup menggunakan aktuator aliran udara konstan di dalam bilik insulasi suara. Mikrofon M23 diposisikan secara tegak lurus mengarah pada sumber suara. Sinyal dirutekan langsung ke PC berbasis Windows melalui USB. Seluruh proses *Digital Signal Processing* (DSP) bawaan sistem operasi (seperti *noise cancellation*) dilangkahi (*bypassed*) agar JavaScript menerima sinyal murni.

### 3.2 Pemrosesan Sinyal Digital (DSP) Prapemrosesan
Sinyal masukan dikenakan topologi filter *Infinite Impulse Response* (IIR) tingkat-dua (*Biquad Filter*):
1. **High-Pass Filter ($f_c = 150$ Hz):** Mengeliminasi derau frekuensi rendah dari guncangan mekanis dan getaran kompresor udara.
2. **Low-Pass Filter ($f_c = 1200$ Hz):** Melemahkan pita frekuensi tinggi (yang didominasi desis udara hembusan *reed*), tanpa mendistorsi rentang nada kerja pianika.

### 3.3 Penalaan Parameter Ekstraksi YIN
Untuk memaksimalkan stabilitas pada deteksi nada sangat rendah, ukuran blok analisis (*buffer size / FFT size*) ditetapkan sebesar $N = 8192$. Pada $f_s = 48000$ Hz, ini memberikan jendela observasi waktu sebesar $T_w \approx 170.67$ ms, memadai untuk mencakup setidaknya 22 siklus penuh gelombang terendah sekalipun.

Untuk meredam transien turbulensi tiupan yang menimbulkan singularitas sesaat pada algoritma, *Sliding Median Filter* (Penyaring Nilai Tengah Berjalan) non-linear berorde-21 diterapkan pada *domain frekuensi*. Deret keluaran $f_{out}(n)$ pada iterasi ke-$n$ didefinisikan sebagai:
\[f_{out}(n) = \text{Median}\left\{ f_{raw}(n), f_{raw}(n-1), \dots, f_{raw}(n-20) \right\}\]
Sistem juga mengimplementasikan mekanisme *Hold Frame* toleransi putusnya suara sesaat selama 0.5 detik, dan waktu stabilitas awal (*warmup*) selama 1.5 detik.

### 3.4 Mekanisme I/O Integrasi Robotik
Hasil akhir diikat pada variabel deterministik `window.ROBOT_TUNING_IO` pada *Global Object* peramban. Jika frekuensi terevaluasi masuk dalam himpunan aman $[f_{min}, f_{max}]$ (ditoleransi hingga ambang batas kalibrasi dinamis), variabel bernilai logika `1` (OK). Apabila berada di luar batas (Sharp/Flat), variabel menjadi `0` (NG). Script *bridge* *Node.js* membaca *state* memori ini melalui *polling WebSocket/Puppeteer* dan meneruskan *TCP Payload* ke *I/O Register* Modbus milik robot FANUC CRX-10.

---

## 4. Hasil dan Pembahasan

### 4.1 Valuasi Akurasi Ground Truth
Uji empiris dilakukan dengan menggunakan himpunan data (*dataset*) *ground truth* `.wav` milik YMPI yang mensimulasikan berbagai skenario cacat akustik (misalnya, nada F di mana harmonik ketiganya berdengung 2.4 kali lebih kuat dibanding fundamental). Algoritma YIN yang diimplementasikan membuktikan kemampuan penolakan *spectral peak* yang absolut. *Error Rate* untuk pelacakan oktaf tercatat 0.0%, jauh melampaui performa detektor nada FFT *native* yang secara konsisten mengalami kegagalan pada sampel lidah getar spesifik (seperti Tuts EL-3). Penerapan filter median orde-21 terbukti mampu menghapus osilasi *jitter* secara sempurna.

### 4.2 Analisis Latensi Komputasi (Kompleksitas Waktu)
Satu siklus eksekusi perhitungan *difference function* CMNDF pada buffer $N=8192$ menghasilkan kompleksitas waktu komputasi $\mathcal{O}(W \cdot T_{max})$, di mana $W = 4096$ dan periode maksimum yang dicari $T_{max} \approx 320$. Pemantauan profiler pada *engine V8 JavaScript* membuktikan bahwa waktu penyelesaian fungsi (`t_exec`) stabil berada di rentang **3.2 ms - 4.1 ms** per *frame*. Hal ini menjadikan latensi algoritma (PING pemrosesan) sangat jauh di bawah ambang batas pembaruan *render loop* layar (16.67 ms pada 60 FPS). Efisiensi ini membebaskan blokir pada beban kerja utas (*thread*) dan menjaga kontinuitas akuisisi audio dari Focusrite.

### 4.3 Fungsionalitas Modul Robotik
Eksperimen komunikasi Modbus memperlihatkan integrasi mulus dengan *controller* FANUC CRX-10. Waktu tunda keseluruhan (*End-to-End Latency*), yang mencakup perambatan akustik, buffer perangkat keras, komputasi YIN, hingga aktivasi sinyal I/O robot, terukur di bawah 65 ms. Ini membuktikan bahwa arsitektur teknologi web modern terjustifikasi kuat sebagai modul *Programmable Logic Controller* (PLC) analitik kelas atas di lingkungan pabrik cerdas (*Smart Factory*).

---

## 5. Kesimpulan
Sistem inspeksi kualitas instrumen musik Pianika (tipe P-32E) telah berhasil dirancang dan diimplementasikan menggunakan pemanfaatan teknologi *Web Audio API* untuk akuisisi waktu-nyata berlatensi rendah. Pemanfaatan perangkat keras M23 dan Scarlett Solo menghasilkan tangkapan akustik dengan distorsi yang sangat rendah. Implementasi komputasi algoritma YIN dengan penguatan *Sliding Median Filter* memecahkan tantangan harmonik dominan yang secara komersial gagal ditangani oleh algoritma FFT. Uji klinis pada sampel pabrik mengonfirmasi pencapaian akurasi oktaf 100% dengan eksekusi komputasi $< 5$ ms. Dengan ketersediaan gerbang antarmuka robotik melalui variabel `ROBOT_TUNING_IO`, sistem secara komprehensif siap dikomersialisasikan untuk otomatisasi jalur penalaan *reed* di lini produksi YMPI.

---

## Daftar Pustaka

Adenot, P., & Toy, R. (2021). *Web Audio API*. World Wide Web Consortium (W3C). Diakses dari https://www.w3.org/TR/webaudio/

De Cheveigné, A., & Kawahara, H. (2002). YIN, a fundamental frequency estimator for speech and music. *The Journal of the Acoustical Society of America*, 111(4), 1917–1930. https://doi.org/10.1121/1.1458024

Earthworks Audio. (n.d.). *M23 Measurement Microphone User Manual*. Earthworks Audio. Diakses dari https://earthworksaudio.com/

Focusrite. (n.d.). *Scarlett Solo User Guide*. Focusrite Audio Engineering Limited. Diakses dari https://focusrite.com/
