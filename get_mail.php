<?php
// Email account configuration
$emailAccount = [
    'user' => 'mustafabenali@gmail.com', // Replace with your email
    'password' => 'jgdf ekus txdz tdoe', // Replace with your password or app-specific password
    'host' => '{imap.gmail.com:993/imap/ssl}INBOX', // IMAP server
];

// Connect to the IMAP server
$inbox = imap_open($emailAccount['host'], $emailAccount['user'], $emailAccount['password']);

if (!$inbox) {
    echo json_encode(['error' => 'Cannot connect to IMAP server: ' . imap_last_error()]);
    exit;
}

// Calculate the date for the last month
$lastMonth = date('d M Y', strtotime('-1 month'));

$subjects = ["incasso", "factuur", "facturen", "betaling", "betaal", "nieuw bericht van you sure", "herinnering", "betalingsregeling", "aanmaning", "afspraak", "Dinkwaterrekening", "rekening"];
$emails = [];

foreach ($subjects as $subject) {
    $searchResult = imap_search($inbox, 'UNSEEN SUBJECT "' . $subject . '" SINCE "' . $lastMonth . '"', SE_UID);
    if ($searchResult) {
        $emails = array_merge($emails, $searchResult);
    }
}

if (!$emails) {
    echo json_encode(['message' => 'No unread emails found with the specified subject phrase and sent in the last month.']);
    imap_close($inbox);
    exit;
}

// Fetch the top 10 emails
$emailData = [];
for ($i = 0; $i < 20; $i++) {
    if (isset($emails[$i])) {
        $emailHeader = imap_headerinfo($inbox, imap_msgno($inbox, $emails[$i]));
        $emailData[] = [
            'num_found' => count($emails),
            'subject' => $emailHeader->subject ?? 'No Subject',
            'date' => $emailHeader->date ?? 'Unknown Date',
            'from' => $emailHeader->fromaddress ?? 'Unknown From',
            'timestamp' => strtotime($emailHeader->date),
            'Status' => 'UNSEEN' // Add this line to include the Status property
          ];
    } else {
        break;
    }
}

// Sort the emails by date
usort($emailData, function($a, $b) {
    return $b['timestamp'] - $a['timestamp'];
});

// Close the IMAP connection
imap_close($inbox);

// Return emails as JSON
echo json_encode($emailData);