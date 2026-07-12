#!/usr/bin/env bash
# Quick smoke test for the backend once it's running (npm run dev in backend/).
# Usage: ./test-run.sh "Company Name"
# Requires: backend running on localhost:8787 (or set BASE_URL env var).

set -e
BASE_URL="${BASE_URL:-http://localhost:8787}"
COMPANY="${1:-Zomato}"

echo "Health check..."
curl -sf "$BASE_URL/health" && echo -e "\nOK\n"

echo "Running research for: $COMPANY"
curl -s -X POST "$BASE_URL/api/research" \
  -H "Content-Type: application/json" \
  -d "{\"companyName\": \"$COMPANY\"}" | python3 -m json.tool
