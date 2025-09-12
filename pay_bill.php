<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$conn = new mysqli("localhost", "cloudkeepers", "6:+)!xcr!BcIYn3", "cloudkeepers_rekeningoverzicht");

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get the JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(["error" => "Bill ID is required"]);
    exit;
}

$billId = intval($data['id']);
$betaaldatum = isset($data['betaaldatum']) ? $data['betaaldatum'] : date('Y-m-d');

// Get bill details first to calculate next due date
$billStmt = $conn->prepare("SELECT Rekening, Bedrag, Periode FROM rekeningen WHERE id = ?");
$billStmt->bind_param("i", $billId);
$billStmt->execute();
$result = $billStmt->get_result();
$bill = $result->fetch_assoc();

if ($bill) {
    // Calculate next due date based on period
    $periode = $bill['Periode'];
    $nextDueDate = date('Y-m-d', strtotime($betaaldatum));
    
    switch ($periode) {
        case 'Wekelijks':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +1 week'));
            break;
        case 'Maandelijks':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +1 month'));
            break;
        case 'Kwartaalijks':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +3 months'));
            break;
        case 'Half jaarlijks':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +6 months'));
            break;
        case 'Jaarlijks':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +1 year'));
            break;
        // Keep backward compatibility with old single letter codes
        case 'M':
        case 'O':
        case 'R':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +1 month'));
            break;
        case 'K':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +3 months'));
            break;
        case 'HJ':
        case 'H':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +6 months'));
            break;
        case 'J':
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +1 year'));
            break;
        default:
            $nextDueDate = date('Y-m-d', strtotime($betaaldatum . ' +1 month'));
            break;
    }
    
    // Update the bill to mark it as paid and set next due date
    $stmt = $conn->prepare("UPDATE rekeningen SET Betaaldatum = ?, Volgende = ? WHERE id = ?");
    $stmt->bind_param("ssi", $betaaldatum, $nextDueDate, $billId);
    
    if ($stmt->execute()) {
        // Insert transaction record
        $transactionDate = date('Y-m-d H:i:s');
        $description = 'paid';
        $amount = $bill['Bedrag'];
        $rekeningName = $bill['Rekening'];
        $taak = '';
        $t_afspraakdatum = '';
        
        $transactiesStmt = $conn->prepare("INSERT INTO Transacties (rekening, taak, transaction_date, amount, t_afspraakdatum, r_betaaldatum, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $transactiesStmt->bind_param("sssssss", $rekeningName, $taak, $transactionDate, $amount, $t_afspraakdatum, $betaaldatum, $description);
        $transactiesStmt->execute();
        $transactiesStmt->close();
        
        echo json_encode(["success" => true, "message" => "Bill marked as paid successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => "Error updating bill: " . $stmt->error]);
    }
    $billStmt->close();
} else {
    echo json_encode(["success" => false, "error" => "Bill not found"]);
}

$stmt->close();
$conn->close();
?>