<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Handle single bill update (for unpay/pay functionality)
if (isset($data['id']) && isset($data['Status'])) {
    $id = $data['id'];
    $status = $data['Status'];
    $betaaldatum = isset($data['Betaaldatum']) ? $data['Betaaldatum'] : null;
    
    // Prepare the SQL statement for single bill update
    $stmt = $conn->prepare("UPDATE rekeningen SET Status=?, Betaaldatum=? WHERE id=?");
    $stmt->bind_param("ssi", $status, $betaaldatum, $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Bill updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error updating bill: " . $stmt->error]);
    }
    
    $stmt->close();
    $conn->close();
    exit;
}

// Check if 'RegularAccounts' is set and is an array (bulk update)
if (isset($data['RegularAccounts']) && is_array($data['RegularAccounts'])) {
    $success = true;
    $messages = [];
    
    foreach ($data['RegularAccounts'] as $rekening) {
        // Extract task details
        $id = isset($rekening["id"]) ? $rekening["id"] : null;
        $rekeningName = isset($rekening["Rekening"]) ? $rekening["Rekening"] : null;
        $betaaldatum = isset($rekening["Betaaldatum"]) ? $rekening["Betaaldatum"] : null;
        $status = isset($rekening["Status"]) ? $rekening["Status"] : null;
        $bedrag = isset($rekening["Bedrag"]) ? $rekening["Bedrag"] : null;
        $periode = isset($rekening["Periode"]) ? $rekening["Periode"] : null;
        $kenmerk = isset($rekening["Kenmerk"]) ? $rekening["Kenmerk"] : null;
        $url = isset($rekening["URL"]) ? $rekening["URL"] : null;
        $volgende = isset($rekening["Volgende"]) ? $rekening["Volgende"] : null;

        // Prepare the SQL statement
        $stmt = $conn->prepare("UPDATE rekeningen SET Rekening=?, Betaaldatum=?, Periode=?, Status=?, Bedrag=?, Kenmerk=?, URL=?, Volgende=? WHERE id=?");
        $stmt->bind_param("ssssssssi", $rekeningName, $betaaldatum, $periode, $status, $bedrag, $kenmerk, $url, $volgende, $id);

        // Execute the statement
        if ($stmt->execute()) {
            $messages[] = "Rekening $id updated successfully";
        } else {
            $success = false;
            $messages[] = "Error updating rekening $id: " . $stmt->error;
        }
        
        $stmt->close();
    }
    
    // Insert transaction record
    if ($success && isset($rekeningName)) {
        $transactionDate = date('Y-m-d H:i:s');
        $description = 'updated';
        $amount = $bedrag;
        $r_betaaldatum = $betaaldatum;
        $t_afspraakdatum = '';
        $taak = '';

        $transactiesStmt = $conn->prepare("INSERT INTO Transacties (rekening, taak, transaction_date, amount, t_afspraakdatum, r_betaaldatum, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $transactiesStmt->bind_param("sssssss", $rekeningName, $taak, $transactionDate, $amount, $t_afspraakdatum, $r_betaaldatum, $description);
        
        if (!$transactiesStmt->execute()) {
            $success = false;
            $messages[] = "Error inserting transaction: " . $conn->error;
        } else {
            $messages[] = "Transaction recorded successfully";
        }
        
        $transactiesStmt->close();
    }
    
    echo json_encode(["success" => $success, "messages" => $messages]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid input data"]);
}

$conn->close();
?>