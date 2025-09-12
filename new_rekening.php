<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO rekeningen (rekening, bedrag, periode, status, betaaldatum, volgende, kenmerk, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssss", 
    $data['Rekening'], 
    $data['Bedrag'], 
    $data['Periode'], 
    $data['Status'], 
    date('Y-m-d', strtotime($data['Betaaldatum'])), // Convert date to YYYY-MM-DD format
    $data['Volgende'],
    $data['Kenmerk'],
    $data['URL']
);

// Execute the statement
if ($stmt->execute()) {
    echo json_encode(["message" => "Rekening created successfully"]);
} else {
    echo json_encode(["error" => "Error: " . $stmt->error]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>