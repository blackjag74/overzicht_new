<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get the JSON input
$data = json_decode(file_get_contents('php://input'), true);
file_put_contents('log.txt', print_r($data, true)); // Log the incoming data

$stmt = $conn->prepare("DELETE from rekeningen");
$stmt->execute();

// Check if data is an array
if (isset($data['Rekeningen']) && is_array($data['Rekeningen'])) {
    foreach ($data['Rekeningen'] as $rekening) {
        // Check for required fields
        if (empty($rekening['Rekening']) || empty($rekening['Periode']) || empty($rekening['Betaaldatum']) || empty($rekening['Status']) || !isset($rekening['Bedrag'])) {
            die(json_encode(["error" => "Missing required fields"]));
        }

        // Prepare and bind
        $stmt = $conn->prepare("INSERT INTO rekeningen (rekening, periode, betaaldatum, status, bedrag, volgende, url) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if ($stmt === false) {
            die(json_encode(["error" => "Prepare failed: " . $conn->error]));
        }
        $stmt->bind_param("ssssdss", 
            $rekening['Rekening'], 
            $rekening['Periode'], 
            $rekening['Betaaldatum'],
            $rekening['Status'], 
            $rekening['Bedrag'], 
            $rekening['Volgende'],
            $rekening['URL']
        );

        // Execute the statement
        if (!$stmt->execute()) {
            file_put_contents('log.txt', "Error: " . $stmt->error . "\n", FILE_APPEND);
            echo json_encode(["error" => "Error: " . $stmt->error]);
            return; // Exit on error
        }
    }
    echo json_encode(["message" => "Rekeningen imported successfully"]);
} else {
    echo json_encode(["error" => "Invalid input data"]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>