<?php
// Set the content type to JSON first
header('Content-Type: application/json');

// Enable error reporting for debugging but don't display errors
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Database connection
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// SQL query to fetch all records from the 'taken' table
$sql = "SELECT * FROM taken ORDER BY Afspraakdatum DESC";
$result = $conn->query($sql);

// Check if the query was successful
if (!$result) {
    die(json_encode(["error" => "Query failed: " . $conn->error]));
}

// Fetch the results into an array
$Taken = [];
while ($row = $result->fetch_assoc()) {
    $Taken[] = $row;
}

// Log the fetched data for debugging (optional)
file_put_contents('log.txt', print_r($Taken, true));

// Return the results as a JSON response
echo json_encode(["Taken" => $Taken]);

// Close the database connection
$conn->close();
?>