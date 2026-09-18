Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft David Desktop")
$synth.SetOutputToWaveFile("c:\IslamicPrayer\frontend\public\audio\allah\test_david.wav")
$synth.Speak("Allah Ta'ala. English Meaning: Allah, the Most High and Most Exalted. Urdu Meaning: Allah sab se buland aur sab se paak hai.")
$synth.Dispose()
Write-Host "Success generating audio!"
