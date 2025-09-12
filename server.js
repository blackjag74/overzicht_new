const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Sample data for PHP endpoints
const sampleData = {
    bills: {
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
    },
    tasks: {
        "Taken": [
            {
                "ID": "1",
                "Taaknaam": "Review monthly budget",
                "Beschrijving": "Check all expenses",
                "Deadline": "2025-01-31",
                "Status": "Pending"
            }
        ]
    },
    transactions: {
        "Transacties": []
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // Handle root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Handle PHP endpoints with JSON data
    if (pathname === '/get_rekeningen.php') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sampleData.bills));
        return;
    }
    
    if (pathname === '/get_taken.php') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sampleData.tasks));
        return;
    }
    
    if (pathname === '/get_transacties.php') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sampleData.transactions));
        return;
    }
    
    // Serve static files
    const filePath = path.join(__dirname, pathname);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
        
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});