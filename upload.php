<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require "config.php";

if (!isset($_FILES["arquivo"])) {
    die("Nenhum ficheiro recebido.");
}

$arquivoTemporario = $_FILES["arquivo"]["tmp_name"];
$modo = $_POST["modo"] ?? "";

if (!in_array($modo, ["email", "ctt"])) {
    die("Modo inválido.");
}

$arquivo = fopen($arquivoTemporario, "r");

if ($arquivo === false) {
    die("Não foi possível abrir o ficheiro.");
}

$linhaNumero = 0;
$inseridos = 0;
$duplicados = 0;

while (($linha = fgetcsv($arquivo, 0, ";")) !== false) {

    $linhaNumero++;

    
    if ($linhaNumero === 1) {
        continue;
    }

    $id = trim($linha[0] ?? "");
    $nome = trim($linha[1] ?? "");
    $cc = trim($linha[2] ?? "");
    $acao = trim($linha[4] ?? "");

    $acao = str_replace(",", ".", $acao);

    while (strlen($acao) < 7) {
        $acao .= "0";
}

if ($id === "" || $nome === "") {
    continue;
}
    if ($id === "" || $nome === "") {
        continue;
    }

    $sql = "
        SELECT registro_id
        FROM envio_certificados
        WHERE id = ?
        AND nome = ?
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

   
    $stmt->execute([
        $id,
        $nome
    ]);

    if ($stmt->fetch()) {
        $duplicados++;
        continue;
    }

    
    $sql = "
        INSERT INTO envio_certificados
        (
            id,
            nome,
            cc,
            acao,
            data_envio,
            modo
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            NOW(),
            ?
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        $id,
        $nome,
        $cc,
        $acao,
        $modo
    ]);

    $inseridos++;
}

fclose($arquivo);

echo "Inseridos: " . $inseridos .
     " | Duplicados ignorados: " . $duplicados;