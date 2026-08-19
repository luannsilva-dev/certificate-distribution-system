<?php

require "config.php";

$sql = "DELETE FROM envio_certificados";

$stmt = $pdo->prepare($sql);

$stmt->execute();

echo "Todos os registos foram excluídos.";