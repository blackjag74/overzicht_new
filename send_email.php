<?php
// Send email using PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host = 'smtp.gmail.com';
  $mail->SMTPAuth = true;
  $mail->Username = 'mustafabenali@gmail.com';
  $mail->Password = 'jgdf ekus txdz tdoe';
  $mail->SMTPSecure = 'tls';
  $mail->Port = 587;

  $mail->setFrom('mustafabenali@gmail.com', 'Tasks & Bills');
  $mail->addAddress($_POST['to'], $_POST['to']);

  $mail->isHTML(true);
  $mail->Subject = $_POST['subject'];
  $mail->Body = $_POST['body'];

  $mail->send();
  echo 'Email sent successfully!';
} catch (Exception $e) {
  echo 'Error sending email: ', $e->getMessage();
}
?>