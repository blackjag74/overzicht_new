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

// Fetch all bills from database
$sql = "SELECT id, rekening, bedrag, periode, betaaldatum, status, volgende, kenmerk, url FROM rekeningen";
$result = $conn->query($sql);

$bills = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Calculate Volgende field if it's empty or null
        $volgende = $row['volgende'];
        if (empty($volgende) && !empty($row['betaaldatum'])) {
            $betaaldatum = $row['betaaldatum'];
            $periode = $row['periode'];
            
            switch ($periode) {
                case 'Wekelijks':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +1 week'));
                    break;
                case 'Maandelijks':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +1 month'));
                    break;
                case 'Kwartaalijks':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +3 months'));
                    break;
                case 'Half jaarlijks':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +6 months'));
                    break;
                case 'Jaarlijks':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +1 year'));
                    break;
                // Keep backward compatibility with old single letter codes
                case 'M':
                case 'O':
                case 'R':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +1 month'));
                    break;
                case 'K':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +3 months'));
                    break;
                case 'HJ':
                case 'H':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +6 months'));
                    break;
                case 'J':
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +1 year'));
                    break;
                case 'Openstaand':
                case 'Betalingsregeling':
                    // For these types, don't calculate a next date
                    $volgende = null;
                    break;
                default:
                    $volgende = date('Y-m-d', strtotime($betaaldatum . ' +1 month'));
                    break;
            }
            
            // Update the database with calculated Volgende date
            if ($volgende) {
                $updateStmt = $conn->prepare("UPDATE rekeningen SET volgende = ? WHERE id = ?");
                $updateStmt->bind_param("si", $volgende, $row['id']);
                $updateStmt->execute();
                $updateStmt->close();
            }
        }
        
        $bills[] = [
            'id' => $row['id'],
            'Rekening' => $row['rekening'],
            'Bedrag' => $row['bedrag'],
            'Periode' => $row['periode'],
            'Betaaldatum' => $row['betaaldatum'],
            'Status' => $row['status'],
            'Volgende' => $volgende,
            'Kenmerk' => $row['kenmerk'],
            'URL' => $row['url']
        ];
    }
}

$conn->close();

echo json_encode(["RegularAccounts" => $bills]);
?>