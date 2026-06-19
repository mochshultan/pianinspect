import os
import re
import glob
import math
import itertools
from collections import defaultdict

import numpy as np
from scipy.io import wavfile
from scipy.signal import get_window

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SAMPLE_DIR = os.path.join(BASE, 'sample', 'el3')

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
    if not m: return None
    return int(m.group(2))

def cent(f1, f2):
    if f1 > 0 and f2 > 0:
        return 1200 * math.log2(f1 / f2)
    return 9999.0

print("Pre-loading audio files...")
audio_cache = []
files = sorted(glob.glob(os.path.join(SAMPLE_DIR, '*.wav')))
for f in files:
    label = parse_label(f)
    if label is None: continue
    sr, data = wavfile.read(f)
    if data.ndim > 1: data = data.mean(axis=1)
    if data.dtype.kind in 'iu': data = data.astype(np.float64) / np.iinfo(data.dtype).max
    else: data = data.astype(np.float64)
    expected_freq = RULES[label - 1][2]
    audio_cache.append({
        'path': f, 'label': label, 'expected_freq': expected_freq, 'sr': sr, 'data': data
    })
print(f"Loaded {len(audio_cache)} files.")

grid = {
    'window_ms': [100, 200, 350, 500, 800],
    'nfft': [8192, 16384, 32768, 65536],
    'window_type': ['boxcar', 'hann', 'blackman', 'hamming'],
    'interp': ['none', 'parabolic', 'gaussian']
}

keys, values = zip(*grid.items())
combinations = [dict(zip(keys, v)) for v in itertools.product(*values)]
print(f"Total combinations to evaluate: {len(combinations)}")

def evaluate_setup(config):
    correct = 0
    total_cents_error = 0.0
    
    window_ms = config['window_ms']
    nfft = config['nfft']
    wtype = config['window_type']
    interp = config['interp']
    
    for item in audio_cache:
        sr = item['sr']
        data = item['data']
        label = item['label']
        expected_f = item['expected_freq']
        
        total_ms = len(data) / sr * 1000.0
        start_ms = max(0.0, (total_ms - window_ms) / 2.0)
        end_ms = min(total_ms, start_ms + window_ms)
        start = int(sr * start_ms / 1000.0)
        end = int(sr * end_ms / 1000.0)
        x = data[start:end]
        
        if len(x) == 0: continue
            
        if wtype != 'boxcar':
            win = get_window(wtype, len(x))
            x = x * win
            
        if nfft > len(x): x = np.pad(x, (0, nfft - len(x)))
        elif nfft > 0 and nfft < len(x): x = x[:nfft]
            
        spec = np.fft.rfft(x)
        mag = np.abs(spec) 
        if np.max(mag) > 0:
            mag = mag / np.max(mag)
        freqs = np.fft.rfftfreq(len(x), d=1.0 / sr)
        hz_per_bin = sr / len(x)
        
        best_band = None
        for r in RULES:
            fmin, fmax = r[3], r[4]
            # expand the band slightly to ensure we capture the peak properly (e.g. +/- 5Hz)
            start_bin = max(0, int(math.floor((fmin - 5) / hz_per_bin)))
            end_bin = min(len(mag) - 1, int(math.ceil((fmax + 5) / hz_per_bin)))
            if start_bin >= end_bin: continue
                
            band_energy = 0.0
            band_peak = 0.0
            band_peak_bin = start_bin
            for i in range(start_bin, end_bin + 1):
                amp = mag[i]
                band_energy += amp * amp
                if amp > band_peak:
                    band_peak = amp
                    band_peak_bin = i
                    
            score = band_energy + band_peak * 30.0
            if best_band is None or score > best_band['score']:
                best_band = {'bin': band_peak_bin, 'peak': band_peak, 'score': score}
        
        if best_band is None or best_band['peak'] <= 0:
            continue
            
        peak = best_band['bin']
        if peak == 0 or peak >= len(mag) - 1:
            detected_freq = freqs[peak]
        else:
            a, b, c = mag[peak - 1], mag[peak], mag[peak + 1]
            if interp == 'parabolic':
                d = a - 2 * b + c
                p = 0.5 * (a - c) / d if abs(d) > 1e-12 else 0.0
                detected_freq = freqs[peak] + p * (freqs[1] - freqs[0])
            elif interp == 'gaussian':
                a_log = math.log(max(a, 1e-12))
                b_log = math.log(max(b, 1e-12))
                c_log = math.log(max(c, 1e-12))
                d = a_log - 2 * b_log + c_log
                p = 0.5 * (a_log - c_log) / d if abs(d) > 1e-12 else 0.0
                detected_freq = freqs[peak] + p * (freqs[1] - freqs[0])
            else:
                detected_freq = freqs[peak]
                
        # To decide if it is correct, check nearest rule by cents
        candidates = [(abs(cent(detected_freq, RULES[k-1][2])), k) for k in range(1, 33)]
        predicted_label = min(candidates)[1]
        if predicted_label == label:
            correct += 1
            
        total_cents_error += abs(cent(detected_freq, expected_f))
        
    accuracy = correct / len(audio_cache)
    mean_cents_error = total_cents_error / len(audio_cache)
    return accuracy, mean_cents_error

results = []
for i, config in enumerate(combinations):
    acc, c_err = evaluate_setup(config)
    results.append({'config': config, 'acc': acc, 'cents_err': c_err})
    if (i + 1) % 40 == 0:
        print(f"Evaluated {i + 1}/{len(combinations)} configurations...")

results.sort(key=lambda x: (-x['acc'], x['cents_err']))

print("\n--- TOP 10 CONFIGURATIONS ---")
for i in range(10):
    r = results[i]
    cfg = r['config']
    print(f"Rank {i+1}: Accuracy: {r['acc']*100:.2f}% | Mean Error: {r['cents_err']:.2f} cents")
    print(f"          window_ms={cfg['window_ms']}, nfft={cfg['nfft']}, window={cfg['window_type']}, interp={cfg['interp']}")

