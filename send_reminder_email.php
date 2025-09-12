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

if (!$input || !isset($input['to']) || !isset($input['subject']) || !isset($input['body'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: to, subject, body']);
    exit;
}

$to = filter_var($input['to'], FILTER_VALIDATE_EMAIL);
if (!$to) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

$subject = htmlspecialchars($input['subject']);
$body = htmlspecialchars($input['body']);
$reminder = $input['reminder'] ?? null;

// Email headers
$headers = [
    'From: noreply@billmanagement.local',
    'Reply-To: noreply@billmanagement.local',
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/plain; charset=UTF-8'
];

// Log the reminder attempt
$logEntry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'type' => 'email_reminder',
    'to' => $to,
    'subject' => $subject,
    'reminder' => $reminder
];

// Save to log file
file_put_contents('reminder_log.json', json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);

// In a real implementation, you would use a proper email service like:
// - PHPMailer with SMTP
// - SendGrid API
// - Amazon SES
// - Mailgun API

// For demonstration purposes, we'll simulate sending the email
$success = true; // In real implementation: mail($to, $subject, $body, implode("\r\n", $headers));

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'Email reminder sent successfully',
        'to' => $to,
        'subject' => $subject
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to send email reminder'
    ]);
}

// Example implementation with PHPMailer (commented out):
/*
require_once 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com'; // Set the SMTP server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'your-email@gmail.com';
    $mail->Password   = 'your-app-password';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Recipients
    $mail->setFrom('noreply@billmanagement.local', 'Bill Management System');
    $mail->addAddress($to);

    // Content
    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body    = $body;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}
*/
?>