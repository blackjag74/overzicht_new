#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

PORT = 3000

# Sample data for testing monthly calculations
sample_bills = {
    "RegularAccounts": [
        {
            "ID": "1",
            "Rekening": "Electricity Bill",
            "Bedrag": "125.50",
            "Betaaldatum": "",
            "Volgende": "2025-01-15",
            "Info": "Monthly electricity payment",
            "Status": "Onbetaald"
        },
        {
            "ID": "2",
            "Rekening": "Internet Service",
            "Bedrag": "89.99",
            "Betaaldatum": "2024-12-10",
            "Volgende": "2025-01-10",
            "Info": "Fiber internet subscription",
            "Status": "Betaald"
        },
        {
            "ID": "3",
            "Rekening": "Water Bill",
            "Bedrag": "67.25",
            "Betaaldatum": "",
            "Volgende": "2025-01-20",
            "Info": "Monthly water usage",
            "Status": "Onbetaald"
        },
        {
            "ID": "4",
            "Rekening": "Gas Bill",
            "Bedrag": "89.30",
            "Betaaldatum": "",
            "Volgende": "2025-01-12",
            "Info": "Natural gas",
            "Status": "Onbetaald"
        }
    ]
}

sample_tasks = {
    "Taken": [
        {
            "ID": "1",
            "Taaknaam": "Review monthly budget",
            "Beschrijving": "Check all expenses",
            "Deadline": "2025-01-31",
            "Status": "Pending"
        }
    ]
}

sample_transactions = {
    "Transacties": []
}

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Handle PHP endpoints
        if parsed_path.path == '/get_rekeningen.php':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(sample_bills).encode())
            return
            
        elif parsed_path.path == '/get_taken.php':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(sample_tasks).encode())
            return
            
        elif parsed_path.path == '/get_transacties.php':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(sample_transactions).encode())
            return
        
        # Handle root path
        if parsed_path.path == '/':
            self.path = '/index.html'
        
        # Serve static files
        return super().do_GET()
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.shutdown()