<?php
/**
 * P-32E QC - Auto-Save WAV Backend
 * Menerima file rekaman dari record.html dan menyimpannya ke folder ../sample/el3 atau ../sample/el4
 */

// Pastikan request adalah POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Cek ketersediaan file dan parameter
    if (isset($_FILES['audio']) && isset($_POST['folder']) && isset($_POST['filename'])) {
        
        // Keamanan: Bersihkan nama folder dan file agar tidak ada injeksi path
        $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['folder']); 
        $filename = preg_replace('/[^a-zA-Z0-9_\(\)\.-]/', '', $_POST['filename']);
        
        // Tentukan jalur tujuan akhir
        $targetDir = "../sample/" . $folder . "/";
        
        // Buat direktori jika belum ada
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }
        
        $targetFile = $targetDir . $filename;
        
        // Pindahkan file dari penyimpanan sementara (tmp) ke jalur tujuan
        if (move_uploaded_file($_FILES['audio']['tmp_name'], $targetFile)) {
            echo "Success: File saved to " . $targetFile;
        } else {
            http_response_code(500);
            echo "Error: Failed to save file.";
        }
    } else {
        http_response_code(400);
        echo "Error: Missing parameters.";
    }
} else {
    http_response_code(405);
    echo "Error: Method Not Allowed.";
}
?>