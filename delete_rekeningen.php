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

// Get the rekening ID from the query string
$rekeningId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($rekeningId > 0) {
    // Fetch the rekening name from the ID
    $sql = "SELECT rekening FROM rekeningen WHERE id = $rekeningId";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $rekeningName = $row['rekening'];

    // Prepare the SQL statement to delete the rekening
    $stmt = $conn->prepare("DELETE FROM rekeningen WHERE id = ?");
    $stmt->bind_param("i", $rekeningId); // Bind the rekening ID

    // Execute the statement
    if ($stmt->execute()) {
        // Insert into Transacties
        $transactionDate = date('Y-m-d H:i:s');
        $description = 'deleted';
        $amount = 0;
        $t_afspraakdatum = '';
        $r_betaaldatum = '';
        $taak = '';

        $transactiesStmt = $conn->prepare("INSERT INTO Transacties (rekening, taak, transaction_date, amount, t_afspraakdatum, r_betaaldatum, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $transactiesStmt->bind_param("sssssss", $rekeningName, $taak, $transactionDate, $amount, $t_afspraakdatum, $r_betaaldatum, $description);
        $transactiesStmt->execute();

        echo json_encode(["message" => "Rekening deleted successfully"]);
    } else {
        echo json_encode(["error" => "Error deleting rekening: " . $stmt->error]);
    }

    $stmt->close(); // Close the statement
} else {
    echo json_encode(["error" => "Invalid rekening ID"]);
}

$conn->close(); // Close the database connection
?>