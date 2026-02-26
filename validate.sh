#!/bin/bash
# UI刷新 検証スクリプト
# 使い方: bash validate.sh

CSS_FILE="css/style.css"
CSS_NV="css/noteview.css"
JS_APP="js/app.js"
JS_PAGES="js/pages.js"
JS_NV="js/noteview.js"

echo "=============================="
echo "  UI刷新 残数カウント"
echo "=============================="
echo ""

# ハードコード色（hex）
HEX_CSS=$(grep -oP '#[0-9a-fA-F]{3,8}' "$CSS_FILE" "$CSS_NV" 2>/dev/null | grep -v '^\s*//' | wc -l)
HEX_JS=$(grep -oP '#[0-9a-fA-F]{3,8}' "$JS_APP" "$JS_PAGES" "$JS_NV" 2>/dev/null | wc -l)
echo "[色] ハードコードhex (CSS): $HEX_CSS 件"
echo "[色] ハードコードhex (JS):  $HEX_JS 件"

# ハードコード色（rgba）
RGBA_CSS=$(grep -oP 'rgba?\([^)]+\)' "$CSS_FILE" "$CSS_NV" 2>/dev/null | wc -l)
RGBA_JS=$(grep -oP 'rgba?\([^)]+\)' "$JS_APP" "$JS_PAGES" "$JS_NV" 2>/dev/null | wc -l)
echo "[色] ハードコードrgba (CSS): $RGBA_CSS 件"
echo "[色] ハードコードrgba (JS):  $RGBA_JS 件"

# CSS変数使用数
VAR_COUNT=$(grep -oP 'var\(--' "$CSS_FILE" "$CSS_NV" 2>/dev/null | wc -l)
echo "[色] CSS変数使用数: $VAR_COUNT 件"

echo ""

# 太ボーダー（2px以上）
THICK_BORDER=$(grep -P 'border[^:]*:\s*[2-9]px|border[^:]*:\s*[1-9][0-9]+px' "$CSS_FILE" "$CSS_NV" 2>/dev/null | wc -l)
echo "[ボーダー] 2px以上: $THICK_BORDER 件"

# 1pxボーダー
THIN_BORDER=$(grep -P 'border[^:]*:\s*1px' "$CSS_FILE" "$CSS_NV" 2>/dev/null | wc -l)
echo "[ボーダー] 1px: $THIN_BORDER 件"

echo ""

# グラデーション
GRADIENT=$(grep -c 'linear-gradient\|radial-gradient' "$CSS_FILE" "$CSS_NV" 2>/dev/null | awk -F: '{s+=$2} END {print s}')
echo "[グラデーション] 残数: $GRADIENT 件"

echo ""

# ファイル行数
echo "[ファイルサイズ]"
wc -l "$CSS_FILE" "$CSS_NV" "$JS_APP" "$JS_PAGES" "$JS_NV" 2>/dev/null | while read lines file; do
  echo "  $file: $lines 行"
done

echo ""
echo "=============================="
