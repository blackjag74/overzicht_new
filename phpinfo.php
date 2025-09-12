<?php
header('Content-Type: text/html');
echo "<h2>PHP Extensions Check</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>MySQLi Extension: " . (extension_loaded('mysqli') ? 'Loaded' : 'NOT Loaded') . "</p>";
echo "<p>PDO Extension: " . (extension_loaded('pdo') ? 'Loaded' : 'NOT Loaded') . "</p>";
echo "<p>PDO MySQL Extension: " . (extension_loaded('pdo_mysql') ? 'Loaded' : 'NOT Loaded') . "</p>";
echo "<h3>All Loaded Extensions:</h3>";
echo "<pre>";
print_r(get_loaded_extensions());
echo "</pre>";
?>