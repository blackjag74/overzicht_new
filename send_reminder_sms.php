<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['to']) || !isset($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: to, message']);
    exit;
}

$to = preg_replace('/[^0-9+]/', '', $input['to']); // Clean phone number
if (empty($to)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid phone number']);
    exit;
}

$message = htmlspecialchars($input['message']);
$reminder = $input['reminder'] ?? null;

// Validate message length (SMS limit is typically 160 characters)
if (strlen($message) > 160) {
    $message = substr($message, 0, 157) . '...';
}

// Log the SMS attempt
$logEntry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'type' => 'sms_reminder',
    'to' => $to,
    'message' => $message,
    'reminder' => $reminder
];

// Save to log file
file_put_contents('reminder_log.json', json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);

// In a real implementation, you would use an SMS service like:
// - Twilio API
// - Nexmo/Vonage API
// - AWS SNS
// - MessageBird API

// For demonstration purposes, we'll simulate sending the SMS
$success = true;

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'SMS reminder sent successfully',
        'to' => $to,
        'text' => $message
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send SMS reminder'
    ]);
}

// Example implementation with Twilio (commented out):
/*
require_once 'vendor/autoload.php';
use Twilio\Rest\Client;

// Your Account SID and Auth Token from twilio.com/console
$account_sid = 'your_account_sid';
$auth_token = 'your_auth_token';
$twilio_number = 'your_twilio_phone_number';

$client = new Client($account_sid, $auth_token);

try {
    $sms = $client->messages->create(
        $to, // To number
        [
            'from' => $twilio_number,
            'body' => $message
        ]
    );
    
    echo json_encode([
        'success' => true,
        'message' => 'SMS sent successfully',
        'sid' => $sms->sid
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send SMS: ' . $e->getMessage()
    ]);
}
*/

// Example implementation with MessageBird (commented out):
/*
require_once 'vendor/autoload.php';
use MessageBird\Client;
use MessageBird\Objects\Message;

$messageBird = new Client('your_api_key');

try {
    $message_obj = new Message();
    $message_obj->originator = 'BillMgmt';
    $message_obj->recipients = [$to];
    $message_obj->body = $message;
    
    $result = $messageBird->messages->create($message_obj);
    
    echo json_encode([
        'success' => true,
        'message' => 'SMS sent successfully',
        'id' => $result->id
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send SMS: ' . $e->getMessage()
    ]);
}
*/
?>