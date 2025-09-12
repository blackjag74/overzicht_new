# Simple PowerShell HTTP Server
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:3000/')
$listener.Start()

Write-Host "Server started at http://localhost:3000/"
Write-Host "Press Ctrl+C to stop the server"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        if ($url -eq '/') { $url = '/index.html' }
        
        # Handle PHP endpoints with JSON data
        if ($url -eq '/get_rekeningen.php') {
            $jsonData = @'
{
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
'@
            $response.StatusCode = 200
            $response.ContentType = 'application/json; charset=utf-8'
            $response.Headers.Add('Access-Control-Allow-Origin', '*')
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonData)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }
        
        if ($url -eq '/get_taken.php') {
            $jsonData = @'
{
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
'@
            $response.StatusCode = 200
            $response.ContentType = 'application/json; charset=utf-8'
            $response.Headers.Add('Access-Control-Allow-Origin', '*')
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonData)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }
        
        if ($url -eq '/get_transacties.php') {
            $jsonData = @'
{
  "Transacties": []
}
'@
            $response.StatusCode = 200
            $response.ContentType = 'application/json; charset=utf-8'
            $response.Headers.Add('Access-Control-Allow-Origin', '*')
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonData)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }
        
        $filePath = Join-Path $PWD $url.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $response.ContentType = switch ([System.IO.Path]::GetExtension($filePath)) {
                '.html' { 'text/html; charset=utf-8' }
                '.css' { 'text/css; charset=utf-8' }
                '.js' { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.svg' { 'image/svg+xml' }
                default { 'text/plain; charset=utf-8' }
            }
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $notFound = "404 - File Not Found: $url"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFound)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
}