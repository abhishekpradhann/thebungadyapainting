#!/usr/bin/env python3
import http.server
import os

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.dzi': 'text/xml',        # critical: OSD rejects .dzi served as octet-stream
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.js':  'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.html': 'text/html',
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, format, *args):
        pass  # suppress request logs

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Server running at http://localhost:8765")
http.server.HTTPServer(("", 8765), Handler).serve_forever()
