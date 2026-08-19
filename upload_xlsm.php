<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require "config.php";


// Recebe o JSON enviado pelo JavaScript
$dados = json_decode(
    file_get_contents("php://input"),
    true
);


// Verifica se recebeu formandos
if (
    !isset($dados["formandos"]) ||
    !is_array($dados["formandos"])
) {

    die("Nenhum formando recebido.");
}


$formandos = $dados["formandos"];

$inseridos = 0;
$duplicados = 0;


// Percorre cada formando recebido
foreach ($formandos as $formando) {

    $id = trim(
        (string)($formando["id"] ?? "")
    );

    $nome = trim(
        (string)($formando["nome"] ?? "")
    );

    $cc = trim(
        (string)($formando["cc"] ?? "")
    );

    $acao = trim(
        (string)($formando["acao"] ?? "")
    );

    $modo = trim(
        (string)($formando["modo"] ?? "")
    );


    // Ignora linha sem ID ou nome
    if ($id === "" || $nome === "") {
        continue;
    }


    // Garante modo válido
    if (!in_array($modo, ["email", "ctt"])) {
        continue;
    }


    // Verifica se já existe
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


    // Insere novo formando
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


echo "Inseridos: "
    . $inseridos
    . " | Duplicados ignorados: "
    . $duplicados;