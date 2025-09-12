<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Fetch all records from the 'transacties' table
$sql = "SELECT * FROM Transacties ORDER BY transaction_date DESC LIMIT 10";
$result = $conn->query($sql);

// Initialize array for transacties
$transacties = [];

// Fetch the results into an array
while ($row = $result->fetch_assoc()) {
    $transacties[] = $row;
}

// Combine the results into a single response
$response = [
    "Transacties" => $transacties
];

// Set the content type to JSON
header('Content-Type: application/json');

// Return the results as a JSON response
echo json_encode($response);

// Close the database connection
$conn->close();
?>