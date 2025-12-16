#!/bin/bash
# verify_sprites.sh
# Verifies all required sprite files are in place

echo "🎨 Checking sprite files..."
echo ""

# Check emotions
echo "📋 Checking Emotions (24 files):"
emotions=("happy" "sad" "angry" "neutral" "excited" "thinking" "crying" "yelling" "fighting" "grateful" "jealous" "hurt" "embarrassed" "proud" "worried" "relieved" "surprised" "disappointed" "hopeful" "confused" "determined" "tired" "content")

found=0
missing=0
for emotion in "${emotions[@]}"; do
    if [ -f "assets/characters/emotions/${emotion}.png" ]; then
        echo "  ✅ ${emotion}.png"
        ((found++))
    else
        echo "  ❌ ${emotion}.png (MISSING)"
        ((missing++))
    fi
done

echo ""
echo "Emotions: ${found} found, ${missing} missing"
echo ""

# Check body language
echo "📋 Checking Body Language (28 files):"
poses=("standing" "sitting" "walking" "talking" "listening" "thinking" "explaining" "working" "typing" "reading" "presenting" "happy_pose" "sad_pose" "angry_pose" "defensive" "open" "crying_pose" "yelling_pose" "fighting_pose" "greeting" "handshake" "hugging" "pointing" "nodding" "shaking_head" "resting" "sleeping" "stretching")

found_poses=0
missing_poses=0
for pose in "${poses[@]}"; do
    if [ -f "assets/characters/body_language/${pose}.png" ]; then
        echo "  ✅ ${pose}.png"
        ((found_poses++))
    else
        echo "  ❌ ${pose}.png (MISSING)"
        ((missing_poses++))
    fi
done

echo ""
echo "Body Language: ${found_poses} found, ${missing_poses} missing"
echo ""

# Summary
total_found=$((found + found_poses))
total_missing=$((missing + missing_poses))
total_needed=52

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "  Total Found: ${total_found}/${total_needed}"
echo "  Total Missing: ${total_missing}/${total_needed}"
echo "  Progress: $((total_found * 100 / total_needed))%"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $total_missing -eq 0 ]; then
    echo "✅ All sprites are in place!"
else
    echo "⚠️  Some sprites are missing. See SPRITE_DOWNLOAD_SCRIPT.md for download instructions."
fi

