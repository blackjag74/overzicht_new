<?php
// Get the JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate the data
if (is_array($data)) {
    // Save the data to taken.json
    file_put_contents('taken.json', json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(["message" => "Taken exported successfully"]);
} else {
    echo json_encode(["error" => "Invalid data format"]);
}
?>