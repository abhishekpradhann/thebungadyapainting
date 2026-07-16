#!/bin/zsh
# Double-click this file to start the Bunga Dya website and open it in your browser.
cd "$(dirname "$0")"

if ! lsof -nP -iTCP:8765 -sTCP:LISTEN >/dev/null 2>&1; then
  /usr/bin/env python3 server.py >/dev/null 2>&1 &
  # give the server a moment to start
  for i in 1 2 3 4 5 6 7 8 9 10; do
    lsof -nP -iTCP:8765 -sTCP:LISTEN >/dev/null 2>&1 && break
    sleep 0.3
  done
  echo "Server started at http://localhost:8765"
else
  echo "Server is already running at http://localhost:8765"
fi

open "http://localhost:8765"
echo "You can close this window."
