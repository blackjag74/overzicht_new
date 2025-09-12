<?php
include 'log.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON input
$data = json_decode(file_get_contents('php://input'), true); // Get the JSON data from the request

echo "Data: ";
print_r($data);

if (is_array($data)) {
    $changedTaskId = $data['changedTaskId']; // Get the ID of the changed task from the JSON data
    echo "Changed Task ID: ";
    echo $changedTaskId;

    $tasks = $data['tasks']; // Get the tasks from the JSON data
    echo "Tasks: ";
    print_r($tasks);

    foreach ($tasks as $task) {
        // Extract task details
        $id = $conn->real_escape_string($task["id"]);
        $taak = $conn->real_escape_string($task["Taaknaam"]);
        $afspraakdatum = $conn->real_escape_string($task["Afspraakdatum"]);
        $status = $conn->real_escape_string($task["Status"]);
        $info = $conn->real_escape_string($task["Info"]);

        // Prepare the SQL statement
        $stmt = $conn->prepare("UPDATE taken SET Afspraakdatum=?, Status=?, Taaknaam=?, Info=? WHERE id=?");
        $stmt->bind_param("ssssi", $afspraakdatum, $status, $taak, $info, $id);

        // Log the SQL statement (for debugging)
        echo json_encode(["sql" => "UPDATE taken SET Afspraakdatum='$afspraakdatum', Status='$status', Taaknaam='$taak', Info='$info' WHERE id='$id'"]);

        // Execute the statement
        if ($stmt->execute()) {
            if ($id == $changedTaskId) { // Only insert transaction if the ID matches the changed task ID
                $transactionDate = date('Y-m-d H:i:s');
                $description = 'updated';
                $amount = '';
                $r_betaaldatum = '';
                $t_afspraakdatum = $afspraakdatum;
                $rekeningName = ''; // Set rekening to empty string for tasks

                $transactiesStmt = $conn->prepare("INSERT INTO Transacties (rekening, taak, transaction_date, amount, t_afspraakdatum, r_betaaldatum, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $transactiesStmt->bind_param("sssssss", $rekeningName, $taak, $transactionDate, $amount, $t_afspraakdatum, $r_betaaldatum, $description);    
            
                if ($transactiesStmt->execute()) {
                    echo "Insert into Transacties successful";
                } else {
                    echo "Error: " . $transactiesStmt->error;
                }
            }
            echo json_encode(["message" => "Task updated successfully"]);
        } else {
            echo json_encode(["error" => "Error updating task: " . $stmt->error]);
        }
        
        $stmt->close(); // Close the statement
    }
} else {
    echo json_encode(["error" => "Invalid input data"]);
}

$conn->close();
?>