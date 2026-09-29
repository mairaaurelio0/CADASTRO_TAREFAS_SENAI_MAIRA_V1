const listaDeTarefas = [];

class Tarefa {
    #concluida;
    constructor(texto){
        if (!texto || texto.trim()===""){
            throw new Error("O texto não pode estar Vazio.")
        }

        this.texto = texto.trim();
        this.#concluida = false;
    }

    get concluida(){
        return this.#concluida;
    }

    alternarStatus(){
        this.#concluida = !this.#concluida;
    }
}

const campoTarefa = document.getElementById('campo-tarefa');
const botaoAdicionar = document.getElementById('botao-adicionar');
const listaTarefasDOM = document.getElementById('lista-tarefas');
const contadorTarefas = document.getElementById('contador-tarefas');
const botaoAlternarTema = document.getElementById('botao-alternar-tema');
const iconeTema = botaoAlternarTema.querySelector('i');

function atualizarContador(){
    const total = listaDeTarefas.length;
    if (total === 1){
        contadorTarefas.textContent = "1 tarefa na lista";
    }else{
        contadorTarefas.textContent = `${total} tarefas na lista`;
    }
}

function renderizarLista(){
    listaTarefasDOM.innerHTML = "";
    
    // CORRIGIDO: Adicionados os parênteses (tarefa, index)
    listaDeTarefas.forEach((tarefa, index) => {
        const li = document.createElement('li');

        li.classList.add('item-tarefa');

        if (tarefa.concluida){
            li.classList.add('concluido');
        }

        li.innerHTML = `<span>${tarefa.texto}</span>
            <div class="acoes-tarefa">
                <button class="botao-acao" onclick="alternarStatusTarefa(${index})">
                    <i class="fa-solid fa-check"></i>
                </button>
                <button class="botao-acao excluir" onclick="removerTarefa(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>`;

        listaTarefasDOM.appendChild(li);
    });

    atualizarContador();
}


function alternarStatusTarefa(index){
    listaDeTarefas[index].alternarStatus();
    renderizarLista();
}


function removerTarefa(index){
    listaDeTarefas.splice(index, 1);
    renderizarLista();
}

botaoAdicionar.addEventListener('click', () => {
    const textoDigitado = campoTarefa.value;

    try {
        const novaTarefa = new Tarefa(textoDigitado);
        listaDeTarefas.push(novaTarefa);
        renderizarLista();
        campoTarefa.value = "";
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
    document.body.classList.toggle('modo-escuro');

    if (document.body.classList.contains('modo-escuro')) {
        iconeTema.classList.replace('fa-moon', 'fa-sun');
    } else {
        iconeTema.classList.replace('fa-sun', 'fa-moon');
    }
});