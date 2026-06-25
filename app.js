// ===============================
// Controle Financeiro dos Gustavos
// Versão 1.0
// ===============================

const STORAGE_KEY = "cfg_dados";

let lancamentos =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

const categorias = {

    receita: [
        "Salário",
        "Bônus",
        "Cashback",
        "Presente",
        "Venda de algo"
    ],

    despesa: [
        "Mercado",
        "Restaurante",
        "Casa",
        "Aluguel",
        "Telecomunicações",
        "Energia",
        "Gás",
        "Água",
        "Internet",
        "Esporte",
        "Carga carro",
        "Cachorro",
        "Farmácia",
        "Saúde",
        "Lazer",
        "Viagem",
        "Outros"
    ],

    poupanca: [
        "Reserva",
        "Investimento"
    ]

};

const tipo =
    document.getElementById("tipo");

const categoria =
    document.getElementById("categoria");

const btnSalvar =
    document.getElementById("btnSalvar");

const btnNovaCategoria =
    document.getElementById("btnNovaCategoria");

const campoData =
    document.getElementById("data");

campoData.value =
    new Date()
    .toISOString()
    .substring(0,10);

function carregarCategorias(){

    categoria.innerHTML="";

    categorias[tipo.value]
    .forEach(nome=>{

        const option =
        document.createElement("option");

        option.textContent=nome;

        option.value=nome;

        categoria.appendChild(option);

    });

}

tipo.addEventListener(
    "change",
    carregarCategorias
);

carregarCategorias();
function salvarDados() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lancamentos)
    );

}

function atualizarDashboard(){

    let receitas = 0;
    let despesas = 0;
    let poupanca = 0;

    lancamentos.forEach(item=>{

        if(item.tipo==="receita"){

            receitas += item.valor;

        }

        if(item.tipo==="despesa"){

            despesas += item.valor;

        }

        if(item.tipo==="poupanca"){

            poupanca += item.valor;

            // A poupança também sai do saldo disponível
            despesas += item.valor;

        }

    });

    document.getElementById("totalReceitas").innerHTML =
        "€ " + receitas.toFixed(2).replace(".",",");

    document.getElementById("totalDespesas").innerHTML =
        "€ " + despesas.toFixed(2).replace(".",",");

    document.getElementById("totalPoupanca").innerHTML =
        "€ " + poupanca.toFixed(2).replace(".",",");

    document.getElementById("saldoDisponivel").innerHTML =
        "€ " + (receitas-despesas)
        .toFixed(2)
        .replace(".",",");

}

function atualizarHistorico(){

    const lista =
        document.getElementById("listaLancamentos");

    lista.innerHTML="";

    if(lancamentos.length===0){

        lista.innerHTML=
        "<div class='vazio'>Nenhum lançamento cadastrado.</div>";

        return;

    }

    lancamentos
    .slice()
    .reverse()
    .forEach(item=>{

        lista.innerHTML += `

        <div class="item">

            <strong>${item.descricao}</strong>

            <br>

            ${item.categoria}

            •
            ${item.data}

            <span style="float:right;font-weight:bold;">

                € ${item.valor.toFixed(2).replace(".",",")}

            </span>

        </div>

        `;

    });

}
btnSalvar.addEventListener("click", () => {

    const valor = parseFloat(document.getElementById("valor").value);
    const descricao = document.getElementById("descricao").value.trim();
    const data = document.getElementById("data").value;

    if (isNaN(valor) || valor <= 0) {
        alert("Informe um valor válido.");
        return;
    }

    if (descricao === "") {
        alert("Informe uma descrição.");
        return;
    }

    lancamentos.push({
        tipo: tipo.value,
        categoria: categoria.value,
        descricao: descricao,
        valor: valor,
        data: data
    });

    salvarDados();

    atualizarDashboard();

    atualizarHistorico();

    document.getElementById("valor").value = "";
    document.getElementById("descricao").value = "";

    campoData.value = new Date().toISOString().substring(0, 10);

});

btnNovaCategoria.addEventListener("click", () => {

    const nome = prompt("Nome da nova categoria:");

    if (!nome) return;

    categorias[tipo.value].push(nome);

    carregarCategorias();

    categoria.value = nome;

});

document.getElementById("pesquisa").addEventListener("input", function () {

    const texto = this.value.toLowerCase();

    const itens = document.querySelectorAll(".item");

    itens.forEach(item => {

        item.style.display = item.innerText.toLowerCase().includes(texto)
            ? ""
            : "none";

    });

});

atualizarDashboard();

atualizarHistorico();
