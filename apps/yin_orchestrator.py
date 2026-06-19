import os
import re
import glob
import math
import itertools
import numpy as np
from scipy.io import wavfile

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
    return int(m.group(2)) if m else None

def cent(f1, f2):
    if f1 > 0 and f2 > 0: return 1200 * math.log2(f1 / f2)
    return 9999.0

print("Pre-loading audio files...")
audio_cache = []
for f in sorted(glob.glob(os.path.join(SAMPLE_DIR, '*.wav'))):
    label = parse_label(f)
    if not label: continue
    sr, data = wavfile.read(f)
    if data.ndim > 1: data = data.mean(axis=1)
    if data.dtype.kind in 'iu': data = data.astype(np.float64) / np.iinfo(data.dtype).max
    else: data = data.astype(np.float64)
    audio_cache.append({'path': f, 'label': label, 'sr': sr, 'data': data})
print(f"Loaded {len(audio_cache)} files.")

def compute_yin(sig, sr, w_len, t_min, t_max, threshold):
    if len(sig) < w_len + t_max:
        return 0.0
        
    df = np.zeros(t_max)
    for tau in range(1, t_max):
        df[tau] = np.sum((sig[:w_len] - sig[tau:w_len+tau]) ** 2)
        
    cmndf = np.zeros(t_max)
    cmndf[0] = 1.0
    running_sum = 0.0
    for tau in range(1, t_max):
        running_sum += df[tau]
        cmndf[tau] = 1.0 if running_sum == 0 else df[tau] * tau / running_sum
            
    tau_estimate = -1
    for tau in range(t_min, t_max):
        if cmndf[tau] < threshold:
            while tau + 1 < t_max and cmndf[tau + 1] < cmndf[tau]:
                tau += 1
            tau_estimate = tau
            break
            
    if tau_estimate == -1:
        tau_estimate = t_min + np.argmin(cmndf[t_min:t_max])
        
    if 0 < tau_estimate < t_max - 1:
        alpha, beta, gamma = cmndf[tau_estimate - 1], cmndf[tau_estimate], cmndf[tau_estimate + 1]
        denom = alpha - 2 * beta + gamma
        if abs(denom) > 1e-12:
            tau_estimate += 0.5 * (alpha - gamma) / denom
            
    return sr / tau_estimate

grid = {
    'frame_ms': [20, 50, 100],
    'hop_ms': [10, 25, 50],
    'threshold': [0.1, 0.15, 0.2],
    'duration_ms': [300, 500, 800]
}

keys, values = zip(*grid.items())
combinations = [dict(zip(keys, v)) for v in itertools.product(*values)]
print(f"Total combinations: {len(combinations)}")

def evaluate_setup(config):
    correct = 0
    total_cents_error = 0.0
    
    frame_ms = config['frame_ms']
    hop_ms = config['hop_ms']
    threshold = config['threshold']
    duration_ms = config['duration_ms']
    
    for item in audio_cache:
        sr = item['sr']
        data = item['data']
        label = item['label']
        expected_f = RULES[label - 1][2]
        
        # Calculate t_min and t_max from known frequency bounds of the entire instrument (170Hz to 1100Hz)
        t_min = int(sr / 1200.0) 
        t_max = int(sr / 150.0)
        
        # Analyze the segment
        total_ms = len(data) / sr * 1000.0
        start_ms = max(0.0, (total_ms - duration_ms) / 2.0)
        end_ms = min(total_ms, start_ms + duration_ms)
        start = int(sr * start_ms / 1000.0)
        end = int(sr * end_ms / 1000.0)
        x = data[start:end]
        
        w_len = int(sr * frame_ms / 1000.0)
        hop_len = int(sr * hop_ms / 1000.0)
        
        freqs = []
        for i in range(0, len(x) - w_len - t_max, hop_len):
            f = compute_yin(x[i:i+w_len+t_max], sr, w_len, t_min, t_max, threshold)
            if f > 0: freqs.append(f)
            
        if not freqs:
            continue
            
        detected_freq = np.median(freqs)
        
        candidates = [(abs(cent(detected_freq, RULES[k-1][2])), k) for k in range(1, 33)]
        predicted_label = min(candidates)[1]
        
        if predicted_label == label: correct += 1
        total_cents_error += abs(cent(detected_freq, expected_f))
        
    return correct / len(audio_cache), total_cents_error / len(audio_cache)

results = []
for i, config in enumerate(combinations):
    acc, c_err = evaluate_setup(config)
    results.append({'config': config, 'acc': acc, 'cents_err': c_err})
    if (i + 1) % 10 == 0:
        print(f"Evaluated {i + 1}/{len(combinations)}...")

results.sort(key=lambda x: (-x['acc'], x['cents_err']))

print("\n--- TOP 10 CONFIGURATIONS (YIN) ---")
for i in range(10):
    r = results[i]
    cfg = r['config']
    print(f"Rank {i+1}: Accuracy: {r['acc']*100:.2f}% | Mean Error: {r['cents_err']:.2f} cents")
    print(f"          frame_ms={cfg['frame_ms']}, hop_ms={cfg['hop_ms']}, thresh={cfg['threshold']}, dur_ms={cfg['duration_ms']}")
