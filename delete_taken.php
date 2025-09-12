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

// Get the task ID from the query string
$taskId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($taskId > 0) {
    // Get the task name from the taken table
    $taskStmt = $conn->prepare("SELECT Taaknaam FROM taken WHERE id = ?");
    $taskStmt->bind_param("i", $taskId);
    $taskStmt->execute();
    $taskResult = $taskStmt->get_result();
    $taskRow = $taskResult->fetch_assoc();
    $taskName = $taskRow['Taaknaam'];

    // Prepare the SQL statement to delete the task
    $stmt = $conn->prepare("DELETE FROM taken WHERE id = ?");
    $stmt->bind_param("i", $taskId); // Bind the task ID

    // Execute the statement
    if ($stmt->execute()) {
        // Insert into Transacties
        $transactionDate = date('Y-m-d H:i:s');
        $description = 'deleted';
        $amount = '';
        $t_afspraakdatum = '';
        $r_betaaldatum = '';
        $taak = $taskName;
        $rekeningName = '';

        $transactiesStmt = $conn->prepare("INSERT INTO Transacties (rekening, taak, transaction_date, amount, t_afspraakdatum, r_betaaldatum, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $transactiesStmt->bind_param("sssssss", $rekeningName, $taak, $transactionDate, $amount, $t_afspraakdatum, $r_betaaldatum, $description);    

        if (!$transactiesStmt->execute()) {
            echo "Error: " . $conn->error;
        } else {
            echo "Insert into Transacties successful";
        }

        echo json_encode(["message" => "Task deleted successfully"]);
    } else {
        echo json_encode(["error" => "Error deleting task: " . $stmt->error]);
    }

    $stmt->close(); // Close the statement
} else {
    echo json_encode(["error" => "Invalid task ID"]);
}

$conn->close(); // Close the database connection
?>