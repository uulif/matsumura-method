#!/bin/bash
# Phase実装前の前提条件チェック
# 使い方: bash phase-check.sh [phase番号]
# 例: bash phase-check.sh 1

PHASE=$1

if [ -z "$PHASE" ]; then
  echo "使い方: bash phase-check.sh [1|2|3|4]"
  exit 1
fi

echo "=============================="
echo "  Phase $PHASE 実装前チェック"
echo "=============================="
echo ""

PASS=0
FAIL=0

check() {
  if [ "$1" = "ok" ]; then
    echo "  [OK] $2"
    PASS=$((PASS+1))
  else
    echo "  [NG] $2"
    FAIL=$((FAIL+1))
  fi
}

# 共通チェック: 設計書の存在
case $PHASE in
  1)
    [ -f "UI刷新_Phase1_トークン基盤.md" ] && check "ok" "Phase 1 設計書あり" || check "ng" "Phase 1 設計書なし"
    ;;
  2)
    [ -f "UI刷新_Phase2_部品.md" ] && check "ok" "Phase 2 部品設計書あり" || check "ng" "Phase 2 部品設計書なし"
    [ -f "UI刷新_Phase2_操作動き.md" ] && check "ok" "Phase 2 操作動き設計書あり" || check "ng" "Phase 2 操作動き設計書なし"
    # 前Phaseレポート確認
    [ -f "UI刷新_Phase1_レポート.md" ] && check "ok" "Phase 1 レポートあり" || check "ng" "Phase 1 レポートなし（前Phase未完了？）"
    ;;
  3)
    [ -f "UI刷新_Phase3_画面UX.md" ] && check "ok" "Phase 3 画面UX設計書あり" || check "ng" "Phase 3 画面UX設計書なし"
    [ -f "UI刷新_Phase3_書く体験.md" ] && check "ok" "Phase 3 書く体験設計書あり" || check "ng" "Phase 3 書く体験設計書なし"
    [ -f "UI刷新_Phase2_レポート.md" ] && check "ok" "Phase 2 レポートあり" || check "ng" "Phase 2 レポートなし（前Phase未完了？）"
    ;;
  4)
    [ -f "UI刷新_Phase4_品質保証.md" ] && check "ok" "Phase 4 設計書あり" || check "ng" "Phase 4 設計書なし"
    [ -f "UI刷新_Phase3_レポート.md" ] && check "ok" "Phase 3 レポートあり" || check "ng" "Phase 3 レポートなし（前Phase未完了？）"
    ;;
esac

# 共通チェック: 未commitの変更がないか
if git diff --quiet && git diff --cached --quiet; then
  check "ok" "未commitの変更なし"
else
  check "ng" "未commitの変更あり（先にcommitしてください）"
fi

# 共通チェック: 復元タグの存在
if git tag -l | grep -q "pre-ui-refresh"; then
  check "ok" "復元タグ pre-ui-refresh あり"
else
  check "ng" "復元タグなし（復元できません）"
fi

echo ""
echo "結果: OK=$PASS / NG=$FAIL"
if [ $FAIL -gt 0 ]; then
  echo "→ NGがあります。解消してから実装を開始してください。"
  exit 1
else
  echo "→ 全てOK。実装を開始できます。"
  exit 0
fi
