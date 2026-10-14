class Tarefa {
    #concluida;
    constructor(texto, concluida = false, prioridade = "media", id = null){
        if (!texto || texto.trim()===""){
            throw new Error("O texto não pode estar Vazio.")
        }

        this.texto = texto.trim();
        this.#concluida = concluida;
        this.prioridade = ["alta", "media", "baixa"].includes(prioridade) ? prioridade : "media";
        this.id = id || Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    get concluida(){
        return this.#concluida;
    }

    alternarStatus(){
        this.#concluida = !this.#concluida;
    }

    toJSON(){
        return {
            id: this.id,
            texto: this.texto,
            concluida: this.#concluida,
            prioridade: this.prioridade
        };
    }
}

const CHAVE_STORAGE = "lista_de_tarefas";
const CHAVE_TEMA = "tema_tarefas";
const ORDEM_PRIORIDADE = { alta: 0, media: 1, baixa: 2 };
const ROTULO_PRIORIDADE = { alta: "Alta", media: "Média", baixa: "Baixa" };

let listaDeTarefas = [];
let filtroAtual = "todas";

function salvarNoLocalStorage() {
    const listaEmTexto = JSON.stringify(listaDeTarefas);
    localStorage.setItem(CHAVE_STORAGE, listaEmTexto);
}

function carregarDoLocalStorage() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

        if (dadosSalvos) {
            const tarefasObjetos = JSON.parse(dadosSalvos);

            tarefasObjetos.forEach((tarefa) => {
                const tarefaInstanciada = new Tarefa(tarefa.texto, tarefa.concluida, tarefa.prioridade, tarefa.id);
                listaDeTarefas.push(tarefaInstanciada);
            });
        }
    } catch (error) {
        listaDeTarefas = [];
    }
}

const campoTarefa = document.getElementById('campo-tarefa');
const campoPrioridade = document.getElementById('campo-prioridade');
const botaoAdicionar = document.getElementById('botao-adicionar');
const listaTarefasDOM = document.getElementById('lista-tarefas');
const contadorTarefas = document.getElementById('contador-tarefas');
const botaoAlternarTema = document.getElementById('botao-alternar-tema');
const iconeTema = botaoAlternarTema.querySelector('i');
const botaoLimpar = document.getElementById('botao-limpar');
const abas = document.querySelectorAll('.aba');
const fotoPerfil = document.getElementById('foto-perfil');
const dataAtual = document.getElementById('data-atual');

function atualizarResumo(){
    const total = listaDeTarefas.length;
    const concluidas = listaDeTarefas.filter(t => t.concluida).length;
    const pendentes = total - concluidas;
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    document.getElementById('total-pendentes').textContent = pendentes;
    document.getElementById('total-concluidas').textContent = concluidas;
    document.getElementById('percentual').textContent = `${percentual}%`;
    document.getElementById('barra-progresso').style.width = `${percentual}%`;

    document.getElementById('contagem-todas').textContent = total;
    document.getElementById('contagem-pendentes').textContent = pendentes;
    document.getElementById('contagem-concluidas').textContent = concluidas;

    if (total === 1){
        contadorTarefas.textContent = "1 tarefa na lista";
    }else{
        contadorTarefas.textContent = `${total} tarefas na lista`;
    }

    botaoLimpar.disabled = concluidas === 0;
}

function obterTarefasFiltradas(){
    let tarefas = [...listaDeTarefas];

    if (filtroAtual === "pendentes"){
        tarefas = tarefas.filter(t => !t.concluida);
    }else if (filtroAtual === "concluidas"){
        tarefas = tarefas.filter(t => t.concluida);
    }

    return tarefas.sort((a, b) => {
        if (a.concluida !== b.concluida){
            return a.concluida - b.concluida;
        }
        return ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade];
    });
}

function criarMensagemVazia(){
    const li = document.createElement('li');
    li.classList.add('mensagem-vazia');

    const mensagens = {
        todas: ["fa-clipboard-list", "Nenhuma tarefa ainda. Adicione a primeira!"],
        pendentes: ["fa-champagne-glasses", "Nada pendente. Tudo em dia!"],
        concluidas: ["fa-hourglass-half", "Nenhuma tarefa concluída ainda."]
    };

    const [icone, texto] = mensagens[filtroAtual];
    li.innerHTML = `<i class="fa-solid ${icone}"></i>`;
    li.appendChild(document.createTextNode(texto));
    return li;
}

function criarItemTarefa(tarefa){
    const li = document.createElement('li');
    li.classList.add('item-tarefa', `prioridade-${tarefa.prioridade}`);

    if (tarefa.concluida){
        li.classList.add('concluido');
    }

    const botaoCheck = document.createElement('button');
    botaoCheck.classList.add('botao-check');
    botaoCheck.dataset.acao = "alternar";
    botaoCheck.dataset.id = tarefa.id;
    botaoCheck.setAttribute('aria-label', tarefa.concluida ? "Marcar como pendente" : "Marcar como concluída");
    botaoCheck.innerHTML = '<i class="fa-solid fa-check"></i>';

    const conteudo = document.createElement('div');
    conteudo.classList.add('conteudo-tarefa');

    const texto = document.createElement('span');
    texto.classList.add('texto-tarefa');
    texto.textContent = tarefa.texto;

    const etiqueta = document.createElement('span');
    etiqueta.classList.add('etiqueta-prioridade');
    etiqueta.textContent = ROTULO_PRIORIDADE[tarefa.prioridade];

    conteudo.append(texto, etiqueta);

    const botaoExcluir = document.createElement('button');
    botaoExcluir.classList.add('botao-acao', 'excluir');
    botaoExcluir.dataset.acao = "remover";
    botaoExcluir.dataset.id = tarefa.id;
    botaoExcluir.setAttribute('aria-label', "Excluir tarefa");
    botaoExcluir.innerHTML = '<i class="fa-solid fa-trash"></i>';

    li.append(botaoCheck, conteudo, botaoExcluir);
    return li;
}

function renderizarLista(){
    listaTarefasDOM.innerHTML = "";

    const tarefas = obterTarefasFiltradas();

    if (tarefas.length === 0){
        listaTarefasDOM.appendChild(criarMensagemVazia());
    }else{
        tarefas.forEach((tarefa) => {
            listaTarefasDOM.appendChild(criarItemTarefa(tarefa));
        });
    }

    atualizarResumo();
}

function alternarStatusTarefa(id){
    const tarefa = listaDeTarefas.find(t => t.id === id);
    if (tarefa){
        tarefa.alternarStatus();
        salvarNoLocalStorage();
        renderizarLista();
    }
}

function removerTarefa(id){
    listaDeTarefas = listaDeTarefas.filter(t => t.id !== id);
    salvarNoLocalStorage();
    renderizarLista();
}

function aplicarTema(escuro){
    document.body.classList.toggle('modo-escuro', escuro);

    if (escuro) {
        iconeTema.classList.replace('fa-moon', 'fa-sun');
    } else {
        iconeTema.classList.replace('fa-sun', 'fa-moon');
    }
}

listaTarefasDOM.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-acao]');
    if (!botao) return;

    if (botao.dataset.acao === "alternar"){
        alternarStatusTarefa(botao.dataset.id);
    }else if (botao.dataset.acao === "remover"){
        removerTarefa(botao.dataset.id);
    }
});

abas.forEach((aba) => {
    aba.addEventListener('click', () => {
        filtroAtual = aba.dataset.filtro;
        abas.forEach(a => a.classList.toggle('ativa', a === aba));
        renderizarLista();
    });
});

botaoLimpar.addEventListener('click', () => {
    listaDeTarefas = listaDeTarefas.filter(t => !t.concluida);
    salvarNoLocalStorage();
    renderizarLista();
});

botaoAdicionar.addEventListener('click', () => {
    const textoDigitado = campoTarefa.value;

    try {
        const novaTarefa = new Tarefa(textoDigitado, false, campoPrioridade.value);
        listaDeTarefas.push(novaTarefa);
        salvarNoLocalStorage();
        renderizarLista();
        campoTarefa.value = "";
        campoTarefa.focus();
    } catch (error) {
        alert(error.message);
    }
});

campoTarefa.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        botaoAdicionar.click();
    }
});

botaoAlternarTema.addEventListener('click', () => {
    const escuro = !document.body.classList.contains('modo-escuro');
    aplicarTema(escuro);

    try {
        localStorage.setItem(CHAVE_TEMA, escuro ? "escuro" : "claro");
    } catch (error) {
        return;
    }
});

const botaoAtualizacoes = document.getElementById('botao-atualizacoes');
const modalAtualizacoes = document.getElementById('modal-atualizacoes');
const botaoFecharModal = document.getElementById('botao-fechar-modal');

function abrirModal(){
    modalAtualizacoes.hidden = false;
    botaoFecharModal.focus();
}

function fecharModal(){
    modalAtualizacoes.hidden = true;
    botaoAtualizacoes.focus();
}

botaoAtualizacoes.addEventListener('click', abrirModal);
botaoFecharModal.addEventListener('click', fecharModal);

modalAtualizacoes.addEventListener('click', (e) => {
    if (e.target === modalAtualizacoes) {
        fecharModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalAtualizacoes.hidden) {
        fecharModal();
    }
});

fotoPerfil.addEventListener('error', () => {
    fotoPerfil.remove();
});

dataAtual.textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
});

try {
    aplicarTema(localStorage.getItem(CHAVE_TEMA) === "escuro");
} catch (error) {
    aplicarTema(false);
}

carregarDoLocalStorage();
renderizarLista();