/*
 ================================================================================
   PIANIKA SOUND QC SYSTEM — P-32E Web Version
 ================================================================================
*/

const MODEL_KEY = "pianika_model_v2";

//  Valid model identifiers: P32-E-EL3 | P32-E-EL4
const VALID_MODELS = ["P32-E-EL3", "P32-E-EL4"];
const DEFAULT_MODEL = "P32-E-EL3";

// Map model id → JSON filename
const MODEL_JSON_FILE = {
    "P32-E-EL3": "P32E_EL3.json",
    "P32-E-EL4": "P32E_EL4.json",
};

// Per-model localStorage keys
const RULES_KEYS = {
    "P32-E-EL3": "pianika_rules_v2_p32_el3",
    "P32-E-EL4": "pianika_rules_v2_p32_el4",
};

//  DEFAULT CALIBRATION RULES — per-model
const INSPECTION_RULES_DEFAULT = {
    "P32-E-EL3": [
        [1, "F", 176.3, 176, 176.6],
        [2, "F#", 186.25, 186.2, 186.3],
        [3, "G", 197.2, 197.1, 197.3],
        [4, "G#", 208.95, 208.7, 209.2],
        [5, "A", 221.45, 221.4, 221.5],
        [6, "A#", 234.5, 234.4, 234.6],
        [7, "B", 248.5, 248.4, 248.6],
        [8, "C'", 263.25, 263.1, 263.4],
        [9, "C#'", 279.7, 279.2, 280.2],
        [10, "D'", 296.05, 295.5, 296.6],
        [11, "D#'", 313.65, 313.1, 314.2],
        [12, "E'", 332.4, 331.9, 332.9],
        [13, "F'", 351.6, 351.1, 352.1],
        [14, "F#'", 372.2, 372.1, 372.3],
        [15, "G'", 394.4, 394.3, 394.5],
        [16, "G#'", 417.85, 417.7, 418],
        [17, "A'", 442.7, 442.5, 442.9],
        [18, "A#'", 468.7, 468.6, 468.8],
        [19, "B'", 497, 496.7, 497.3],
        [20, "C''", 526.5, 526.1, 526.9],
        [21, "C#''", 557.65, 557.5, 557.8],
        [22, "D''", 590.7, 590.5, 590.9],
        [23, "D#''", 624.4, 623.3, 625.5],
        [24, "E''", 662.65, 662.5, 662.8],
        [25, "F''", 701.6, 701.1, 702.1],
        [26, "F#''", 743.95, 743.4, 744.5],
        [27, "G''", 788.15, 787.9, 788.4],
        [28, "G#''", 835.1, 835, 835.2],
        [29, "A''", 884.8, 884.1, 885.5],
        [30, "A#''", 937.65, 937.15, 938.15],
        [31, "B''", 993.25, 993, 993.5],
        [32, "C'''", 1051.95, 1051.45, 1052.45]
    ],
    "P32-E-EL4": [
        [1, "F", 175.6, 175.4, 176.01],
        [2, "F#", 185.95, 185.84, 186.27],
        [3, "G", 197.0, 196.89, 197.35],
        [4, "G#", 208.71, 208.59, 209.07],
        [5, "A", 221.13, 221.0, 221.51],
        [6, "A#", 234.28, 234.14, 234.68],
        [7, "B", 248.2, 248.06, 248.63],
        [8, "C'", 262.97, 262.82, 263.43],
        [9, "C#'", 278.6, 278.44, 279.08],
        [10, "D'", 295.51, 295.0, 296.2],
        [11, "D#'", 313.72, 313.54, 314.27],
        [12, "E'", 331.51, 331.13, 332.28],
        [13, "F'", 351.23, 350.82, 352.04],
        [14, "F#'", 371.88, 371.67, 372.53],
        [15, "G'", 394.01, 393.78, 394.69],
        [16, "G#'", 417.44, 417.2, 418.16],
        [17, "A'", 442.26, 442.0, 443.02],
        [18, "A#'", 468.55, 468.28, 469.36],
        [19, "B'", 496.41, 496.12, 497.27],
        [20, "C''", 525.93, 525.63, 526.85],
        [21, "C#''", 557.21, 556.89, 558.18],
        [22, "D''", 590.34, 590.0, 591.36],
        [23, "D#''", 625.44, 625.08, 626.16],
        [24, "E''", 662.63, 662.25, 663.4],
        [25, "F''", 702.04, 701.63, 702.85],
        [26, "F#''", 743.78, 743.35, 745.07],
        [27, "G''", 788.0, 787.55, 789.37],
        [28, "G#''", 834.87, 834.39, 836.32],
        [29, "A''", 884.51, 884.0, 886.04],
        [30, "A#''", 937.11, 936.57, 938.74],
        [31, "B''", 992.83, 992.26, 994.55],
        [32, "C'''", 1051.87, 1051.26, 1053.69]
    ]
};

// ──────────────────────────────────────────────────────────
//  Persistence helpers
// ──────────────────────────────────────────────────────────
function loadModel() {
    try {
        const m = localStorage.getItem(MODEL_KEY);
        if (VALID_MODELS.includes(m)) return m;
    } catch (e) { }
    return DEFAULT_MODEL;
}
function saveModel(model) {
    try { localStorage.setItem(MODEL_KEY, model); } catch (e) { }
}

function loadRules(model) {
    const key = RULES_KEYS[model];
    if (!key) return JSON.parse(JSON.stringify(INSPECTION_RULES_DEFAULT[DEFAULT_MODEL]));
    try {
        const item = localStorage.getItem(key);
        if (item) return JSON.parse(item);
    } catch (e) { console.error(e); }
    return JSON.parse(JSON.stringify(INSPECTION_RULES_DEFAULT[model]));
}
function saveRules(rules, model) {
    const key = RULES_KEYS[model];
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(rules)); } catch (e) { console.error(e); }
}

const SETTINGS_KEY = "pianika_settings_v1";
function loadSettings() {
    let def = { minRms: 0.009, minConf: 0.06 };
    try {
        const item = localStorage.getItem(SETTINGS_KEY);
        if (item) return { ...def, ...JSON.parse(item) };
    } catch (e) { }
    return def;
}
function saveSettings(settings) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { }
}

// ──────────────────────────────────────────────────────────
//  Canvas color palette
// ──────────────────────────────────────────────────────────
const COLORS = {
    bg: '#F0EFF8', surface: '#FFFFFF', purple: '#7C3AED', purpleLt: '#EDE9FE',
    purpleDk: '#5B21B6', green: '#10B981', greenLt: '#99f4c9ff', red: '#DC2626', redLt: '#FEE2E2',
    alert: '#DC2626',
    whiteText: '#f8f8f8ff', text: '#1E1B4B', muted: '#6B7280', border: '#E8E4F8', amber: '#F59E0B'
};

// ──────────────────────────────────────────────────────────
//  Audio Engine Parameters
//  @60fps: WARMUP=30f=0.5s stabilisasi, INSP=5f=0.08s cek hasil
// ──────────────────────────────────────────────────────────
// MATCH_CENTS: radius identifikasi nada (bukan batas NG/OK — itu dari fmin/fmax JSON)
// Nada NG (freq di luar fmin/fmax) pun masih ter-match, verdict tetap dari toleransi JSON
const MATCH_CENTS = 40;  // Toleransi awal ±40 ¢ untuk kuncian super kuat di awal tiupan
const HOLD_F = 30;       // Tahan kuncian hingga 0.5 detik meski suara tiba-tiba hilang/pecah
const WARMUP_F = 90;     // Stabilisasi 1.5 detik
const INSP_F = 30;       // Evaluasi akhir memakai 30 frame (0.5 detik penuh) untuk verdict
const OK_TIGHT = 0.5;  
// TOTAL waktu hingga verdict = WARMUP_F + INSP_F

// ──────────────────────────────────────────────────────────
// Komunikasi Perangkat Luar (I/O Register Robot FANUC CRX-10)
// 1/High = OK (Aman)
// 0/Low  = NG (Robot melakukan tuning reed)
// ──────────────────────────────────────────────────────────
window.ROBOT_TUNING_IO = 1;

function cents(f1, f2) {
    return (f1 > 0 && f2 > 0) ? 1200 * Math.log2(f1 / f2) : 9999.0;
}

// ──────────────────────────────────────────────────────────
//  AudioEngine
// ──────────────────────────────────────────────────────────
class AudioEngine {
    constructor(rules, settings, callback) {
        this.rules = rules;
        this.settings = settings;
        this.callback = callback;
        this.run = false;
        this.audioCtx = null;
        this.analyser = null;
        this.mediaStream = null;
        this.inputMode = 'mic';
        this.wavBuffer = null;
        this.wavSourceNode = null;
        this.wavOutputGain = null;

        this.hold = {};
        this.accum = {};
        this.done = new Set();
        this.freqHist = {};
    }

    reset() {
        this.hold = {};
        this.accum = {};
        this.done = new Set();
        this.freqHist = {};
    }

    setWavBuffer(buffer) {
        this.wavBuffer = buffer || null;
        this.inputMode = this.wavBuffer ? 'wav' : 'mic';
    }

    async start() {
        try {
            // Target the same 48 kHz path used by the recorder hardware setup.
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });

            const hpFilter = this.audioCtx.createBiquadFilter();
            hpFilter.type = 'highpass';
            hpFilter.frequency.value = 150;

            const lpFilter = this.audioCtx.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.value = 1200;

            this.analyser = this.audioCtx.createAnalyser();
            // Buffer 8192 (~170ms). Resolusi waktu maksimum yang sangat aman dan stabil untuk YIN.
            this.analyser.fftSize = 8192;
            this.analyser.smoothingTimeConstant = 0.85; // Sedikit lebih halus

            let source;
            if (this.inputMode === 'wav') {
                if (!this.wavBuffer) {
                    throw new Error('No recorded WAV file loaded.');
                }
                source = this.audioCtx.createBufferSource();
                source.buffer = this.wavBuffer;
                source.loop = true;
                this.wavSourceNode = source;

                const playbackGain = this.audioCtx.createGain();
                playbackGain.gain.value = 1.0;
                this.wavOutputGain = playbackGain;

                source.connect(playbackGain);
                playbackGain.connect(this.audioCtx.destination);
                source.start(0);
            } else {
                this.mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false
                    }
                });
                source = this.audioCtx.createMediaStreamSource(this.mediaStream);
            }

            source.connect(hpFilter);
            hpFilter.connect(lpFilter);
            lpFilter.connect(this.analyser);

            this.run = true;
            this.timeData = new Float32Array(this.analyser.fftSize);
            this.freqData = new Float32Array(this.analyser.frequencyBinCount);

            this.loop();
        } catch (e) {
            alert("Microphone access denied or error: " + e.message);
        }
    }

    stop() {
        this.run = false;
        if (this.wavSourceNode) {
            try { this.wavSourceNode.stop(); } catch (e) { }
            this.wavSourceNode.disconnect();
            this.wavSourceNode = null;
        }
        if (this.wavOutputGain) {
            this.wavOutputGain.disconnect();
            this.wavOutputGain = null;
        }
        if (this.audioCtx) this.audioCtx.close();
        this.audioCtx = null;
        if (this.mediaStream) this.mediaStream.getTracks().forEach(t => t.stop());
        this.mediaStream = null;
    }

    estimateFreq() {
        this.analyser.getFloatTimeDomainData(this.timeData);
        let sumSquares = 0;
        const tLen = this.timeData.length;
        for (let i = 0; i < tLen; i++) {
            sumSquares += this.timeData[i] * this.timeData[i];
        }
        let rms = Math.sqrt(sumSquares / tLen);
        if (rms < this.settings.minRms) return { freq: -1, conf: 0, rms };

        // YIN Autocorrelation Algorithm
        const sampleRate = this.audioCtx.sampleRate;
        const threshold = 0.1;
        const bufferSize = this.timeData.length;
        const wLen = Math.floor(bufferSize / 2);
        const tMax = Math.min(wLen, Math.floor(sampleRate / 150.0));
        const tMin = Math.floor(sampleRate / 1200.0);
        
        // --- LANGKAH 1 & 2: Windowing & Difference Function ---
        // Catatan: Windowing disederhanakan (non-simetris) untuk efisiensi komputasi
        const df = new Float32Array(tMax);
        for (let tau = 1; tau < tMax; tau++) {
            for (let i = 0; i < wLen; i++) {
                const diff = this.timeData[i] - this.timeData[i + tau];
                df[tau] += diff * diff;
            }
        }
        
        // --- LANGKAH 3: Cumulative Mean Normalized Difference Function (CMNDF) ---
        const cmndf = new Float32Array(tMax);
        cmndf[0] = 1.0;
        let runningSum = 0.0;
        for (let tau = 1; tau < tMax; tau++) {
            runningSum += df[tau];
            cmndf[tau] = runningSum === 0 ? 1.0 : (df[tau] * tau) / runningSum;
        }
        
        // --- LANGKAH 4: Absolute Threshold ---
        let tauEstimate = -1;
        for (let tau = tMin; tau < tMax; tau++) {
            if (cmndf[tau] < threshold) {
                while (tau + 1 < tMax && cmndf[tau + 1] < cmndf[tau]) {
                    tau++;
                }
                tauEstimate = tau;
                break;
            }
        }
        
        // Fallback ke minimum global jika tidak ada yang memenuhi threshold
        if (tauEstimate === -1) {
            let minVal = Infinity;
            for (let tau = tMin; tau < tMax; tau++) {
                if (cmndf[tau] < minVal) {
                    minVal = cmndf[tau];
                    tauEstimate = tau;
                }
            }
        }
        
        let conf = 1.0 - cmndf[tauEstimate];
        if (conf < 0) conf = 0;

        // --- LANGKAH 5: Parabolic Interpolation ---
        if (tauEstimate > 0 && tauEstimate < tMax - 1) {
            const alpha = cmndf[tauEstimate - 1];
            const beta = cmndf[tauEstimate];
            const gamma = cmndf[tauEstimate + 1];
            const denom = alpha - 2 * beta + gamma;
            if (denom !== 0) {
                tauEstimate += 0.5 * (alpha - gamma) / denom;
            }
        }
        
        // Konversi ke frekuensi
        const freq = sampleRate / tauEstimate;

        return { freq: freq, conf: conf, rms };
    }

    loop() {
        if (!this.run) return;

        let { freq: rawFreq, conf, rms } = this.estimateFreq();

        // --- LANGKAH 6 YIN: BEST LOCAL ESTIMATE ---
        // Menggantikan Sliding Median Filter dengan implementasi sesuai paper YIN,
        // yaitu memilih estimasi dengan nilai d' terendah (confidence tertinggi)
        // dalam jendela waktu (21 frame).
        let freq = rawFreq;
        if (rawFreq > 0) {
            if (!this.rawFreqHist) this.rawFreqHist = [];
            this.rawFreqHist.push({ freq: rawFreq, conf: conf });
            // Simpan 21 frame terakhir (~350ms)
            if (this.rawFreqHist.length > 21) this.rawFreqHist.shift(); 
            
            // Cari frame dengan confidence tertinggi (kualitas terbaik) di dalam window
            let bestFrame = this.rawFreqHist[0];
            for (let i = 1; i < this.rawFreqHist.length; i++) {
                if (this.rawFreqHist[i].conf > bestFrame.conf) {
                    bestFrame = this.rawFreqHist[i];
                }
            }
            freq = bestFrame.freq;
        } else {
            this.rawFreqHist = [];
        }
        // ----------------------------------------------------

        // Nearest-neighbor matching dalam ±MATCH_CENTS
        // → nada NG (freq di luar fmin/fmax) tetap ter-match; verdict ditentukan oleh fmin/fmax
        let matched = null;
        let best = MATCH_CENTS;
        let rules = this.rules;

        if (freq > 0 && conf >= this.settings.minConf) {
            for (let r of rules) {
                let c = Math.abs(cents(freq, r[2]));
                if (c < best) { best = c; matched = r; }
            }
        }

        for (let r of rules) {
            let n = r[0];
            if (matched && n === matched[0]) {
                this.hold[n] = HOLD_F;
                this.accum[n] = (this.accum[n] || 0) + 1;
                if (!this.freqHist[n]) this.freqHist[n] = [];
                if (this.accum[n] > WARMUP_F) {
                    this.freqHist[n].push(freq);
                }
            } else {
                this.hold[n] = Math.max(0, (this.hold[n] || 0) - 1);
                if (this.hold[n] === 0) {
                    this.accum[n] = 0;
                    this.done.delete(n);
                    delete this.freqHist[n];
                }
            }
        }

        let ve = null;
        if (matched) {
            let n = matched[0];
            // Verdict dipicu setelah WARMUP_F (stabilisasi) + INSP_F (inspection window)
            if (this.accum[n] >= WARMUP_F + INSP_F && !this.done.has(n)) {
                this.done.add(n);
                let note = matched[1], fok = matched[2], fmin = matched[3], fmax = matched[4];
                let hist = this.freqHist[n] || [freq];
                let validHist = hist.filter(x => x > 0);

                // Median dari INSP_F sample terakhir (sudah melewati warmup)
                let smoothFreq = freq;
                if (validHist.length > 0) {
                    let slice = validHist.slice(-INSP_F).sort((a, b) => a - b);
                    let mid = Math.floor(slice.length / 2);
                    smoothFreq = slice.length % 2 !== 0 ? slice[mid] : (slice[mid - 1] + slice[mid]) / 2;
                }

                let v = "OK", rsn = "";
                if (smoothFreq < 0 || conf < this.settings.minConf) { v = "NG"; rsn = "LOW_CONF"; }
                else if (smoothFreq >= fmin && smoothFreq <= fmax) { v = "OK"; rsn = ""; }
                else { v = "NG"; rsn = smoothFreq > fmax ? "SHARP" : "FLAT"; }

                ve = {
                    pn_no: n, pn_note: note, freq_detected: Math.round(smoothFreq * 1000) / 1000,
                    freq_ok: fok, freq_min: fmin, freq_max: fmax, verdict: v, reason: rsn
                };

                // Update variable I/O untuk dibaca oleh perangkat luar / Robot
                // Jika nada tersebut NG, maka trigger 0 (Low) agar robot melakukan tuning.
                // Jika OK, pastikan nilainya 1 (High).
                window.ROBOT_TUNING_IO = (v === "NG") ? 0 : 1;
            }
        }

        let pressed = new Set();
        for (let r of rules) {
            if (this.hold[r[0]] > 0) pressed.add(r[0]);
        }

        this.callback({
            freq: freq > 0 ? freq : 0.0,
            conf: conf,
            rms: rms,
            pressed: pressed,
            matched: matched ? matched[0] : null,
            verdict_event: ve
        });

        requestAnimationFrame(() => this.loop());
    }
}

// ══════════════════════════════════════════════════════════
//  App
// ══════════════════════════════════════════════════════════
class App {
    constructor() {
        this.modelType = loadModel();  // "P32-E-EL3" | "P32-E-EL4"
        this.rules = loadRules(this.modelType);
        this.settings = loadSettings();
        this.results = {};
        this.isRunning = false;
        this.pressed = new Set();
        this.matched = null;

        this.dFreq = 0; this.dConf = 0; this.dRms = 0;
        this.dDelta = 0; this.dCents = 0; this.dNote = "—"; this.dState = "idle";

        this._lastDialState = "";
        this._lastPianoState = "";

        this.font = "Inter";
        this.engine = new AudioEngine(this.rules, this.settings, (data) => this.handleData(data));

        this.initDOM();
        this.setupListeners();
        this.applyModelUI();           // apply title / badge from saved model

        // Debounced resize handler — prevents canvas flicker on rapid resize
        let _resizeTimer = null;
        window.addEventListener('resize', () => {
            if (_resizeTimer) clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => {
                this.resizeCanvases();
                this._lastDialState = "";   // force full redraw after resize
                this._lastPianoState = "";
                this.drawDial();
                this.drawPiano();
            }, 60);
        });
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    }

    // ── Helpers ────────────────────────────────────────────
    setText(el, txt) { if (el.innerText !== txt) el.innerText = txt; }
    setClass(el, cls) { if (el.className !== cls) el.className = cls; }

    // ── DOM Init ───────────────────────────────────────────
    initDOM() {
        this.dialCanvas = document.getElementById('dialCanvas');
        this.dialCtx = this.dialCanvas.getContext('2d');
        this.pianoCanvas = document.getElementById('pianoCanvas');
        this.pianoCtx = this.pianoCanvas.getContext('2d');

        this.lblOvr = document.getElementById('lbl-ovr');
        this.ovrStatus = document.getElementById('ovr-status');
        this.btnStart = document.getElementById('btn-start');
        this.btnReset = document.getElementById('btn-reset');
        this.btnResetSession = document.getElementById('btn-reset-session');

        this.tallyOk = document.getElementById('tally-ok');
        this.tallyNg = document.getElementById('tally-ng');
        this.tallyRem = document.getElementById('tally-rem');
        this.tallyOvr = document.getElementById('tally-ovr');

        this.vpNote = document.getElementById('vp-note');
        this.vpBadge = document.getElementById('vp-badge');
        this.vpHz = document.getElementById('vp-hz');
        this.vpFmin = document.getElementById('vp-fmin');
        this.vpFok = document.getElementById('vp-fok');
        this.vpFmax = document.getElementById('vp-fmax');
        this.vpRms = document.getElementById('vp-rms');
        this.vpConf = document.getElementById('vp-conf');
        this.verdictHero = document.getElementById('verdict-hero');
        this.vpResultBanner = document.getElementById('vp-result-banner');
        this.vpResultTxt = document.getElementById('vp-result-txt');

        this.dNodeTxt = document.getElementById('dial-note');
        this.dNodeHz = document.getElementById('dial-hz');
        this.dNodeBadge = document.getElementById('dial-badge');

        // Model title di topbar (tidak ada badge/dropdown lagi)
        this.btnPower = document.getElementById('btn-power');
        this.btnLoadWav = document.getElementById('btn-load-wav');
        this.btnUseMic = document.getElementById('btn-load-wav-mic');
        this.wavCurrentStatus = document.getElementById('wav-current-status');
        this.loadWavStatus = document.getElementById('load-wav-status');
        this.loadWavList = document.getElementById('load-wav-list');
        this.sampleTabRow = document.getElementById('sample-tab-row');

        // Recommendation areas
        this.recL = document.getElementById('verdict-recomend-l');
        this.recR = document.getElementById('verdict-recomend-r');

        // ── Auto-Calibration DOM ──
        this.btnACPanel = document.getElementById('btn-autocal-open');
        this.modalAC = document.getElementById('modal-autocal');
        this.acStatus = document.getElementById('autocal-status');
        this.acPhaseLabel = document.getElementById('ac-phase-label');
        this.acRMSVal = document.getElementById('ac-rms-val');
        this.acRMSPeak = document.getElementById('ac-rms-peak');
        this.acRMSSig = document.getElementById('ac-rms-sig');
        this.acConfVal = document.getElementById('ac-conf-val');
        this.acConfMin = document.getElementById('ac-conf-min');
        this.acConfAvg = document.getElementById('ac-conf-avg');
        this.acCommand = document.getElementById('ac-command');
        this.acTimer = document.getElementById('ac-timer');
        this.acProgress = document.getElementById('ac-progress');

        // Result row
        this.acResFloor = document.getElementById('ac-res-floor');
        this.acResSignal = document.getElementById('ac-res-signal');
        this.acResSNR = document.getElementById('ac-res-snr');
        this.acResRms = document.getElementById('ac-res-rms');
        this.acResConf = document.getElementById('ac-res-conf');
        this.acResStatus = document.getElementById('ac-res-status');
        this.acWarnMsg = document.getElementById('ac-warn-msg');

        this.btnACStart1 = document.getElementById('btn-ac-start-phase1');
        this.btnACStop1 = document.getElementById('btn-ac-stop-phase1');
        this.btnACStart2 = document.getElementById('btn-ac-start-phase2');
        this.btnACSave = document.getElementById('btn-ac-save');
        this.btnACClose = document.getElementById('btn-ac-close');

        // ── Calibration State ──
        this.acState = 'idle';
        this.acData = { p1_rms: [], p2_rms: [], p2_conf: [] };
        this.acSuggested = { rms: 0, conf: 0 };
    }

    resizeCanvases() {
        // Dial canvas
        if (this.dialCanvas.parentElement) {
            const r = this.dialCanvas.parentElement.getBoundingClientRect();
            const w = Math.floor(r.width);
            const h = Math.floor(r.height);
            if (w > 0 && h > 0) {
                this.dialCanvas.width = w;
                this.dialCanvas.height = h;
            }
        }
        // Piano canvas — read parent's rendered size, cap height to prevent infinity
        if (this.pianoCanvas.parentElement) {
            const r = this.pianoCanvas.parentElement.getBoundingClientRect();
            const w = Math.floor(r.width);
            const raw = Math.floor(r.height);
            // Fallback: if parent height is 0 or unreasonably large, use offsetHeight or a safe default
            const h = (raw > 10 && raw < 600) ? raw
                : (this.pianoCanvas.parentElement.offsetHeight > 10 ? this.pianoCanvas.parentElement.offsetHeight : 160);
            if (w > 0) {
                this.pianoCanvas.width = w;
                this.pianoCanvas.height = h;
            }
        }
        // Force redraw after resize by busting the cache
        this._lastDialState = '';
        this._lastPianoState = '';
    }

    // ── Listeners ──────────────────────────────────────────
    setupListeners() {
        this.btnStart.addEventListener('click', () => this.toggleStart());
        this.btnReset.addEventListener('click', () => this.resetSession());
        if (this.btnResetSession) this.btnResetSession.addEventListener('click', () => this.resetSession());
        this.btnPower.addEventListener('click', () => this.toggleStart());

        // Auto-Calibration
        this.btnLoadWav.addEventListener('click', () => this.openLoadWavModal());
        this.btnUseMic.addEventListener('click', () => this.useMicInput());
        document.getElementById('btn-load-wav-close').addEventListener('click', () => this.closeLoadWavModal());
        this.sampleTabRow.addEventListener('click', (e) => {
            const btn = e.target.closest('.sample-tab-btn');
            if (!btn) return;
            this.loadWavFiles(btn.dataset.folder);
        });

        this.btnACPanel.addEventListener('click', () => this.openAutoCal());
        this.btnACStart1.addEventListener('click', () => this.startACPhase1());
        this.btnACStop1.addEventListener('click', () => this.stopACPhase1());
        this.btnACStart2.addEventListener('click', () => this.startACPhase2());
        this.btnACSave.addEventListener('click', () => this.saveACResults());
        this.btnACClose.addEventListener('click', () => this.closeAutoCal());

        // Model quick-select buttons (4 tombol di topbar)
        document.querySelectorAll('.model-qbtn').forEach(btn => {
            btn.addEventListener('click', () => {
                const model = btn.getAttribute('data-model');
                this.switchModel(model);
            });
        });

        // Calibration modal
        document.getElementById('btn-cal-main').addEventListener('click', () => this.openModal('modal-cal'));
        document.getElementById('btn-open-log').addEventListener('click', () => {
            this.openModal('modal-log');
            this.populateLog();
        });
        document.getElementById('btn-cal-cancel').addEventListener('click', () => this.closeModal('modal-cal'));
        document.getElementById('btn-cal-save').addEventListener('click', () => this.saveCal());
        document.getElementById('btn-cal-reset').addEventListener('click', () => {
            if (confirm("Reset rule kalibrasi ke nilai bawaan pabrik?")) {
                this.resetCal();
            }
        });
        document.getElementById('btn-cal-import').addEventListener('click', () => this.importCal());
        document.getElementById('btn-cal-export').addEventListener('click', () => this.exportCal());
        document.getElementById('inp-cal-file').addEventListener('change', (e) => this.handleImportCal(e));
        document.getElementById('btn-log-close').addEventListener('click', () => this.closeModal('modal-log'));

        this.populateCal();
        this.updateVerdictDOM();
    }

    openModal(id) { document.getElementById(id).classList.remove('hidden'); }
    closeModal(id) { document.getElementById(id).classList.add('hidden'); }

    openLoadWavModal() {
        this.loadWavFiles('el3');
        this.openModal('modal-load-wav');
    }

    useMicInput() {
        this.engine.setWavBuffer(null);
        this.loadWavStatus.textContent = 'Input diatur kembali ke microphone default.';
        this.wavCurrentStatus.textContent = 'INPUT: MIC (live)';
        this.closeLoadWavModal();
        this.lblOvr.textContent = 'MIC INPUT READY';
        this.ovrStatus.className = 'status-box waiting';
    }

    closeLoadWavModal() {
        this.closeModal('modal-load-wav');
    }

    async loadWavFiles(folder = 'el3') {
        this.currentWavFolder = folder;
        this.sampleTabRow.querySelectorAll('.sample-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.folder === folder);
        });

        this.loadWavStatus.textContent = `Memuat file WAV dari folder ${folder.toUpperCase()}...`;
        this.wavCurrentStatus.textContent = `LOADING WAV: ${folder.toUpperCase()}...`;
        this.loadWavList.innerHTML = '<div class="sample-status">Loading...</div>';

        try {
            const response = await fetch(`../sample/${folder}/`);
            const text = await response.text();
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const entries = Array.from(doc.querySelectorAll('tr'))
                .map(row => {
                    const link = row.querySelector('a[href]');
                    if (!link) return null;
                    const href = decodeURIComponent(link.getAttribute('href'));
                    if (!href.toLowerCase().endsWith('.wav')) return null;
                    const cells = Array.from(row.querySelectorAll('td'));
                    const modifiedText = cells[2]?.textContent.trim() || '';
                    const modifiedAt = (() => {
                        const m = modifiedText.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
                        return m ? Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00`) : 0;
                    })();
                    const keyMatch = href.match(/key[^_]*\((\d+)\)/i);
                    const keyNumber = keyMatch ? parseInt(keyMatch[1], 10) : Number.MAX_SAFE_INTEGER;
                    return { file: href.split('/').pop(), modifiedAt, keyNumber };
                })
                .filter(Boolean)
                .sort((a, b) => a.keyNumber - b.keyNumber || (b.modifiedAt || 0) - (a.modifiedAt || 0));
            const files = entries.map(item => item.file);

            if (!files.length) {
                this.loadWavList.innerHTML = '<div class="sample-status">Belum ada file WAV di folder ini.</div>';
                return;
            }

            this.loadWavList.innerHTML = '';
            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'sample-file-item';
                item.innerHTML = `<span class="sample-file-name">${file}</span>`;
                const btn = document.createElement('button');
                btn.className = 'btn btn-dark';
                btn.type = 'button';
                btn.textContent = 'LOAD';
                btn.addEventListener('click', async () => {
                    await this.loadWavFile(folder, file);
                });
                item.appendChild(btn);
                this.loadWavList.appendChild(item);
            });
        } catch (e) {
            console.error(e);
            this.loadWavList.innerHTML = '<div class="sample-status">Gagal memuat daftar WAV.</div>';
        }
    }

    async loadWavFile(folder, file) {
        try {
            const url = `../sample/${folder}/${encodeURIComponent(file)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch WAV file');

            const arrayBuffer = await response.arrayBuffer();
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
            await ctx.close();

            this.engine.setWavBuffer(decoded);
            this.loadWavStatus.textContent = `Loaded WAV: ${folder.toUpperCase()} / ${file}`;
            this.wavCurrentStatus.textContent = `WAV: ${folder.toUpperCase()} / ${file}`;
            this.closeLoadWavModal();
            this.lblOvr.textContent = 'WAV INPUT READY';
            this.ovrStatus.className = 'status-box waiting';
        } catch (e) {
            console.error(e);
            alert('Tidak bisa memuat file WAV dari folder sample.');
        }
    }

    isBlack(note) { return note.includes("#"); }

    // ── Model Switching ────────────────────────────────────
    switchModel(type) {
        if (!VALID_MODELS.includes(type)) return;
        if (type === this.modelType) return;

        const wasRunning = this.isRunning;
        if (wasRunning) {
            this.engine.stop();
            this.isRunning = false;
        }

        this.modelType = type;
        saveModel(type);
        this.rules = loadRules(type);

        this.engine.rules = this.rules;
        this.engine.reset();

        this.results = {};
        this.pressed = new Set();
        this.matched = null;
        this.dDelta = 0; this.dNote = "—"; this.dState = "idle";
        this.dFreq = 0; this.dConf = 0; this.dRms = 0;

        // Invalidate render cache so canvas redraws with new key layout
        this._lastPianoState = "";
        this._lastDialState = "";

        this.applyModelUI();
        this.populateCal();

        // Resize first so canvas dimensions match the parent element
        this.resizeCanvases();
        this.drawPiano();
        this.drawDial();
        this.updateVerdictDOM();
        this.updateTallyReset();

        this.btnStart.innerHTML = "▶ START";
        this.btnStart.className = "btn btn-green";
        this.lblOvr.innerText = "WAITING TO START";
        this.ovrStatus.className = "status-box waiting";

        if (wasRunning) {
            this.isRunning = true;
            this.engine.start();
            this.btnStart.innerHTML = "■ STOP";
            this.btnStart.className = "btn btn-red";
            this.lblOvr.innerText = `IN PROGRESS 0/${this.rules.length}`;
            this.ovrStatus.className = "status-box in-progress";
        }
    }

    applyModelUI() {
        const n = this.rules.length;
        const lot = this.modelType.endsWith('EL4') ? 'EL4' : 'EL3';
        // Update topbar title
        document.getElementById('topbar-model-title').innerText = `P32-E QC`;
        // Update active state on 4 quick-select buttons
        document.querySelectorAll('.model-qbtn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-model') === this.modelType);
        });
        // Update modal log header
        const logTitle = document.getElementById('log-title');
        if (logTitle) logTitle.innerText = `INSPECTION LOG / ${this.modelType}`;
        // Update JSON filename label in calibration modal
        const jsonLabel = document.getElementById('cal-json-filename');
        if (jsonLabel) jsonLabel.innerText = MODEL_JSON_FILE[this.modelType] || this.modelType;
        // Tally REM
        this.tallyRem.innerText = n;
        this.tallyRem.className = "tally-val text-muted";
        this.tallyOk.innerText = "0"; this.tallyOk.className = "tally-val text-muted";
        this.tallyNg.innerText = "0"; this.tallyNg.className = "tally-val text-muted";
        this.tallyOvr.innerText = "—"; this.tallyOvr.className = "tally-val text-muted";
    }

    updateTallyReset() {
        const n = this.rules.length;
        this.tallyOk.innerText = "0"; this.tallyOk.className = "tally-val text-muted";
        this.tallyNg.innerText = "0"; this.tallyNg.className = "tally-val text-muted";
        this.tallyRem.innerText = n; this.tallyRem.className = "tally-val text-muted";
        this.tallyOvr.innerText = "—"; this.tallyOvr.className = "tally-val text-muted";
    }

    // ── Audio Data Handler ─────────────────────────────────
    handleData(d) {
        this.dFreq = d.freq; this.dConf = d.conf; this.dRms = d.rms;

        let mr = null;
        if (d.matched) mr = this.rules.find(r => r[0] === d.matched);

        if (mr && d.freq > 0) {
            let fok = mr[2], fmin = mr[3], fmax = mr[4];
            let delta = d.freq - fok;
            // Cents: signed deviation dari fok  (+ = sharp, − = flat)
            let centsVal = fok > 0 ? 1200 * Math.log2(d.freq / fok) : 0;
            let state = Math.abs(centsVal) <= OK_TIGHT ? "perfect" :
                (d.freq >= fmin && d.freq <= fmax ? "inrange" : "outrange");
            this.dDelta = delta;
            this.dCents = centsVal;
            this.dNote = mr[1]; this.dState = state;
        } else {
            this.dDelta = 0; this.dCents = 0; this.dNote = "—"; this.dState = "idle";
        }

        this.drawDial();

        this.pressed = d.pressed;
        this.matched = d.matched;

        // Auto-Calibration Logic
        if (this.acState !== 'idle') {
            this.handleACLogic(d);
        }

        if (d.verdict_event) {
            let pn = d.verdict_event.pn_no;
            this.results[pn] = d.verdict_event;
            this.updateSummary();
            if (!document.getElementById('modal-log').classList.contains('hidden')) {
                this.populateLog();
            }
        }

        this.updateVerdictDOM();
        this.drawPiano();
    }

    // ── Summary ────────────────────────────────────────────
    updateSummary() {
        let ok = 0, ng = 0;
        for (let k in this.results) {
            if (this.results[k].verdict === "OK") ok++; else ng++;
        }
        let tot = this.rules.length;
        let rem = tot - Object.keys(this.results).length;
        let pct = Math.floor((Object.keys(this.results).length / tot) * 100);

        this.setText(this.tallyOk, ok);
        this.setText(this.tallyNg, ng);
        this.setText(this.tallyRem, rem);

        this.setClass(this.tallyOk, "tally-val " + (ok ? "text-green" : "text-muted"));
        this.setClass(this.tallyNg, "tally-val " + (ng ? "text-red" : "text-muted"));

        if (Object.keys(this.results).length === tot) {
            this.setText(this.tallyOvr, ng === 0 ? "✓ OK" : "✗ NG");
            this.setClass(this.tallyOvr, "tally-val " + (ng === 0 ? "text-green" : "text-red"));
            this.setText(this.lblOvr, ng === 0 ? "INSPECTION PASS — ALL OK" : `INSPECTION FAIL — ${ng} NG`);
            this.setClass(this.ovrStatus, "status-box " + (ng === 0 ? "success" : "fail"));
        } else if (this.isRunning) {
            this.setText(this.tallyOvr, pct + "%");
            this.setClass(this.tallyOvr, "tally-val text-muted");
            this.setText(this.lblOvr, `IN PROGRESS ${Object.keys(this.results).length}/${tot}`);
            this.setClass(this.ovrStatus, "status-box in-progress");
        }
    }

    // ── Start / Stop ───────────────────────────────────────
    toggleStart() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.engine.start();
            this.btnStart.innerHTML = "■ STOP";
            this.btnStart.className = "btn btn-red";
            this.lblOvr.innerText = `IN PROGRESS 0/${this.rules.length}`;
            this.ovrStatus.className = "status-box in-progress";
            this.btnPower.classList.add('power-active');
        } else {
            this.isRunning = false;
            this.engine.stop();
            this.btnStart.innerHTML = "▶ START";
            this.btnStart.className = "btn btn-green";
            this.btnPower.classList.remove('power-active');
        }
    }

    // ── Reset Session ──────────────────────────────────────
    resetSession() {
        let wasRunning = this.isRunning;
        if (wasRunning) {
            this.engine.stop();
            this.isRunning = false;
        }

        this.results = {};
        this.pressed = new Set();
        this.matched = null;
        this.dDelta = 0; this.dCents = 0; this.dNote = "—"; this.dState = "idle";
        this.dFreq = 0; this.dConf = 0; this.dRms = 0;
        this.engine.reset();

        this.drawPiano();
        this.drawDial();
        this.updateVerdictDOM();
        this.updateTallyReset();

        this.lblOvr.innerText = "WAITING TO START";
        this.ovrStatus.className = "status-box waiting";
        this.btnStart.innerHTML = "▶ START";
        this.btnStart.className = "btn btn-green";
        this.btnPower.classList.remove('power-active');

        if (wasRunning) {
            this.isRunning = true;
            this.engine.start();
            this.btnStart.innerHTML = "■ STOP";
            this.btnStart.className = "btn btn-red";
            this.lblOvr.innerText = `IN PROGRESS 0/${this.rules.length}`;
            this.ovrStatus.className = "status-box in-progress";
            this.btnPower.classList.add('power-active');
        }
    }

    // ── Calibration ────────────────────────────────────────
    populateCal() {
        document.getElementById('cal-inp-rms').value = this.settings.minRms.toFixed(5);
        document.getElementById('cal-inp-conf').value = this.settings.minConf.toFixed(5);

        let tbody = document.getElementById('cal-tbody');
        tbody.innerHTML = '';
        this.rules.forEach(r => {
            let tr = document.createElement('tr');
            // Semua tuts P32-E
            tr.innerHTML = `
                <td>${r[0]}</td>
                <td>${r[1]}</td>
                <td><input type="number" step="0.01" class="tbl-input" data-idx="2" data-row="${r[0]}" value="${r[2].toFixed(3)}"></td>
                <td><input type="number" step="0.01" class="tbl-input" data-idx="3" data-row="${r[0]}" value="${r[3].toFixed(3)}"></td>
                <td><input type="number" step="0.01" class="tbl-input" data-idx="4" data-row="${r[0]}" value="${r[4].toFixed(3)}"></td>
            `;
            tbody.appendChild(tr);
        });
    }

    saveCal() {
        let nRms = parseFloat(document.getElementById('cal-inp-rms').value);
        let nConf = parseFloat(document.getElementById('cal-inp-conf').value);
        if (!isNaN(nRms)) this.settings.minRms = nRms;
        if (!isNaN(nConf)) this.settings.minConf = nConf;
        saveSettings(this.settings);

        let inputs = document.querySelectorAll('#cal-tbody .tbl-input');
        inputs.forEach(inp => {
            let rowNo = parseInt(inp.getAttribute('data-row'));
            let idx = parseInt(inp.getAttribute('data-idx'));
            let val = parseFloat(inp.value);
            if (!isNaN(val)) {
                let rule = this.rules.find(r => r[0] === rowNo);
                if (rule) rule[idx] = val;
            }
        });
        saveRules(this.rules, this.modelType);
        this.engine.rules = this.rules;
        this.engine.settings = this.settings;
        this.closeModal('modal-cal');
    }

    resetCal() {
        const defaultRules = INSPECTION_RULES_DEFAULT[this.modelType] || INSPECTION_RULES_DEFAULT[DEFAULT_MODEL];
        this.rules = JSON.parse(JSON.stringify(defaultRules));
        this.settings = { minRms: 0.009, minConf: 0.06 };
        saveSettings(this.settings);
        this.populateCal();
    }

    importCal() { document.getElementById('inp-cal-file').click(); }

    handleImportCal(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                let parsed = JSON.parse(ev.target.result);
                if (Array.isArray(parsed)) {
                    this.rules = parsed;
                } else if (parsed.rules && Array.isArray(parsed.rules)) {
                    this.rules = parsed.rules;
                    if (parsed.settings) this.settings = { ...this.settings, ...parsed.settings };
                } else {
                    throw new Error("Format JSON tidak valid!");
                }
                this.populateCal();
                alert("File Kalibrasi berhasil dimuat! Jangan lupa klik SIMPAN.");
            } catch (err) {
                alert("Gagal mengimpor file: " + err);
            }
            e.target.value = "";
        };
        reader.readAsText(file);
    }

    exportCal() {
        let tempRules = JSON.parse(JSON.stringify(this.rules));
        let tempSettings = JSON.parse(JSON.stringify(this.settings));

        let nRms = parseFloat(document.getElementById('cal-inp-rms').value);
        let nConf = parseFloat(document.getElementById('cal-inp-conf').value);
        if (!isNaN(nRms)) tempSettings.minRms = nRms;
        if (!isNaN(nConf)) tempSettings.minConf = nConf;

        let inputs = document.querySelectorAll('#cal-tbody .tbl-input');
        inputs.forEach(inp => {
            let rowNo = parseInt(inp.getAttribute('data-row'));
            let idx = parseInt(inp.getAttribute('data-idx'));
            let val = parseFloat(inp.value);
            if (!isNaN(val)) {
                let r = tempRules.find(x => x[0] === rowNo);
                if (r) r[idx] = val;
            }
        });

        const payload = { model: this.modelType, rules: tempRules, settings: tempSettings };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `QC_Pianika_Rules_${this.modelType}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
    }

    // ── Log ────────────────────────────────────────────────
    populateLog() {
        let tbody = document.getElementById('log-tbody');
        tbody.innerHTML = '';
        this.rules.forEach(r => {
            let pn = r[0];
            let res = this.results[pn];
            let tr = document.createElement('tr');


            if (res) {
                let statusCls = res.verdict === "OK" ? "status-ok" : "status-ng";
                let checkKiri = (res.verdict === "NG" && res.reason === "SHARP") ? "✓" : "";
                let checkKanan = (res.verdict === "NG" && res.reason === "FLAT") ? "✓" : "";
                tr.innerHTML = `
                    <td>${pn}</td>
                    <td>${r[1]}</td>
                    <td>${res.freq_detected.toFixed(3)}</td>
                    <td>${r[2].toFixed(3)}</td>
                    <td>${res.freq_min.toFixed(3)}</td>
                    <td>${res.freq_max.toFixed(3)}</td>
                    <td class="${statusCls}">${res.verdict}</td>
                    <td>${res.verdict === "OK" ? "PASS" : res.reason}</td>
                    <td style="font-weight: bold; color: var(--danger-bd); font-size: 1.5rem;">${checkKiri}</td>
                    <td style="font-weight: bold; color: var(--danger-bd); font-size: 1.5rem;">${checkKanan}</td>
                `;
            } else {
                tr.innerHTML = `
                    <td class="text-muted">${pn}</td>
                    <td class="text-muted">${r[1]}</td>
                    <td class="text-muted">—</td>
                    <td class="text-muted">${r[2].toFixed(3)}</td>
                    <td class="text-muted">—</td>
                    <td class="text-muted">—</td>
                    <td></td><td></td><td></td><td></td>
                `;
            }
            tbody.appendChild(tr);
        });
    }

    // ── Dial ───────────────────────────────────────────────
    drawDial() {
        const c = this.dialCanvas;
        if (c.parentElement && (c.width !== c.parentElement.clientWidth || c.height !== c.parentElement.clientHeight)) {
            c.width = c.parentElement.clientWidth;
            c.height = c.parentElement.clientHeight;
        }

        const DIAL_RANGE_HZ = 2.5;
        const DIAL_TICK_STEP_HZ = DIAL_RANGE_HZ / 40;
        let pitchVal = Math.max(-DIAL_RANGE_HZ, Math.min(DIAL_RANGE_HZ, this.dDelta));
        let stateHash = `${this.dState}|${this.dNote}|${pitchVal.toFixed(3)}|${c.width}x${c.height}`;
        if (this._lastDialState === stateHash) return;
        this._lastDialState = stateHash;

        const ctx = this.dialCtx;
        const W = c.width, H = c.height;
        ctx.clearRect(0, 0, W, H);
        if (W < 40 || H < 40) return;

        // Dial fits snugly — centre slightly above mid to give room for labels below
        let sz = Math.min(W, H) * 0.8;
        let cx = W / 2, cy = H / 2 + sz * 0.02, r = sz / 2;

        // ── Background circle radius (atur nilai ini untuk mengubah ukuran lingkaran bg) ──
        const DIAL_BG_RADIUS = r * 1.06;   // 1.0 = tepat di tepi outer ring, > 1 = lebih besar
        const DIAL_BG_COLOR = '#181818'; // warna gelap solid
        let state = this.dState;

        // ── Radius definitions (matches reference proportions) ──
        const R_OUTER = r * 1.00;  // outermost arc (label text sits just outside)
        const R_RING_OUT = r * 1.05;  // outer border ring
        const R_RING_IN = r * 0.7;  // inner border ring
        const R_TICK_OUT_MAJOR = r * 1.01; // major tick outer end
        const R_TICK_OUT_MINOR = r * 0.98; // minor tick outer end
        const R_TICK_IN = r * 0.75;  // tick inner start (from inner ring)
        const R_TXT = r * 1.16;  // label text radius (moved further out)

        // ── Scale factor for line widths (responsive to dial size) ──
        const sf = Math.max(0.5, Math.min(1, r / 120));  // 1.0 at r>=120, scales down on small screens

        // Dial spans 270°
        // centre (0 cents) is at top (North = 270°)
        // Start angle = 270 - (270 / 2) = 135°
        const ANG_START_DEG = 135; // -2.5 Hz
        const ANG_RANGE_DEG = 270; // total sweep

        const degToRad = d => d * Math.PI / 180;
        const valToAngle = v => degToRad(ANG_START_DEG + ((v + DIAL_RANGE_HZ) / (DIAL_RANGE_HZ * 2)) * ANG_RANGE_DEG);

        // ── 0. Background circle ──
        ctx.beginPath();
        ctx.arc(cx, cy, DIAL_BG_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = DIAL_BG_COLOR;
        ctx.fill();

        // ── 1. Outer ring ──
        ctx.beginPath();
        ctx.arc(cx, cy, R_RING_OUT, 0, 2 * Math.PI);
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1.5 * sf;
        ctx.stroke();

        // ── 2. Inner ring ──
        ctx.beginPath();
        ctx.arc(cx, cy, R_RING_IN, 0, 2 * Math.PI);
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1.5 * sf;
        ctx.stroke();

        // ── 3. Ticks ──
        // 81 ticks total: i=-40..40, each step = 0.0625 Hz
        const INACTIVE = state === 'idle' ? '#444444' : '#555555';
        const ORANGE = '#FF9800';
        const CYAN = '#00E5FF';

        for (let i = -40; i <= 40; i++) {
            const val = i * DIAL_TICK_STEP_HZ;
            const ang = valToAngle(val);
            {
                const isMajorHz = (i % 8 === 0);
                const isMidHz = (i % 4 === 0) && !isMajorHz;

                let colorHz = INACTIVE;
                if (state !== 'idle') {
                    const isPointerHz = Math.abs(val - pitchVal) <= (DIAL_TICK_STEP_HZ / 2);
                    if (isPointerHz) {
                        colorHz = CYAN;
                    } else if (pitchVal < 0 && val < 0 && val >= pitchVal) {
                        colorHz = ORANGE;
                    } else if (pitchVal > 0 && val > 0 && val <= pitchVal) {
                        colorHz = ORANGE;
                    }
                } else if (i === 0) {
                    colorHz = '#777777';
                }

                const rOutHz = isMajorHz ? R_TICK_OUT_MAJOR : R_TICK_OUT_MINOR;
                const lwHz = (isMajorHz ? 2.5 : (isMidHz ? 1.8 : 1.4)) * sf;

                ctx.beginPath();
                ctx.moveTo(cx + R_TICK_IN * Math.cos(ang), cy + R_TICK_IN * Math.sin(ang));
                ctx.lineTo(cx + rOutHz * Math.cos(ang), cy + rOutHz * Math.sin(ang));
                ctx.strokeStyle = colorHz;
                ctx.lineWidth = lwHz;
                ctx.lineCap = 'round';
                ctx.stroke();
                continue;
            }
            const isMajor = (i % 10 === 0); // major: i = -40,-30,...,0,...,40 → val = -10,-7.5,...,0,...,10
            const isMid = (i % 5 === 0) && !isMajor; // mid: i =-35,-25,... → val =-8.75,...

            // Color logic
            let color = INACTIVE;
            if (state !== 'idle') {
                const isPointer = Math.abs(val - pitchVal) <= 0.125;
                if (isPointer) {
                    color = CYAN;
                } else if (pitchVal < 0 && val < 0 && val >= pitchVal) {
                    color = ORANGE;
                } else if (pitchVal > 0 && val > 0 && val <= pitchVal) {
                    color = ORANGE;
                }
            } else if (i === 0) {
                color = '#777777';
            }

            const rOut = isMajor ? R_TICK_OUT_MAJOR : R_TICK_OUT_MINOR;
            const lw = isMajor ? 2.5 : (isMid ? 1.8 : 1.4);

            ctx.beginPath();
            ctx.moveTo(cx + R_TICK_IN * Math.cos(ang), cy + R_TICK_IN * Math.sin(ang));
            ctx.lineTo(cx + rOut * Math.cos(ang), cy + rOut * Math.sin(ang));
            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // ── 4. Labels (0, ±25, ±50, ±75, ±100 in cents 
        // These correspond to val = -10,-7.5,-5,-2.5,0,+2.5,+5,+7.5,+10
        const labelMap = [
            [-2.5, '2.5'], [-2.0, '2.0'], [-1.5, '1.5'], [-1.0, '1.0'], [-0.5, '0.5'],
            [0, '0'],
            [0.5, '0.5'], [1.0, '1.0'], [1.5, '1.5'], [2.0, '2.0'], [2.5, '2.5']
        ];
        const fs = Math.max(7, r * 0.09);
        ctx.font = `600 ${fs}px ${this.font}`;
        ctx.fillStyle = '#cfcfcf';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const [val, lbl] of labelMap) {
            const ang = valToAngle(val);
            ctx.fillText(lbl, cx + R_TXT * Math.cos(ang), cy + R_TXT * Math.sin(ang));
        }

        // ── DOM Overlay ──
        const nc = state === 'idle' ? '#6B7280' :
            state === 'inrange' ? '#F59E0B' :
                state === 'perfect' ? '#10B981' : '#DC2626';

        this.dNodeTxt.innerText = this.dNote;
        this.dNodeHz.innerText = state !== 'idle'
            ? (this.dDelta > 0 ? '+' : '') + this.dDelta.toFixed(3) + ' Hz'
            : 'NO SIGNAL';
        this.dNodeBadge.innerText = { idle: 'WAITING', inrange: 'IN RANGE', perfect: '✓ PERFECT', outrange: '✗ OUT OF RANGE' }[state];

        this.dNodeTxt.style.color = state === 'idle' ? '#D1D5DB' : '#FFFFFF';
        this.dNodeHz.style.color = nc;
        this.dNodeBadge.style.color = nc;
    }

    // ── Verdict DOM ────────────────────────────────────────
    updateVerdictDOM() {
        let state = this.dState, note = this.dNote;
        let isIdle = state === "idle" || note === "—";
        let mr = this.matched ? this.rules.find(r => r[0] === this.matched) : null;

        this.verdictHero.className = "verdict-hero state-" + state;

        this.vpNote.innerText = isIdle ? "—" : note;
        this.vpBadge.innerText = isIdle ? "—" : (state === "inrange" ? "IN RANGE" : state === "perfect" ? "PERFECT" : "OUT OF RANGE");
        this.vpHz.innerText = (!isIdle && this.dFreq > 0) ? this.dFreq.toFixed(3) + " Hz" : "—";

        if (mr && !isIdle) {
            this.setText(this.vpFmin, mr[3].toFixed(3) + " Hz");
            this.setText(this.vpFok, mr[2].toFixed(3) + " Hz");
            this.setText(this.vpFmax, mr[4].toFixed(3) + " Hz");
            this.setClass(this.vpFmin, "vg-val text-text");
            this.setClass(this.vpFok, "vg-val text-black");
            this.setClass(this.vpFmax, "vg-val text-text");
        } else {
            this.setText(this.vpFmin, "—");
            this.setText(this.vpFok, "—");
            this.setText(this.vpFmax, "—");
            this.setClass(this.vpFmin, "vg-val text-muted");
            this.setClass(this.vpFok, "vg-val text-muted");
            this.setClass(this.vpFmax, "vg-val text-muted");
        }

        this.setText(this.vpRms, this.dRms.toFixed(5));
        this.setText(this.vpConf, this.dConf.toFixed(4));

        let pn = this.matched;
        let hasRes = pn && this.results[pn];
        if (hasRes) {
            let final = this.results[pn].verdict;
            this.setText(this.vpResultTxt, final);
            this.setClass(this.vpResultBanner, "vp-result-banner " + (final === "OK" ? "result-ok" : "result-ng"));
        } else {
            this.setClass(this.vpResultBanner, "vp-result-banner hidden");
        }

        // ── Recommendation Area Logic ──
        // Only show recommendation if outrange (NG)
        if (state === "outrange") {
            if (this.dCents > 0) {
                // Cents positive = SHARP (Tinggi) -> Adjust KIRI
                this.setClass(this.recL, "verdict-recomend");
                this.setClass(this.recR, "verdict-recomend state-idle");
            } else if (this.dCents < 0) {
                // Cents negative = FLAT (Rendah) -> Adjust KANAN
                this.setClass(this.recL, "verdict-recomend state-idle");
                this.setClass(this.recR, "verdict-recomend");
            } else {
                this.setClass(this.recL, "verdict-recomend state-idle");
                this.setClass(this.recR, "verdict-recomend state-idle");
            }
        } else {
            // Perfect, Inrange, or Idle -> All Idle
            this.setClass(this.recL, "verdict-recomend state-idle");
            this.setClass(this.recR, "verdict-recomend state-idle");
        }
    }

    // ── Piano Canvas ───────────────────────────────────────
    drawPiano() {
        const c = this.pianoCanvas;
        // Sync size once per draw if canvas has no valid dimensions yet
        if ((c.width < 20 || c.height < 10) && c.parentElement) {
            const r = c.parentElement.getBoundingClientRect();
            const w = Math.floor(r.width);
            const h = Math.floor(r.height);
            if (w > 0 && h > 10 && h < 600) {
                c.width = w;
                c.height = h;
                this._lastPianoState = ''; // bust cache
            }
        }
        let prObj = Array.from(this.pressed).sort().join(',');
        let resObj = Object.keys(this.results).map(k => k + this.results[k].verdict).join(',');
        // Include canvas size in hash so resize always forces a redraw
        let stateHash = `${prObj}|${resObj}|${c.width}x${c.height}`;
        if (this._lastPianoState === stateHash) return;
        this._lastPianoState = stateHash;

        const ctx = this.pianoCtx;
        const W = c.width, H = c.height;
        ctx.clearRect(0, 0, W, H);
        if (W < 20) return;

        // --- Casing biru pianika ---
        ctx.fillStyle = '#6488b3';
        ctx.beginPath();
        ctx.roundRect(0, 0, W, H, 6);
        ctx.fill();
        // Border casing
        ctx.strokeStyle = '#4a6a8f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- Padding dari casing ke tuts (proporsional) ---
        const paddingLeft = Math.max(6, W * 0.018);
        const paddingRight = Math.max(6, W * 0.018);
        const paddingTop = Math.max(10, H * 0.14);
        const paddingBottom = Math.max(4, H * 0.055);

        const keyboardWidth = W - paddingLeft - paddingRight;
        const keyboardHeight = H - paddingTop - paddingBottom;

        let white_r = this.rules.filter(r => !this.isBlack(r[1]));
        let nw = white_r.length;
        if (nw === 0) return;

        const whiteKeyWidth = keyboardWidth / nw;
        const whiteKeyHeight = keyboardHeight;

        const blackKeyWidth = whiteKeyWidth * 0.6;
        const blackKeyHeight = keyboardHeight * 0.65;

        // Map rule index → white key index position
        let wx = {};
        let wi = 0;
        this.rules.forEach((r, i) => {
            if (!this.isBlack(r[1])) {
                wx[i] = wi;
                wi++;
            }
        });

        // --- 1. MENGGAMBAR TUTS PUTIH ---
        this.rules.forEach((r, i) => {
            if (this.isBlack(r[1])) return;
            let whiteIdx = wx[i];
            let x = paddingLeft + (whiteIdx * whiteKeyWidth);
            let y = paddingTop;
            let pn = r[0];
            let res = this.results[pn];
            let pr = this.pressed.has(pn);

            // Warna tuts putih berdasarkan state
            let fill = '#fff4dc'; // krem seperti referensi
            let strokeCol = '#2c2c2c';
            let lw = 2;

            if (pr) {
                fill = '#EDE9FE';
                strokeCol = '#7C3AED';
                lw = 2;
            } else if (res) {
                fill = res.verdict === "OK" ? '#D1FAE5' : '#FEE2E2';
                strokeCol = res.verdict === "OK" ? '#10B981' : '#DC2626';
                lw = 2;
            }

            ctx.beginPath();
            ctx.roundRect(x, y, whiteKeyWidth, whiteKeyHeight, [8, 8, 3, 3]);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = strokeCol;
            ctx.lineWidth = lw;
            ctx.stroke();
        });

        // --- 2. MENGGAMBAR TUTS HITAM ---
        wi = 0;
        this.rules.forEach((r, i) => {
            if (!this.isBlack(r[1])) { wi++; return; }
            if (wi === 0) return;

            // Posisi X tengah tuts hitam berada di garis pembatas antar 2 tuts putih
            const xCenter = paddingLeft + (wi * whiteKeyWidth);
            const x = xCenter - (blackKeyWidth / 2);
            const y = paddingTop - 1;
            let pn = r[0];
            let res = this.results[pn];
            let pr = this.pressed.has(pn);

            let fill = '#333333'; // abu gelap seperti referensi
            let lw = 0;
            let strokeCol = '#333333';

            if (pr) {
                fill = '#7C3AED';
                strokeCol = '#5B21B6';
                lw = 2;
            } else if (res) {
                fill = res.verdict === "OK" ? '#10B981' : '#DC2626';
                strokeCol = res.verdict === "OK" ? '#10B981' : '#DC2626';
                lw = 2;
            }

            ctx.beginPath();
            ctx.roundRect(x, y, blackKeyWidth, blackKeyHeight, [8, 8, 8, 8]);
            ctx.fillStyle = fill;
            ctx.fill();
            if (lw > 0) {
                ctx.strokeStyle = strokeCol;
                ctx.lineWidth = lw;
                ctx.stroke();
            }
        });

    }

    // Helper function to draw rounded rectangle
    roundRect(ctx, x, y, width, height, radius) {
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
    }

    // ══════════════════════════════════════════════════════════
    //  AUTO-CALIBRATION METHODS
    // ══════════════════════════════════════════════════════════

    openAutoCal() {
        this.openModal('modal-autocal');
        this.acState = 'idle';
        this.acData = { p1_rms: [], p2_rms: [], p2_conf: [] };
        this.acSuggested = { rms: 0.009, conf: 0.06 };
        this.updateACUI();

        this.acStatus.innerText = "STANDBY";
        this.acPhaseLabel.innerText = "PHASE STANDBY";
        this.acCommand.innerText = "-";
        this.btnACStart2.disabled = true;
        this.btnACSave.classList.add('hidden');
        this._resetResultRow();

        if (!this.isRunning) {
            this.engine.start();
        }
    }

    closeAutoCal() {
        this.closeModal('modal-autocal');
        this.acState = 'idle';
        if (!this.isRunning) {
            this.engine.stop();
        }
    }

    startACPhase1() {
        this.acState = 'p1_sampling';
        this.acData.p1_rms = [];
        this.acStatus.innerText = "PHASE 1: AMBIENT";
        this.acPhaseLabel.innerText = "PHASE 1 — AMBIENT NOISE";
        this.acCommand.innerText = "Sampling kebisingan ruangan \n Jangan tiup pianika.";
        this.btnACStart1.classList.add('hidden');
        this.btnACStop1.classList.remove('hidden');
        this.btnACStop1.disabled = true;
        this.btnACStop1.innerText = "SAMPLING...";
        this.acRMSPeak.innerText = "—";
        this.acProgress.style.width = "0%";
        this._resetResultRow();

        let elapsed = 0;
        const duration = 3000;
        const step = 50;

        const p1Timer = setInterval(() => {
            if (this.acState !== 'p1_sampling') {
                clearInterval(p1Timer);
                return;
            }
            elapsed += step;
            this.acProgress.style.width = Math.min(100, (elapsed / duration) * 100) + "%";
            if (elapsed >= duration) {
                clearInterval(p1Timer);
                this.stopACPhase1();
            }
        }, step);
    }

    stopACPhase1() {
        this.acState = 'idle_ready_p2';
        this.btnACStop1.classList.add('hidden');
        this.btnACStop1.disabled = false;
        this.btnACStop1.innerText = "STOP";
        this.btnACStart1.classList.remove('hidden');
        this.btnACStart1.innerText = "RE-SAMPLE PHASE 1";
        this.btnACStart2.disabled = false;

        const p1Data = this.acData.p1_rms;
        if (p1Data.length === 0) {
            this.acStatus.innerText = "PHASE 1 ERROR";
            this.acCommand.innerText = "Tidak ada data ambient. \n Coba ulangi.";
            return;
        }

        const peak = Math.max(...p1Data);
        const sorted = [...p1Data].sort((a, b) => a - b);
        const p95idx = Math.floor(sorted.length * 0.95);
        const p95 = sorted[Math.min(p95idx, sorted.length - 1)];

        // Simpan floor stats
        this.acData.p1_peak = peak;
        this.acData.p1_p95 = p95;

        this.acRMSPeak.innerText = peak.toFixed(5);
        this.acStatus.innerText = "PHASE 1 SELESAI";
        this.acPhaseLabel.innerText = "PHASE 1 SELESAI — SIAP PHASE 2";
        this.acCommand.innerText = `Floor: ${peak.toFixed(5)}. \n Tiup satu nada pianika di Phase 2.`;
    }

    startACPhase2() {
        let count = 3;
        this.acState = 'p2_countdown';
        this.acTimer.classList.remove('hidden');
        this.acTimer.innerText = count;
        this.acPhaseLabel.innerText = "PHASE 2 — BERSIAP...";
        this.acCommand.innerText = "SIAP-SIAP \n TIUP SATU NADA...";
        this.btnACStart2.disabled = true;

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                this.acTimer.innerText = count;
            } else {
                clearInterval(timer);
                this.acTimer.classList.add('hidden');
                this.runACPhase2Sampling();
            }
        }, 1000);
    }

    runACPhase2Sampling() {
        this.acState = 'p2_sampling';
        this.acData.p2_rms = [];
        this.acData.p2_conf = [];
        this.acStatus.innerText = "PHASE 2: SAMPLING";
        this.acPhaseLabel.innerText = "PHASE 2 — SIGNAL SAMPLING";
        this.acCommand.innerText = "TIUP NADA TERUS \n JANGAN BERHENTI.";
        this.acProgress.style.width = "0%";

        let elapsed = 0;
        const duration = 1500;
        const interval = 50;

        const progTimer = setInterval(() => {
            elapsed += interval;
            const pct = Math.min(100, (elapsed / duration) * 100);
            this.acProgress.style.width = pct + "%";

            if (elapsed >= duration) {
                clearInterval(progTimer);
                this.finishAutoCal();
            }
        }, interval);
    }

    finishAutoCal() {
        this.acState = 'completed';
        this.acPhaseLabel.innerText = "KALIBRASI SELESAI";

        const p1Data = this.acData.p1_rms;
        const p2RmsData = this.acData.p2_rms;
        const p2ConfData = this.acData.p2_conf;

        // ── Hitung floor noise stats ──
        const floorPeak = (p1Data.length > 0) ? Math.max(...p1Data) : 0;
        const floorSorted = [...p1Data].sort((a, b) => a - b);
        // Gunakan P95 sebagai representasi floor (lebih robust dari peak)
        const floorP95 = floorSorted.length > 0
            ? floorSorted[Math.floor(floorSorted.length * 0.95)]
            : 0;

        // ── Hitung signal stats ──
        const sigRmsData = p2RmsData.filter(v => v > 0);
        const sigRmsSorted = [...sigRmsData].sort((a, b) => a - b);

        // Median signal RMS (50th percentile — stabil, tidak terpengaruh burst)
        const sigRmsMedian = sigRmsSorted.length > 0
            ? sigRmsSorted[Math.floor(sigRmsSorted.length * 0.5)]
            : 0;
        const sigRmsPeak = sigRmsData.length > 0 ? Math.max(...sigRmsData) : 0;

        // ── Validasi: apakah signal cukup beda dari floor? ──
        const { valid, snrRatio, warnLevel, warnText } = this._validateCalibration(floorP95, sigRmsMedian);

        // ── Hitung MIN RMS — titik tengah 3/4 dari floor ke signal ──
        // Artinya: floor + 0.75 * (signal - floor)
        // Ini berada di 3/4 jalan dari floor noise menuju sinyal pianika
        let suggestedRms;
        if (valid && sigRmsMedian > floorP95) {
            suggestedRms = floorP95 + 0.75 * (sigRmsMedian - floorP95);
        } else {
            // Fallback jika gagal: gunakan 2.5x floor peak seperti sebelumnya
            suggestedRms = Math.max(0.003, floorPeak * 2.5);
        }
        suggestedRms = Math.max(0.003, suggestedRms);

        // ── Hitung MIN CONF ──
        let suggestedConf = this.acSuggested.conf; // default dari sebelumnya
        if (p2ConfData.length > 0) {
            const confSorted = [...p2ConfData].sort((a, b) => a - b);
            // Ambil P10 dari distribusi conf saat sinyal aktif (pakai hanya frame di atas threshold RMS)
            const activeConf = p2ConfData.filter((c, i) => (p2RmsData[i] || 0) > floorP95 * 2);
            const activeConfSorted = [...activeConf].sort((a, b) => a - b);
            if (activeConfSorted.length > 3) {
                const p10 = activeConfSorted[Math.floor(activeConfSorted.length * 0.10)];
                const p50 = activeConfSorted[Math.floor(activeConfSorted.length * 0.50)];
                // Midpoint 2/4: titik tengah 2/4 dari nol ke P10 signal
                // = 0.5 * P10 (threshold conf berada di 2/4 nilai terendah sinyal valid)
                suggestedConf = Math.max(0.03, Math.min(0.90, 0.5 * p10));
            } else if (confSorted.length > 0) {
                const p10 = confSorted[Math.floor(confSorted.length * 0.10)];
                suggestedConf = Math.max(0.03, Math.min(0.90, 0.5 * p10));
            }
        }

        this.acSuggested.rms = suggestedRms;
        this.acSuggested.conf = suggestedConf;
        this.acData.snrRatio = snrRatio;
        this.acData.floorP95 = floorP95;
        this.acData.sigRmsMedian = sigRmsMedian;

        // ── Update result row UI ──
        this._setResultVal(this.acResFloor, floorP95.toFixed(5));
        this._setResultVal(this.acResSignal, sigRmsMedian.toFixed(5));

        // SNR
        const snrText = snrRatio > 0 ? snrRatio.toFixed(1) + 'x' : '—';
        const snrClass = snrRatio >= 2 ? 'ac-val-ok' : snrRatio >= 1.5 ? 'ac-val-warn' : 'ac-val-err';
        this._setResultVal(this.acResSNR, snrText, snrClass);

        // Suggested values
        this._setResultVal(this.acResRms, suggestedRms.toFixed(5));
        this._setResultVal(this.acResConf, suggestedConf.toFixed(5));

        // Status
        const statusClass = warnLevel === 'ok' ? 'ac-val-ok' : warnLevel === 'caution' ? 'ac-val-warn' : 'ac-val-err';
        const statusText = warnLevel === 'ok' ? 'VALID' : warnLevel === 'caution' ? 'CAUTION' : 'GAGAL';
        this._setResultVal(this.acResStatus, statusText, statusClass);

        // Warning message
        if (warnText) {
            this.acWarnMsg.innerText = warnText;
            this.acWarnMsg.className = `ac-warn-msg warn-${warnLevel}`;
        } else {
            this.acWarnMsg.className = 'ac-warn-msg hidden';
        }

        // Update RMS sig peak di live panel
        this.acRMSSig.innerText = sigRmsPeak.toFixed(5);

        if (warnLevel !== 'fail') {
            this.acStatus.innerText = "KALIBRASI SELESAI";
            this.acCommand.innerText = `RMS: ${suggestedRms.toFixed(5)} \n CONF: ${suggestedConf.toFixed(5)}`;
            this.btnACSave.classList.remove('hidden');
        } else {
            this.acStatus.innerText = "KALIBRASI GAGAL";
            this.acCommand.innerText = "Signal terlalu lemah.";
            this.btnACStart2.disabled = false; // izinkan retry
        }
    }

    // ── Validasi SNR antara floor dan signal ──
    // Mengembalikan: { valid, snrRatio, warnLevel, warnText }
    _validateCalibration(floorP95, sigRmsMedian) {
        const MIN_SNR = 1.5;       // minimal 1.5x floor = threshold minimum valid
        const CAUTION_SNR = 2.5;   // di bawah ini: valid tapi perlu perhatian
        const MIN_SIG_ABS = 0.005; // sinyal harus di atas nilai absolut minimum

        if (floorP95 <= 0 && sigRmsMedian <= 0) {
            return {
                valid: false, snrRatio: 0, warnLevel: 'fail',
                warnText: 'GAGAL: Tidak ada data Phase 1 maupun Phase 2. Ulangi kalibrasi dari awal.'
            };
        }

        if (sigRmsMedian <= MIN_SIG_ABS) {
            return {
                valid: false, snrRatio: 0, warnLevel: 'fail',
                warnText: `GAGAL: Sinyal pianika terlalu lemah (${sigRmsMedian.toFixed(5)}). Tiup lebih keras atau periksa posisi mikrofon.`
            };
        }

        if (floorP95 <= 0) {
            // Tidak ada data Phase 1 — masih bisa lanjut dengan warning
            return {
                valid: true, snrRatio: 99, warnLevel: 'caution',
                warnText: 'CAUTION: Data floor noise tidak tersedia. Lakukan Phase 1 untuk hasil lebih akurat.'
            };
        }

        const snrRatio = sigRmsMedian / floorP95;

        if (snrRatio < MIN_SNR) {
            return {
                valid: false, snrRatio, warnLevel: 'fail',
                warnText: `GAGAL: SNR terlalu rendah (${snrRatio.toFixed(1)}x, minimal ${MIN_SNR}x). Ruangan terlalu bising atau pianika tidak terdeteksi. Kurangi kebisingan latar atau dekatkan mikrofon.`
            };
        }

        if (snrRatio < CAUTION_SNR) {
            return {
                valid: true, snrRatio, warnLevel: 'caution',
                warnText: `CAUTION: SNR cukup rendah (${snrRatio.toFixed(1)}x). Hasil kalibrasi mungkin kurang akurat. Rekomendasikan ruangan lebih senyap.`
            };
        }

        return { valid: true, snrRatio, warnLevel: 'ok', warnText: '' };
    }

    _setResultVal(el, text, extraClass = '') {
        if (!el) return;
        el.innerText = text;
        el.className = `ac-result-val ${extraClass}`.trim();
        if (el.classList.contains('ac-result-suggest')) el.classList.add('ac-result-suggest');
    }

    _resetResultRow() {
        const els = [this.acResFloor, this.acResSignal, this.acResSNR, this.acResRms, this.acResConf, this.acResStatus];
        els.forEach(el => { if (el) { el.innerText = '—'; el.className = 'ac-result-val'; } });
        if (this.acResRms) this.acResRms.classList.add('ac-result-suggest');
        if (this.acResConf) this.acResConf.classList.add('ac-result-suggest');
        if (this.acWarnMsg) this.acWarnMsg.className = 'ac-warn-msg hidden';
    }

    saveACResults() {
        this.settings.minRms = this.acSuggested.rms;
        this.settings.minConf = this.acSuggested.conf;
        saveSettings(this.settings);
        this.engine.settings = this.settings;

        this.acCommand.innerText = `Setting disimpan — RMS: ${this.acSuggested.rms.toFixed(5)}, CONF: ${this.acSuggested.conf.toFixed(5)}`;
        this.btnACSave.classList.add('hidden');
        this.acStatus.innerText = "APPLIED";
        this.acPhaseLabel.innerText = "TERSIMPAN";
        this._setResultVal(this.acResStatus, 'APPLIED', 'ac-val-ok');
        this.populateCal();
    }

    handleACLogic(d) {
        if (this.modalAC.classList.contains('hidden')) return;

        this.acRMSVal.innerText = d.rms.toFixed(5);
        this.acConfVal.innerText = d.conf.toFixed(5);

        this.acRMSVal.className = `ac-metric-value ${d.rms > this.settings.minRms ? 'ac-active-rms' : ''}`;
        this.acConfVal.className = `ac-metric-value ${d.conf > this.settings.minConf ? 'ac-active-conf' : ''}`;

        if (this.acState === 'p1_sampling') {
            this.acData.p1_rms.push(d.rms);
            const peak = Math.max(...this.acData.p1_rms);
            this.acRMSPeak.innerText = peak.toFixed(5);
        } else if (this.acState === 'p2_sampling') {
            this.acData.p2_rms.push(d.rms);
            this.acData.p2_conf.push(d.conf);
            const minConf = Math.min(...this.acData.p2_conf);
            const avgConf = this.acData.p2_conf.reduce((a, b) => a + b, 0) / this.acData.p2_conf.length;
            this.acConfMin.innerText = minConf.toFixed(5);
            this.acConfAvg.innerText = avgConf.toFixed(5);
            const sigPeak = Math.max(...this.acData.p2_rms);
            this.acRMSSig.innerText = sigPeak.toFixed(5);
        }
    }

    updateACUI() {
        this.acRMSVal.innerText = "0.00000";
        this.acRMSPeak.innerText = "—";
        this.acRMSSig.innerText = "—";
        this.acConfVal.innerText = "0.00000";
        this.acConfMin.innerText = "—";
        this.acConfAvg.innerText = "—";
        this.acProgress.style.width = "0%";
        if (this.acPhaseLabel) this.acPhaseLabel.innerText = "PHASE —";
    }
}

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
