// ======================================================
// Controle Financeiro dos Gustavos
// Versão 3.0
// ======================================================

// ===============================
// STORAGE
// ===============================

const STORAGE_KEY = "cfg_dados";
const STORAGE_CATEGORIAS = "cfg_categorias";

// ===============================
// ESTADO DA APLICAÇÃO
// ===============================

let lancamentos = [];
let idEmEdicao = null;
let filtroAtual = "todos";
let mesSelecionado = "";

// ===============================
// CATEGORIAS PADRÃO
// ===============================

const categoriasPadrao = {

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

let categorias = {};

// ===============================
// ELEMENTOS DA TELA
// ===============================

const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");
const valor = document.getElementById("valor");
const descricao = document.getElementById("descricao");
const campoData = document.getElementById("data");

const btnSalvar = document.getElementById("btnSalvar");
const btnNovaCategoria = document.getElementById("btnNovaCategoria");

const pesquisa = document.getElementById("pesquisa");

const totalReceitas =
    document.getElementById("totalReceitas");

const totalDespesas =
    document.getElementById("totalDespesas");

const totalPoupanca =
    document.getElementById("totalPoupanca");

const saldoDisponivel =
    document.getElementById("saldoDisponivel");

const listaLancamentos =
    document.getElementById("listaLancamentos");

const mesFiltro =
    document.getElementById("mesFiltro");

// ===============================
// INICIALIZAÇÃO DOS DADOS
// ===============================

function carregarDados(){

    lancamentos =
        JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];

    categorias =
        JSON.parse(
            localStorage.getItem(STORAGE_CATEGORIAS)
        ) || structuredClone(categoriasPadrao);

    lancamentos.forEach(item=>{

        if(!item.id){

            item.id =
                Date.now() +
                Math.floor(Math.random()*1000000);

        }

    });

}

function salvarDados(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(lancamentos)

    );

}

function salvarCategorias(){

    localStorage.setItem(

        STORAGE_CATEGORIAS,

        JSON.stringify(categorias)

    );

}

campoData.value =
    new Date()
        .toISOString()
        .substring(0,10);

// ======================================================
// FIM DA PARTE 1
// ======================================================
// ======================================================
// PARTE 2
// Categorias e Dashboard
// ======================================================

function carregarCategorias(){

    categoria.innerHTML = "";

    categorias[tipo.value].forEach(nome=>{

        const option =
            document.createElement("option");

        option.value = nome;
        option.textContent = nome;

        categoria.appendChild(option);

    });

}

tipo.addEventListener(
    "change",
    carregarCategorias
);

btnNovaCategoria.addEventListener("click",()=>{

    const nome =
        prompt("Nome da nova categoria:");

    if(!nome){

        return;

    }

    if(
        categorias[tipo.value]
        .includes(nome)
    ){

        alert("Esta categoria já existe.");

        return;

    }

    categorias[tipo.value].push(nome);

    categorias[tipo.value].sort();

    salvarCategorias();

    carregarCategorias();

    categoria.value = nome;

});

function formatarMoeda(valor){

    return "€ " +
        valor
        .toFixed(2)
        .replace(".",",");

}

function atualizarDashboard(){

    let receitas = 0;

    let despesas = 0;

    let poupanca = 0;

    lancamentos.forEach(item=>{

    if(
        mesSelecionado &&
        !item.data.startsWith(mesSelecionado)
    ){

        return;

    }

        switch(item.tipo){

            case "receita":

                receitas += item.valor;

                break;

            case "despesa":

                despesas += item.valor;

                break;

            case "poupanca":

                poupanca += item.valor;

                despesas += item.valor;

                break;

        }

    });

    totalReceitas.textContent =
        formatarMoeda(receitas);

    totalDespesas.textContent =
        formatarMoeda(despesas);

    totalPoupanca.textContent =
        formatarMoeda(poupanca);

    saldoDisponivel.textContent =
        formatarMoeda(
            receitas - despesas
        );

}

// ======================================================
// FIM DA PARTE 2
// ======================================================
// ======================================================
// PARTE 3
// Histórico, Pesquisa e Formulário
// ======================================================

function limparFormulario(){

    valor.value = "";

    descricao.value = "";

    tipo.value = "receita";

    carregarCategorias();

    campoData.value =
        new Date()
            .toISOString()
            .substring(0,10);

    idEmEdicao = null;

    btnSalvar.textContent = "Salvar";

}

function atualizarHistorico(){

    listaLancamentos.innerHTML = "";

    if(lancamentos.length === 0){

        listaLancamentos.innerHTML =
            "<div class='vazio'>Nenhum lançamento cadastrado.</div>";

        return;

    }

   [...lancamentos]
    .reverse()
    .filter(item => {

    if(
        mesSelecionado &&
        !item.data.startsWith(mesSelecionado)
    ){

        return false;

    }

    if(filtroAtual === "todos"){

        return true;

    }

    return item.tipo === filtroAtual;

})
    .forEach(item=>{

            const card =
                document.createElement("div");

            card.className = "item";

            card.innerHTML = `

                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;">

                    <div>

                        <strong>${item.descricao}</strong>

                        <br>

                        <small>

                            ${item.categoria}

                            •

                            ${item.data}

                        </small>

                    </div>

                    <div style="text-align:right;">

                        <strong>

                            ${formatarMoeda(item.valor)}

                        </strong>

                        <br><br>

                        <button
    data-id="${item.id}"
    class="btnEditar">

    ✏️

</button>

                        <button
    data-id="${item.id}"
    class="btnExcluir">

    🗑️

</button>

                    </div>

                </div>

            `;

            listaLancamentos.appendChild(card);
card.querySelector(".btnEditar")
    .addEventListener("click", function(){

        editarLancamento(
            this.dataset.id
        );

    });

card.querySelector(".btnExcluir")
    .addEventListener("click", function(){

        excluirLancamento(
            this.dataset.id
        );

    });
            
    });

}

pesquisa.addEventListener("input",()=>{

    const texto =
        pesquisa.value
        .toLowerCase();

    document
        .querySelectorAll(".item")
        .forEach(item=>{

            item.style.display =
                item.innerText
                    .toLowerCase()
                    .includes(texto)
                ? ""
                : "none";

        });

});

// ======================================================
// FIM DA PARTE 3
// ======================================================
// ======================================================
// PARTE 4
// Salvar, Editar e Excluir
// ======================================================

btnSalvar.addEventListener("click",()=>{

    const novoValor =
        parseFloat(valor.value);

    if(isNaN(novoValor) || novoValor <= 0){

        alert("Informe um valor válido.");

        return;

    }

    if(descricao.value.trim() === ""){

        alert("Informe uma descrição.");

        return;

    }

    if(idEmEdicao === null){

        lancamentos.push({

            id: crypto.randomUUID(),

            tipo: tipo.value,

            categoria: categoria.value,

            descricao: descricao.value.trim(),

            valor: novoValor,

            data: campoData.value

        });

    }else{

        const item =
            lancamentos.find(
                l => l.id === idEmEdicao
            );

        if(item){

            item.tipo = tipo.value;

            item.categoria = categoria.value;

            item.descricao =
                descricao.value.trim();

            item.valor =
                novoValor;

            item.data =
                campoData.value;

        }

    }

    salvarDados();

    atualizarDashboard();

    atualizarHistorico();

    limparFormulario();

});

function editarLancamento(id){

    const item = lancamentos.find(l => String(l.id) === String(id));

    if(!item){
        alert("Lançamento não encontrado.");
        return;
    }

    idEmEdicao = item.id;

    tipo.value = item.tipo;

    carregarCategorias();

    categoria.value = item.categoria;

    valor.value = item.valor;

    descricao.value = item.descricao;

    campoData.value = item.data;

    btnSalvar.textContent = "Atualizar";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
function excluirLancamento(id){

    if(
        !confirm(
            "Deseja excluir este lançamento?"
        )
    ){

        return;

    }

lancamentos =
    lancamentos.filter(
        item => String(item.id) !== String(id)
    );

    salvarDados();

    atualizarDashboard();

    atualizarHistorico();

}

// ======================================================
// FIM DA PARTE 4
// ======================================================
// ======================================================
// PARTE 5
// Abas e Inicialização
// ======================================================

const abas =
    document.querySelectorAll(".aba");

const paginas =
    document.querySelectorAll(".pagina");

abas.forEach(botao=>{

    botao.addEventListener("click",()=>{

        abas.forEach(aba=>{

            aba.classList.remove("ativa");

        });

        paginas.forEach(pagina=>{

            pagina.classList.remove("ativa");

        });

        botao.classList.add("ativa");

        document
            .getElementById(botao.dataset.aba)
            .classList.add("ativa");

    });

});
// ===============================
// FILTROS DO DASHBOARD
// ===============================

document
    .getElementById("cardReceitas")
    .addEventListener("click", () => {
        
        alert("Receitas");
        
        filtroAtual = "receita";

        atualizarHistorico();

    });

document
    .getElementById("cardDespesas")
    .addEventListener("click", () => {

        filtroAtual = "despesa";

        atualizarHistorico();

    });

document
    .getElementById("cardPoupanca")
    .addEventListener("click", () => {

        filtroAtual = "poupanca";

        atualizarHistorico();

    });

document
    .getElementById("cardSaldo")
    .addEventListener("click", () => {

        filtroAtual = "todos";

        atualizarHistorico();

    });
mesFiltro.value =
    new Date()
        .toISOString()
        .substring(0,7);

mesSelecionado =
    mesFiltro.value;

mesFiltro.addEventListener("change",()=>{

    mesSelecionado = mesFiltro.value;

    alert("Mês selecionado: " + mesSelecionado);

    atualizarDashboard();

    atualizarHistorico();

});
function inicializarSistema(){

    carregarDados();

    salvarDados();

    carregarCategorias();

    atualizarDashboard();

    atualizarHistorico();

}

inicializarSistema();

// ======================================================
// APP.JS FINALIZADO
// Versão 3.0
// ======================================================
