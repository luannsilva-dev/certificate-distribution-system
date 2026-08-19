<?php

require "config.php";

$sql = "
    SELECT
        id,
        nome,
        cc,
        acao,
        data_envio,
        modo
    FROM envio_certificados
    ORDER BY data_envio DESC
";

$stmt = $pdo->query($sql);

while ($formando = $stmt->fetch(PDO::FETCH_ASSOC)) {

    $id = htmlspecialchars($formando["id"]);
    $nome = htmlspecialchars($formando["nome"]);
    $cc = htmlspecialchars($formando["cc"]);
    $acao = htmlspecialchars($formando["acao"]);
    $modo = htmlspecialchars($formando["modo"]);

    $data = date(
        "d/m/Y H:i",
        strtotime($formando["data_envio"])
    );

    echo "
        <tr
            data-id=\"$id\"
            data-nome=\"$nome\"
            data-modo=\"$modo\"
        >

            <td>$id</td>
            <td>$nome</td>
            <td>$cc</td>
            <td>$acao</td>
            <td>$data</td>
            <td>" . strtoupper($modo) . "</td>

        </tr>
    ";
}