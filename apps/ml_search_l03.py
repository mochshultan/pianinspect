import os
import re
import math
import glob
from collections import Counter

import numpy as np
from scipy.io import wavfile


BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SAMPLE_DIR = os.path.join(BASE, 'sample', 'el3')

NOTE_NAME = [
    'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'C\'', 'C#\'', 'D\'', 'D#\'', 'E\'', 'F\'', 'F#\'', 'G\'', 'G#\'', 'A\'', 'A#\'', 'B\'',
    'C\'\'', 'C#\'\'', 'D\'\'', 'D#\'\'', 'E\'\'', 'F\'\'', 'F#\'\'', 'G\'\'', 'G#\'\'', 'A\'\'', 'A#\'\'', 'B\'\'',
    'C\'\'\''
]

RULES = [
    [1, 'F', 176.3, 176, 176.6], [2, 'F#', 186.25, 186.2, 186.3], [3, 'G', 197.2, 197.1, 197.3], [4, 'G#', 208.95, 208.7, 209.2], [5, 'A', 221.45, 221.4, 221.5],
    [6, 'A#', 234.5, 234.4, 234.6], [7, 'B', 248.5, 248.4, 248.6], [8, "C'", 263.25, 263.1, 263.4], [9, "C#'", 279.7, 279.2, 280.2], [10, "D'", 296.05, 295.5, 296.6],
    [11, "D#'", 313.65, 313.1, 314.2], [12, "E'", 332.4, 331.9, 332.9], [13, "F'", 351.6, 351.1, 352.1], [14, "F#'", 372.2, 372.1, 372.3], [15, "G'", 394.4, 394.3, 394.5],
    [16, "G#'", 417.85, 417.7, 418], [17, "A'", 442.7, 442.5, 442.9], [18, "A#'", 468.7, 468.6, 468.8], [19, "B'", 497, 496.7, 497.3], [20, "C''", 526.5, 526.1, 526.9],
    [21, "C#''", 557.65, 557.5, 557.8], [22, "D''", 590.7, 590.5, 590.9], [23, "D#''", 624.4, 623.3, 625.5], [24, "E''", 662.65, 662.5, 662.8], [25, "F''", 701.6, 701.1, 702.1],
    [26, "F#''", 743.95, 743.4, 744.5], [27, "G''", 788.15, 787.9, 788.4], [28, "G#''", 835.1, 835, 835.2], [29, "A''", 884.8, 884.1, 885.5], [30, "A#''", 937.65, 937.15, 938.15],
    [31, "B''", 993.25, 993, 993.5], [32, "C'''", 1051.95, 1051.45, 1052.45]
]
RE_KEY = re.compile(r'el3_key([A-G])\((\d+)\)_(L\d+)\.wav$', re.I)


def parse_label(path):
    m = RE_KEY.search(os.path.basename(path))
    if not m:
        return None
    key_no = int(m.group(2))
    return key_no


def note_freq(label):
    return RULES[label - 1][2]


def dominant_freq(path, window_ms=500):
    sr, data = wavfile.read(path)
    if data.ndim > 1:
        data = data.mean(axis=1)
    if data.dtype.kind in 'iu':
        data = data.astype(np.float64) / np.iinfo(data.dtype).max
    else:
        data = data.astype(np.float64)

    total_ms = len(data) / sr * 1000.0
    start_ms = max(0.0, (total_ms - window_ms) / 2.0)
    end_ms = min(total_ms, start_ms + window_ms)
    start = int(sr * start_ms / 1000.0)
    end = int(sr * end_ms / 1000.0)
    x = data[start:end]

    spec = np.fft.rfft(x)
    mag = np.abs(spec)
    freqs = np.fft.rfftfreq(x.size, d=1.0 / sr)
    peak = np.argmax(mag[1:]) + 1
    a, b, c = mag[peak - 1], mag[peak], mag[peak + 1] if peak + 1 < mag.size else mag[peak]
    d = a - 2 * b + c
    p = 0.5 * (a - c) / d if abs(d) > 1e-12 else 0.0
    return freqs[peak] + p * (freqs[1] - freqs[0])


def audio_rule_predict(path):
    freq = dominant_freq(path)
    candidates = [(abs(freq - note_freq(k)), k) for k in range(1, 33)]
    return min(candidates)[1]


def cent(value):
    return 20 * np.log10(max(value, 1e-9))


def extract_features(path, window_ms=500, use_middle=True):
    sr, data = wavfile.read(path)
    if data.dtype.kind not in ('f', 'i'):
        data = data.astype(np.float64)
    if data.ndim > 1:
        data = data.mean(axis=1)
    data = data.astype(np.float64) / (np.iinfo(np.int16).max if data.dtype.kind in 'iu' else 1.0)

    total_ms = len(data) / sr * 1000.0
    if use_middle:
        start_ms = max(0.0, (total_ms - window_ms) / 2.0)
        end_ms = min(total_ms, start_ms + window_ms)
    else:
        start_ms = 0.0
        end_ms = min(total_ms, window_ms)

    start = int(sr * start_ms / 1000.0)
    end = int(sr * end_ms / 1000.0)
    x = np.asarray(data[start:end], dtype=np.float64)

    if x.size < 1024:
        x = np.pad(x, (0, 1024 - x.size), mode='constant')

    rms = np.sqrt(np.mean(x * x))
    zcr = np.mean(np.diff(np.signbit(x)) != 0)
    spec = np.fft.rfft(x)
    mag = np.abs(spec)
    freqs = np.fft.rfftfreq(x.size, d=1.0 / sr)
    peak_idx = np.argmax(mag)
    peak_freq = freqs[peak_idx]
    peak_mag = mag[peak_idx]

    # simple spectral descriptors
    centroid = np.sum(freqs * mag) / max(np.sum(mag), 1e-9)
    bandwidth = np.sqrt(np.sum(((freqs - centroid) ** 2) * mag) / max(np.sum(mag), 1e-9))
    rolloff = freqs[np.where(np.cumsum(mag) >= 0.85 * np.sum(mag))[0][0]]
    flux = np.mean(np.abs(np.diff(mag)))

    # top 5 peaks with simple prominence-like weighting
    top = np.argsort(mag)[-5:][::-1]
    top_freqs = freqs[top]
    top_mags = mag[top]

    # energy in common piano bands
    band_energies = []
    for lo, hi in [(100, 220), (220, 440), (440, 880), (880, 1760), (1760, 3500)]:
        mask = (freqs >= lo) & (freqs < hi)
        band_energies.append(float(np.sum(mag[mask] ** 2) / max(np.sum(mag ** 2), 1e-9)))

    feat = np.array([
        rms, zcr, peak_freq, peak_mag, centroid, bandwidth, rolloff, flux,
        *band_energies,
        *top_freqs,
        *top_mags,
    ], dtype=np.float64)
    return feat


files = sorted(glob.glob(os.path.join(SAMPLE_DIR, '*.wav')))
train_files = [f for f in files if '_L03.wav' not in os.path.basename(f)]
test_files = [f for f in files if '_L03.wav' in os.path.basename(f)]

test_files = files

rule_pred = []
for p in test_files:
    try:
        rule_pred.append(audio_rule_predict(p))
    except Exception as e:
        rule_pred.append(-1)
        
y_test = [parse_label(f) for f in test_files]
correct = sum(1 for p, y in zip(rule_pred, y_test) if p == y)
print(f'freq_rule: accuracy={correct/len(y_test):.4f} sample={correct}/{len(y_test)}')
