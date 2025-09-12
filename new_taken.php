<?php
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Extract task details
$taak = $conn->real_escape_string($data["Taaknaam"]);
$afspraakdatum = $conn->real_escape_string($data["Afspraakdatum"]);
$status = $conn->real_escape_string($data["Status"]);
$info = $conn->real_escape_string($data["Info"]);

// Insert the new task into the database
$sql = "INSERT INTO taken (Taaknaam, Afspraakdatum, Status, Info) VALUES ('$taak', '$afspraakdatum', '$status', '$info')";

if ($conn->query($sql) === TRUE) {
    // Fetch the newly created task to return it
    $newTaskId = $conn->insert_id; // Get the ID of the newly inserted task
    $newTask = [
        "id" => $newTaskId,
        "Taaknaam" => $taak,
        "Afspraakdatum" => $afspraakdatum,
        "Status" => $status,
        "Info" => $info
    ];
    echo json_encode(["message" => "Task created successfully", "Taken" => $newTask]);
} else {
    echo json_encode(["error" => "Error creating task: " . $conn->error]);
}

$conn->commit();
$conn->close();
?>