# P-32E QC Sound Inspector

A professional inspection dashboard for real-time sound quality control on the P-32E instrument, designed for fast evaluation, visual feedback, and audio recording workflows.

## 🔎 Preview

### Inspection Page
![Inspection Preview](assets/ins_preview.png)

### Record Sample Page
![Record Sample Preview](assets/preview.png)

## ✨ Overview

This project combines a responsive web interface with live audio analysis, calibration rules, and recording support. It is built for QC operators who need a clear and reliable view of pitch, frequency, and inspection results in real time.

## 🎯 Highlights

- Real-time frequency and pitch analysis
- Visual inspection status for each key
- Calibration rule panel and inspection log
- Recording and auto-save support for WAV/MP3 samples
- Clean interface optimized for operator workflows

## 🧩 Main Structure

```text
INSPECTION/
├── apps/
│   ├── index_v4.html   # Main inspection interface
│   ├── record.html     # Recording and sample review page
│   ├── main_v4.js      # Core inspection logic
│   ├── style_v5.css    # UI styling
│   └── upload.php      # Auto-save backend
├── assets/             # Images and preview assets
└── sample/             # Saved sample recordings
```

## 🚀 How to Run

1. Start XAMPP or any local PHP server.
2. Open the project folder in your browser.
3. Launch the main interface from:

```text
http://localhost/INSPECTION/apps/index_v4.html
```

4. Use the recording page for sample capture and playback:

```text
http://localhost/INSPECTION/apps/record.html
```

## 🔧 Features

### Inspection Flow
- Start/stop live signal processing
- Reset and calibrate inspection states
- Monitor RMS, confidence, and frequency results

### Recording Workflow
- Capture audio samples directly from the browser
- Save files into the sibling sample folder
- Review and play saved recordings from the UI

## 💡 Recommended Use

This application is ideal for:
- QC inspection stations
- Sound validation and tuning checks
- Operator training and demonstration sessions

## 📌 Notes

- The sample storage path is intentionally placed at the project level for easier file access and management.
- The interface is designed to be simple, readable, and efficient for daily production use.

## 🏁 Summary

P-32E QC Sound Inspector provides a practical, polished, and professional tooling experience for real-time inspection and audio evidence collection.