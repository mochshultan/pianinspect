import os
import re
import glob
import numpy as np
import librosa
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
from scipy.signal import medfilt

sample_dir = r"c:\xampp\htdocs\INSPECTION\sample\el3"
out_dir = r"c:\xampp\htdocs\INSPECTION\laporan"
os.makedirs(out_dir, exist_ok=True)

# -------------------------------------------------------------------
# 1. GENERATE OK/NG CONFUSION MATRIX (chart_c_confusion_matrix.png)
# -------------------------------------------------------------------
print("Generating OK/NG Confusion Matrix...")
el3_rules = {
    1: [176.3, 176, 176.6], 2: [186.25, 186.2, 186.3], 3: [197.2, 197.1, 197.3],
    4: [208.95, 208.7, 209.2], 5: [221.45, 221.4, 221.5], 6: [234.5, 234.4, 234.6],
    7: [248.5, 248.4, 248.6], 8: [263.25, 263.1, 263.4], 9: [279.7, 279.2, 280.2],
    10: [296.05, 295.5, 296.6], 11: [313.65, 313.1, 314.2], 12: [332.4, 331.9, 332.9],
    13: [351.6, 351.1, 352.1], 14: [372.2, 372.1, 372.3], 15: [394.4, 394.3, 394.5],
    16: [417.85, 417.7, 418], 17: [442.7, 442.5, 442.9], 18: [468.7, 468.6, 468.8],
    19: [497, 496.7, 497.3], 20: [526.5, 526.1, 526.9], 21: [557.65, 557.5, 557.8],
    22: [590.7, 590.5, 590.9], 23: [624.4, 623.3, 625.5], 24: [662.65, 662.5, 662.8],
    25: [701.6, 701.1, 702.1], 26: [743.95, 743.4, 744.5], 27: [788.15, 787.9, 788.4],
    28: [835.1, 835, 835.2], 29: [884.8, 884.1, 885.5], 30: [937.65, 937.15, 938.15],
    31: [993.25, 993, 993.5], 32: [1051.95, 1051.45, 1052.45]
}

y_true = []
y_pred = []

files = [f for f in os.listdir(sample_dir) if f.endswith('.wav') and ('_OK' in f or '_NG' in f)]

for f in files:
    match = re.search(r'\((\d+)\)', f)
    if not match: continue
    key_idx = int(match.group(1))
    if key_idx not in el3_rules: continue
        
    _, fmin, fmax = el3_rules[key_idx]
    filepath = os.path.join(sample_dir, f)
    y, sr = librosa.load(filepath, sr=None)
    
    f0 = librosa.yin(y, fmin=150, fmax=1200, sr=sr, frame_length=2048)
    start_idx = int(len(f0) * 0.3)
    end_idx = int(len(f0) * 0.7)
    stable_f0 = f0[start_idx:end_idx] if end_idx > start_idx else f0
    median_f0 = np.median(stable_f0)
    
    tolerance = 0.5 
    pred = 1 if (median_f0 >= (fmin - tolerance) and median_f0 <= (fmax + tolerance)) else 0
    actual = 1 if '_OK' in f else 0
    
    y_pred.append(pred)
    y_true.append(actual)

cm = confusion_matrix(y_true, y_pred, labels=[1, 0])

plt.figure(figsize=(6, 5))
# --- EDIT JUDUL/LABEL GRAFIK 1 DI SINI ---
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Predict OK', 'Predict NG'], yticklabels=['Actual OK', 'Actual NG'])
plt.title('Confusion Matrix Verdict', fontsize=14, fontweight='bold', pad=15)
plt.ylabel('Ground Truth', fontsize=12)
plt.xlabel('System Prediction', fontsize=12)
# -----------------------------------------
plt.tight_layout()
plt.savefig(os.path.join(out_dir, 'chart_c_confusion_matrix.png'), dpi=150)
plt.close()

print("OK/NG Confusion Matrix saved as chart_c_confusion_matrix.png")

# -------------------------------------------------------------------
# 2. GENERATE PITCH CORRELATION MATRIX (chart_a2_pitch_matrix.png)
# -------------------------------------------------------------------
print("Generating Pitch Correlation Matrix...")
key_names = ['F3','F#3','G3','G#3','A3','A#3','B3','C4','C#4','D4','D#4','E4',
             'F4','F#4','G4','G#4','A4','A#4','B4','C5','C#5','D5','D#5','E5',
             'F5','F#5','G5','G#5','A5','A#5','B5','C6']

matrix_pitch = np.zeros((32, 32))

for f in files:
    match = re.search(r'\((\d+)\)', f)
    if not match: continue
    true_index = int(match.group(1))
    
    filepath = os.path.join(sample_dir, f)
    y, sr = librosa.load(filepath, sr=None)
    f0 = librosa.yin(y, fmin=150, fmax=1200, sr=sr, frame_length=2048)
    f0_smooth = medfilt(f0, kernel_size=21)
    
    start = int(len(f0_smooth) * 0.2)
    end = int(len(f0_smooth) * 0.8)
    median_pitch = np.median(f0_smooth[start:end])
    
    midi_note = librosa.hz_to_midi(median_pitch)
    pred_index = int(round(midi_note)) - 53 + 1
    pred_index = max(1, min(32, pred_index))
    
    matrix_pitch[true_index-1, pred_index-1] += 1

plt.figure(figsize=(10, 8))
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.family'] = 'sans-serif'
cmap = sns.color_palette("Blues", as_cmap=True)

# --- EDIT JUDUL/LABEL GRAFIK 2 DI SINI ---
sns.heatmap(matrix_pitch, cmap=cmap, linewidths=0.5, linecolor='lightgray', 
            xticklabels=key_names, yticklabels=key_names, cbar_kws={'label': 'Jumlah Sampel'})

plt.title('Confusion Matrix YIN', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Prediksi Nada (Algoritma YIN)', fontsize=12, labelpad=10)
plt.ylabel('Nada Aktual (Ground Truth)', fontsize=12, labelpad=10)
# -----------------------------------------

plt.tight_layout()
plt.savefig(os.path.join(out_dir, 'chart_a2_pitch_matrix.png'), dpi=300, bbox_inches='tight')
plt.close()

print("Pitch Matrix saved as chart_a2_pitch_matrix.png")
print("All matrices generated successfully!")
