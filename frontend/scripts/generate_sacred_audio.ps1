Add-Type -AssemblyName System.Speech

# Ensure output directories exist
$allahDir = "c:\IslamicPrayer\frontend\public\audio\allah"
$prophetDir = "c:\IslamicPrayer\frontend\public\audio\prophet"
if (!(Test-Path $allahDir)) { New-Item -ItemType Directory -Path $allahDir -Force }
if (!(Test-Path $prophetDir)) { New-Item -ItemType Directory -Path $prophetDir -Force }

# Function to generate clear male speech using Microsoft David Desktop (verified clear natural male voice)
function Generate-MaleVoiceWav {
    param(
        [string]$outputPath,
        [string]$spokenText
    )
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $voices = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Gender -eq "Male" }
    if ($voices -and $voices.Count -gt 0) {
        $synth.SelectVoice($voices[0].VoiceInfo.Name)
        Write-Host "Using Male Voice: $($voices[0].VoiceInfo.Name)"
    } else {
        $synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Male)
    }
    $synth.Rate = -1   # Slightly deliberate, clear, respectful pace
    $synth.Volume = 100

    $builder = New-Object System.Speech.Synthesis.PromptBuilder
    
    # Process text chunks with respectful pauses
    $sentences = $spokenText -split "\.\s+"
    foreach ($sentence in $sentences) {
        if ($sentence.Trim().Length -gt 0) {
            $builder.AppendText($sentence.Trim() + ".")
            $builder.AppendBreak([System.Speech.Synthesis.PromptBreak]::Medium)
        }
    }

    $synth.SetOutputToWaveFile($outputPath)
    $synth.Speak($builder)
    $synth.Dispose()
    Write-Host "Generated male audio at: $outputPath (Size: $((Get-Item $outputPath).Length) bytes)"
}

# 1. Allah Ta'ala Audio (Naam -> Respectful phrase -> Urdu meaning -> English meaning)
$allahText = "Allah Jalla Jalaluhu. Allah Ta'ala sab se buland aur azeem hai. Allah, Glorious and Exalted is He."
$allahWav = "$allahDir\allah_taala.wav"
Generate-MaleVoiceWav -outputPath $allahWav -spokenText $allahText

# 2. Huzur Muhammad ﷺ Audio (Naam -> Respectful phrase -> Urdu meaning -> English meaning)
$prophetText = "Muhammadur Rasoolullah Sallallahu Alaihi Wasallam. Huzur Muhammad Mustafa Sallallahu Alaihi Wasallam Allah ke aakhri Nabi aur Rasool hain. Muhammad, peace and blessings be upon him, is the final Prophet and Messenger of Allah."
$prophetWav = "$prophetDir\huzur_muhammad.wav"
Generate-MaleVoiceWav -outputPath $prophetWav -spokenText $prophetText

Write-Host "All sacred audio files generated successfully!"

