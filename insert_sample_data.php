<?php
// Insert sample data for testing
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Inserting sample data...\n";

// Clear existing data
$conn->query("DELETE FROM rekeningen");
echo "Cleared existing bills\n";

// Insert sample bills
$sampleBills = [
    ['Electricity Bill', '125.50', 'Maandelijks', 'Onbetaald', '', '2025-01-15', 'Monthly electricity payment', ''],
    ['Internet Service', '89.99', 'Maandelijks', 'Betaald', '2024-12-10', '2025-01-10', 'Fiber internet subscription', ''],
    ['Water Bill', '67.25', 'Maandelijks', 'Onbetaald', '', '2025-01-20', 'Monthly water usage', ''],
    ['Gas Bill', '89.30', 'Maandelijks', 'Onbetaald', '', '2025-01-12', 'Natural gas', '']
];

$stmt = $conn->prepare("INSERT INTO rekeningen (rekening, bedrag, periode, status, betaaldatum, volgende, kenmerk, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

foreach ($sampleBills as $bill) {
    $stmt->bind_param("ssssssss", $bill[0], $bill[1], $bill[2], $bill[3], $bill[4], $bill[5], $bill[6], $bill[7]);
    if ($stmt->execute()) {
        echo "Inserted: " . $bill[0] . "\n";
    } else {
        echo "Error inserting " . $bill[0] . ": " . $stmt->error . "\n";
    }
}

$stmt->close();

// Verify insertion
$result = $conn->query("SELECT COUNT(*) as count FROM rekeningen");
$row = $result->fetch_assoc();
echo "Total bills in database: " . $row['count'] . "\n";

// Show all bills
$result = $conn->query("SELECT id, rekening, bedrag, status FROM rekeningen");
echo "\nBills in database:\n";
while ($row = $result->fetch_assoc()) {
    echo "ID: " . $row['id'] . ", Name: " . $row['rekening'] . ", Amount: " . $row['bedrag'] . ", Status: " . $row['status'] . "\n";
}

$conn->close();
echo "\nSample data insertion completed!\n";
?>