# Script to download face-api.js models required for face registration

$ModelsPath = "../interface/public/models"

# Create models directory if it doesn't exist
if (-not (Test-Path $ModelsPath)) {
    New-Item -ItemType Directory -Path $ModelsPath -Force
    Write-Host "✅ Created models directory: $ModelsPath"
} else {
    Write-Host "✅ Models directory already exists: $ModelsPath"
}

# Change to models directory
Push-Location $ModelsPath

Write-Host "📥 Downloading face-api.js models..."

# SSD Mobilenet Model (face detection)
Write-Host "Downloading SSD Mobilenet model..."
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-weights_manifest.json" -OutFile "ssd_mobilenetv1_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard1" -OutFile "ssd_mobilenetv1_model-shard1"
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard2" -OutFile "ssd_mobilenetv1_model-shard2"

# Face Landmark 68 Model (facial landmarks)
Write-Host "Downloading Face Landmark 68 model..."
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json" -OutFile "face_landmark_68_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1" -OutFile "face_landmark_68_model-shard1"

# Face Recognition Model (face descriptors)
Write-Host "Downloading Face Recognition model..."
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json" -OutFile "face_recognition_model-weights_manifest.json"
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1" -OutFile "face_recognition_model-shard1"
Invoke-WebRequest -Uri "https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard2" -OutFile "face_recognition_model-shard2"

# Go back to original directory
Pop-Location

Write-Host "✅ All face-api.js models downloaded successfully!"
Write-Host "📁 Models saved to: $ModelsPath"
Write-Host "🔍 Files:"
Get-ChildItem $ModelsPath | ForEach-Object { Write-Host "   - $($_.Name)" }

Write-Host "🚀 You can now use face-api.js for face detection and recognition!"
