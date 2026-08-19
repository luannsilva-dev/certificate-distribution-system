<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require "config.php";

$sql = "
    SELECT
        registro_id,
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

?>

<!DOCTYPE html>
<html lang="pt">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Envio de Certificados</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >
    <link rel="stylesheet"
    href="css/style.css"
    >

</head>

<div class="container py-4">

    <h1 class="mb-4">
       Carregue aqui os certificados enviados
    </h1>

    <div class="row g-3 mb-4">

        <div class="col-md-6">

            <div
                class="drop-zone"
                id="dropEmail"
                data-modo="email"
            >

                <h5>Email</h5>

                <p class="mb-0">
                    Arraste o ficheiro Excel aqui
                </p>

            </div>

        </div>


        <div class="col-md-6">

            <div
                class="drop-zone"
                id="dropCtt"
                data-modo="ctt"
            >

                <h5>CTT</h5>

                <p class="mb-0">
                    Arraste o ficheiro Excel aqui
                </p>

            </div>

        </div>

    </div>

    
<body class="bg-light">

<div class="container py-4">

    <h1 class="mb-4">
        Campo de Busca e Filtro de Modo
    </h1>

    <div class="row g-2 mb-3">

    <div class="col-md-8">
        <input
        type="text"
        id="pesquisa"
        class="form-control"
        placeholder="Pesquisar por nome ou ID meu amigo Margarido"
        >
    </div>

        <div class="col-md-4">
            <select
                id="filtroModo"
                class="form-select"
                >
                <option value="todos">Todos</option>
                <option value="email">Email</option>
                <option value="ctt">CTT</option>
            </select>
        </div>

        <div class="d-flex justify-content-end">
    <button class="btn btn-danger btn-sm w-auto" name="btnExcluirTudo" id="btnExcluirTudo">Excluir tudo</button>
</div>


    <div class="card">

        <div class="card-body">

            <h4 class="mb-3">
                Certificados enviados
            </h4>

            <div class="table-responsive">

                <table class="table table-striped table-hover">

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>cc</th>
                            <th>Ação</th>
                            <th>Data / Hora</th>
                            <th>Modo</th>
                        </tr>

                    </thead>

                    <tbody id="listaCertificados">

    <?php while ($formando = $stmt->fetch(PDO::FETCH_ASSOC)) { ?>

        <tr
            data-id="<?= htmlspecialchars($formando['id']) ?>"
            data-nome="<?= htmlspecialchars($formando['nome']) ?>"
            data-modo="<?= htmlspecialchars($formando['modo']) ?>"
        >

            <td>
                <?= htmlspecialchars($formando['id']) ?>
            </td>

            <td>
                <?= htmlspecialchars($formando['nome']) ?>
            </td>

            <td>
                <?= htmlspecialchars($formando['cc']) ?>
            </td>

            <td>
                <?= htmlspecialchars($formando['acao']) ?>
            </td>

            <td>
                <?= date(
                    "d/m/Y H:i",
                    strtotime($formando['data_envio'])
                ) ?>
            </td>

            <td>
                <?= strtoupper(
                    htmlspecialchars($formando['modo'])
                ) ?>
            </td>

        </tr>

    <?php } ?>

</tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

<script src="js/script.js"></script>

</body>

</html>