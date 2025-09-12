<?php
$logMessage = $_POST['logMessage'];

$file = fopen('log.txt', 'a');
if ($file) {
    fwrite($file, date('Y-m-d H:i:s') . ' - ' . $logMessage . "\n");
    fclose($file);
} else {
    echo 'Error opening log file';
}
?>