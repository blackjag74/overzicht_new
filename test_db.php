<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing database connection...\n";

$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

if ($conn->connect_error) {
    echo "Connection failed: " . $conn->connect_error . "\n";
    exit(1);
}

echo "Database connected successfully!\n";

// Test rekeningen table
$sql = "SELECT COUNT(*) as count FROM rekeningen";
$result = $conn->query($sql);
if ($result) {
    $row = $result->fetch_assoc();
    echo "Rekeningen table has " . $row['count'] . " records\n";
} else {
    echo "Error querying rekeningen: " . $conn->error . "\n";
}

// Test taken table
$sql = "SELECT COUNT(*) as count FROM taken";
$result = $conn->query($sql);
if ($result) {
    $row = $result->fetch_assoc();
    echo "Taken table has " . $row['count'] . " records\n";
} else {
    echo "Error querying taken: " . $conn->error . "\n";
}

$conn->close();
echo "Test completed.\n";
?>