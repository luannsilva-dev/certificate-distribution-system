$(document).ready(function () {

    // =========================
    // EXCLUIR TUDO
    // =========================

    $("#btnExcluirTudo").on("click", function () {

        const confirmar = confirm(
            "Tem certeza que deseja excluir todos os registos?"
        );

        if (!confirmar) {
            return;
        }

        $.ajax({

            url: "excluir_tudo.php",

            type: "POST",

            success: function (resposta) {

                $("#mensagem").html(`
                    <div class="alert alert-success">
                        ${resposta}
                    </div>
                `);

                carregarLista();
            },

            error: function (xhr) {

                $("#mensagem").html(`
                    <div class="alert alert-danger">
                        Erro ao excluir os registos.
                    </div>
                `);

                console.log(xhr.responseText);
            }

        });

    });


    // =========================
    // PESQUISA
    // =========================

    $("#pesquisa").on("input", function () {

        filtrarLista();

    });


    // =========================
    // FILTRO EMAIL / CTT
    // =========================

    $("#filtroModo").on("change", function () {

        filtrarLista();

    });


    // =========================
    // DRAGOVER
    // =========================

    $(".drop-zone").on("dragover", function (e) {

        e.preventDefault();

        $(this).addClass("dragover");

    });


    // =========================
    // DRAGLEAVE
    // =========================

    $(".drop-zone").on("dragleave", function () {

        $(this).removeClass("dragover");

    });


    // =========================
    // DROP DO FICHEIRO
    // =========================

    $(".drop-zone").on("drop", async function (e) {

        e.preventDefault();

        $(this).removeClass("dragover");


        const arquivos =
            e.originalEvent.dataTransfer.files;


        if (arquivos.length === 0) {
            return;
        }


        const arquivo = arquivos[0];

        const modoDrop =
            $(this).data("modo");


        const extensao = arquivo.name
            .split(".")
            .pop()
            .toLowerCase();


        console.log("Ficheiro:", arquivo.name);
        console.log("Extensão:", extensao);


        // =========================
        // CSV
        // =========================

        if (extensao === "csv") {

            const formData =
                new FormData();


            formData.append(
                "arquivo",
                arquivo
            );


            formData.append(
                "modo",
                modoDrop
            );


            $.ajax({

                url: "upload.php",

                type: "POST",

                data: formData,

                contentType: false,

                processData: false,

                success: function (resposta) {

                    $("#mensagem").html(`
                        <div class="alert alert-success">
                            ${resposta}
                        </div>
                    `);

                    carregarLista();
                },

                error: function (xhr) {

                    console.log(xhr.responseText);

                    $("#mensagem").html(`
                        <div class="alert alert-danger">
                            Erro ao processar CSV.
                        </div>
                    `);

                }

            });

        }


        // =========================
        // EXCEL - XLSM OU XLSX
        // =========================

        else if (
            extensao === "xlsm" ||
            extensao === "xlsx"
        ) {

            try {

                console.log("ENTROU NO EXCEL");


                // Lê o ficheiro
                const dados =
                    await arquivo.arrayBuffer();


                const workbook =
                    XLSX.read(dados);


                        let nomeFolha;

                        if (workbook.SheetNames.includes("Enviados")) {

                            nomeFolha = "Enviados";

                        } else {

                            nomeFolha = workbook.SheetNames[0];

                        }

                        const worksheet =
                            workbook.Sheets[nomeFolha];


                console.log(
                    "Folha utilizada:",
                    nomeFolha
                );


                // Converte Excel para array
                const linhas =
                    XLSX.utils.sheet_to_json(
                        worksheet,
                        {
                            header: 1,
                            defval: ""
                        }
                    );


                // Se não houver linhas
                if (linhas.length === 0) {

                    $("#mensagem").html(`
                        <div class="alert alert-danger">
                            O ficheiro está vazio.
                        </div>
                    `);

                    return;
                }


                // =====================================
                // PEGA O CABEÇALHO
                // =====================================

                const cabecalho =
                    linhas[0].map(function (coluna) {

                        return normalizarCabecalho(
                            coluna
                        );

                    });


                console.log(
                    "Cabeçalho:",
                    cabecalho
                );


                // =====================================
                // DESCOBRE ONDE ESTÁ CADA COLUNA
                // =====================================

                const indiceId =
                    encontrarIndice(
                        cabecalho,
                        ["ID"]
                    );


                const indiceNome =
                    encontrarIndice(
                        cabecalho,
                        ["NOME"]
                    );


                const indiceCc =
                    encontrarIndice(
                        cabecalho,
                        [
                            "CC",
                            "N IDENT",
                            "N IDENTIFICACAO",
                            "NUMERO IDENTIFICACAO"
                        ]
                    );


                const indiceAcao =
                    encontrarIndice(
                        cabecalho,
                        [
                            "ACAO",
                            "AÇÃO"
                        ]
                    );


                // =====================================
                // VALIDA AS COLUNAS
                // =====================================

                if (
                    indiceId === -1 ||
                    indiceNome === -1 ||
                    indiceCc === -1 ||
                    indiceAcao === -1
                ) {

                    console.log({
                        indiceId,
                        indiceNome,
                        indiceCc,
                        indiceAcao
                    });

                    $("#mensagem").html(`
                        <div class="alert alert-danger">
                            Não encontrei todas as colunas necessárias:
                            ID, NOME, CC e AÇÃO.
                        </div>
                    `);

                    return;
                }


                console.log(
                    "ID está na coluna:",
                    indiceId
                );

                console.log(
                    "NOME está na coluna:",
                    indiceNome
                );

                console.log(
                    "CC está na coluna:",
                    indiceCc
                );

                console.log(
                    "AÇÃO está na coluna:",
                    indiceAcao
                );


                // =====================================
                // MONTA OS FORMANDOS
                // =====================================

                const formandos = [];


                linhas.forEach(
                    function (linha, indice) {

                        // Ignora o cabeçalho
                        if (indice === 0) {
                            return;
                        }


                        const id =
                            String(
                                linha[indiceId] ?? ""
                            ).trim();


                        const nome =
                            String(
                                linha[indiceNome] ?? ""
                            ).trim();


                        const cc =
                            String(
                                linha[indiceCc] ?? ""
                            ).trim();


                        const acao =
                            normalizarAcao(
                                linha[indiceAcao] ?? ""
                            );


                        // Linha sem ID ou nome
                        if (
                            id === "" ||
                            nome === ""
                        ) {

                            return;
                        }


                        formandos.push({

                            id: id,

                            nome: nome,

                            cc: cc,

                            acao: acao,

                            modo: modoDrop

                        });

                    }
                );


                console.log(
                    "Formandos encontrados:"
                );

                console.log(formandos);


                // =====================================
                // ENVIA PARA PHP
                // =====================================

                $.ajax({

                    url: "upload_xlsm.php",

                    type: "POST",

                    contentType:
                        "application/json",

                    data: JSON.stringify({

                        formandos:
                            formandos

                    }),

                    success: function (resposta) {

                        $("#mensagem").html(`
                            <div class="alert alert-success">
                                ${resposta}
                            </div>
                        `);

                        carregarLista();

                    },

                    error: function (xhr) {

                        console.log(
                            xhr.responseText
                        );

                        $("#mensagem").html(`
                            <div class="alert alert-danger">
                                Erro ao guardar o ficheiro Excel.
                            </div>
                        `);

                    }

                });


            } catch (erro) {

                console.log(erro);

                $("#mensagem").html(`
                    <div class="alert alert-danger">
                        Não foi possível ler o ficheiro Excel.
                    </div>
                `);

            }

        }


        // =========================
        // FORMATO INVÁLIDO
        // =========================

        else {

            $("#mensagem").html(`
                <div class="alert alert-danger">
                    Formato inválido.
                    Use CSV, XLSX ou XLSM.
                </div>
            `);

        }

    });

});



// ==================================
// NORMALIZAR CABEÇALHO
// ==================================

function normalizarCabecalho(valor) {

    return String(valor)
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.º°]/g, "")
        .replace(/\s+/g, " ");

}



// ==================================
// PROCURAR COLUNA
// ==================================

function encontrarIndice(
    cabecalho,
    nomesPossiveis
) {

    for (
        let i = 0;
        i < nomesPossiveis.length;
        i++
    ) {

        const nome =
            normalizarCabecalho(
                nomesPossiveis[i]
            );


        const indice =
            cabecalho.indexOf(nome);


        if (indice !== -1) {

            return indice;

        }

    }


    return -1;

}



// ==================================
// NORMALIZAR AÇÃO
// ==================================

function normalizarAcao(acao) {

    acao = String(acao)
        .trim()
        .replace(",", ".");


    while (
        acao.length < 7 &&
        acao !== ""
    ) {

        acao += "0";

    }


    return acao;

}



// ==================================
// FILTRAR LISTA
// ==================================

function filtrarLista() {

    const pesquisa = $("#pesquisa")
        .val()
        .toLowerCase()
        .trim();


    const modoSelecionado =
        $("#filtroModo").val();


    $("#listaCertificados tr")
        .each(function () {

            const linha =
                $(this);


            const id =
                String(
                    linha.data("id")
                )
                .toLowerCase();


            const nome =
                String(
                    linha.data("nome")
                )
                .toLowerCase();


            const modo =
                String(
                    linha.data("modo")
                )
                .toLowerCase();


            const correspondePesquisa =
                pesquisa === ""
                ||
                id.includes(pesquisa)
                ||
                nome.includes(pesquisa);


            const correspondeModo =
                modoSelecionado === "todos"
                ||
                modo === modoSelecionado;


            if (
                correspondePesquisa
                &&
                correspondeModo
            ) {

                linha.show();

            } else {

                linha.hide();

            }

        });

}



// ==================================
// CARREGAR LISTA
// ==================================

function carregarLista() {

    $.ajax({

        url: "listar.php",

        type: "GET",

        success: function (dados) {

            $("#listaCertificados")
                .html(dados);

            filtrarLista();

        },

        error: function () {

            console.log(
                "Erro ao carregar lista."
            );

        }

    });

}