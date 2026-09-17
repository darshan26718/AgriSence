#!/usr/bin/env python3
"""
AgriSense Python Agricultural Backend Service
Zero external dependencies required - runs natively on Python 3.8+ standard library.
"""

import sys
import os
import json
import argparse
import mimetypes
from urllib.parse import urlparse, parse_qs
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

# Add backend directory to path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from routes import handle_request

WORKSPACE_ROOT = os.path.dirname(BACKEND_DIR)
DIST_DIR = os.path.join(WORKSPACE_ROOT, "dist")


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class AgriRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format, *args):
        sys.stderr.write(f"[Python-Backend] {self.address_string()} - [{self.log_date_time_string()}] {format % args}\n")

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("X-Powered-By", "AgriSense-Python-Engine/3.10")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query_params = parse_qs(parsed.query)

        # If it's an API route
        if path.startswith("/api/"):
            status_code, response_data = handle_request("GET", path, query_params, {})
            self._send_json_response(status_code, response_data)
            return

        # If serving static files in standalone mode
        if getattr(self.server, "serve_static", False):
            self._serve_static_file(path)
            return

        self._send_json_response(404, {"error": "Not Found", "path": path})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query_params = parse_qs(parsed.query)

        content_length = int(self.headers.get("Content-Length", 0))
        body = {}
        if content_length > 0:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                body = json.loads(raw_body)
            except Exception:
                body = {}

        if path.startswith("/api/"):
            status_code, response_data = handle_request("POST", path, query_params, body)
            self._send_json_response(status_code, response_data)
            return

        self._send_json_response(404, {"error": "Not Found", "path": path})

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query_params = parse_qs(parsed.query)

        if path.startswith("/api/"):
            status_code, response_data = handle_request("DELETE", path, query_params, {})
            self._send_json_response(status_code, response_data)
            return

        self._send_json_response(404, {"error": "Not Found", "path": path})

    def _send_json_response(self, status_code: int, data: any):
        json_bytes = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(json_bytes)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json_bytes)

    def _serve_static_file(self, path: str):
        if not os.path.exists(DIST_DIR):
            self._send_json_response(404, {"error": "Dist directory not found. Please run 'npm run build' first."})
            return

        rel_path = path.lstrip("/") or "index.html"
        full_path = os.path.join(DIST_DIR, rel_path)

        # SPA Fallback
        if not os.path.exists(full_path) or os.path.isdir(full_path):
            full_path = os.path.join(DIST_DIR, "index.html")

        if not os.path.exists(full_path):
            self._send_json_response(404, {"error": "Static file not found"})
            return

        content_type, _ = mimetypes.guess_type(full_path)
        content_type = content_type or "application/octet-stream"

        with open(full_path, "rb") as f:
            content = f.read()

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(content)


def main():
    parser = argparse.ArgumentParser(description="AgriSense Python Agricultural Server")
    parser.add_argument("--port", type=int, default=5050, help="Port to bind (default: 5050)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface (default: 0.0.0.0)")
    parser.add_argument("--serve-static", action="store_true", help="Serve frontend build from dist/")
    args = parser.parse_args()

    server = ThreadedHTTPServer((args.host, args.port), AgriRequestHandler)
    server.serve_static = args.serve_static

    print(f"[Python Backend] Agricultural AI Service running on http://{args.host}:{args.port}")
    print(f"[Python Backend] Serving 20 REST API endpoints with Agricultural Advisory Logic")
    if args.serve_static:
        print(f"[Python Backend] Serving frontend static assets from {DIST_DIR}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Python Backend] Shutting down cleanly...")
        server.server_close()


if __name__ == "__main__":
    main()
