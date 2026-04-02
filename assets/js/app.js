// ========== CATEGORIAS ==========
const CATEGORIAS_DESPESA = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Moradia', 'Utilities', 'Vestuário', 'Outros'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Bônus', 'Outras Receitas'];

// ========== ELEMENTOS DO DOM ==========
const modal = document.getElementById('modalTransacao');
const formTransacao = document.getElementById('formTransacao');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const addBtn = document.getElementById('addBtn');
const addBtn2 = document.getElementById('addBtn2');

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  setarDataAtual();
  populateCategorias();
  atualizarDashboard();
  configurarEventos();
  carregarTransacoes();
});

// ========== FUNÇÕES AUXILIARES ==========
function setarDataAtual() {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data').value = hoje;
  document.getElementById('filtroMes').valueAsDate = new Date();
}

function populateCategorias() {
  const categoriaSelect = document.getElementById('categoria');
  const categoriaFilter = document.getElementById('filterCategoria');

  adicionarOpcoes(categoriaSelect, CATEGORIAS_DESPESA);
  adicionarOpcoes(categoriaFilter, CATEGORIAS_DESPESA.concat(CATEGORIAS_RECEITA));
}

function adicionarOpcoes(element, opcoes) {
  opcoes.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    element.appendChild(option);
  });
}

// ========== NAVEGAÇÃO ==========
document.querySelectorAll('.menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.getAttribute('data-page');
    mostrarPagina(page);
    
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function mostrarPagina(pageName) {
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  document.getElementById(pageName).classList.remove('hidden');

  if (pageName === 'dashboard') {
    setTimeout(() => atualizarDashboard(), 100);
  } else if (pageName === 'transacoes') {
    carregarTransacoes();
  }
}

// ========== MODAL ==========
function abrirModal(id = null) {
  document.getElementById('transacaoId').value = id || '';
  deleteBtn.classList.add('hidden');

  if (id) {
    const transacao = obterTransacao(id);
    document.getElementById('modalTitle').textContent = 'Editar Transação';
    document.querySelector(`input[value="${transacao.type}"]`).checked = true;
    document.getElementById('data').value = transacao.date;
    document.getElementById('descricao').value = transacao.descricao;
    document.getElementById('categoria').value = transacao.category;
    document.getElementById('valor').value = transacao.value;
    deleteBtn.classList.remove('hidden');
  } else {
    document.getElementById('modalTitle').textContent = 'Nova Transação';
    formTransacao.reset();
    setarDataAtual();
  }

  modal.classList.add('active');
}

function fecharModal() {
  modal.classList.remove('active');
  formTransacao.reset();
  setarDataAtual();
}

closeModal.addEventListener('click', fecharModal);
cancelBtn.addEventListener('click', fecharModal);
addBtn.addEventListener('click', () => abrirModal());
addBtn2.addEventListener('click', () => abrirModal());

modal.addEventListener('click', (e) => {
  if (e.target === modal) fecharModal();
});

// ========== FORM TRANSAÇÃO ==========
formTransacao.addEventListener('submit', (e) => {
  e.preventDefault();

  const tipo = document.querySelector('input[name="tipo"]:checked').value;
  const data = document.getElementById('data').value;
  const descricao = document.getElementById('descricao').value;
  const categoria = document.getElementById('categoria').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const id = document.getElementById('transacaoId').value;

  if (!tipo || !data || !descricao || !categoria || !valor) {
    alert('Preencha todos os campos!');
    return;
  }

  const transacao = {
    id: id || Date.now().toString(),
    type: tipo,
    date: data,
    descricao: descricao,
    category: categoria,
    value: valor
  };

  let transacoes = obterTransacoes();
  if (id) {
    transacoes = transacoes.map(t => t.id === id ? transacao : t);
  } else {
    transacoes.push(transacao);
  }

  salvarTransacoes(transacoes);
  fecharModal();
  atualizarDashboard();
  carregarTransacoes();
});

deleteBtn.addEventListener('click', () => {
  const id = document.getElementById('transacaoId').value;
  if (confirm('Tem certeza que deseja deletar esta transação?')) {
    let transacoes = obterTransacoes();
    transacoes = transacoes.filter(t => t.id !== id);
    salvarTransacoes(transacoes);
    fecharModal();
    atualizarDashboard();
    carregarTransacoes();
  }
});

// ========== ARMAZENAMENTO ==========
function obterTransacoes() {
  return JSON.parse(localStorage.getItem('transacoes')) || [];
}

function salvarTransacoes(transacoes) {
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
}

function obterTransacao(id) {
  return obterTransacoes().find(t => t.id === id);
}

// ========== DASHBOARD ==========
function atualizarDashboard() {
  const transacoes = obterTransacoes();
  calcularKPIs(transacoes);
  renderizarGraficos(transacoes);
}

function calcularKPIs(transacoes) {
  let receita = 0, despesa = 0;

  transacoes.forEach(t => {
    if (t.type === 'receita') receita += t.value;
    else despesa += t.value;
  });

  const saldo = receita - despesa;
  const media = transacoes.length > 0 ? saldo / 12 : 0;

  document.getElementById('receita').textContent = `R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('despesa').textContent = `R$ ${despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('saldo').textContent = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('media').textContent = `R$ ${media.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  document.getElementById('saldo').parentElement.classList.toggle('card-success', saldo >= 0);
  document.getElementById('saldo').parentElement.classList.toggle('card-danger', saldo < 0);
}

function renderizarGraficos(transacoes) {
  if (transacoes.length === 0) return;

  graficoReceitasDespesas(transacoes);
  graficoDespesasPorCategoria(transacoes);
  graficoReceitasPorCategoria(transacoes);
  graficoDistribuicaoDespesas(transacoes);
}

function graficoReceitasDespesas(transacoes) {
  const meses = [...new Set(transacoes.map(t => t.date.slice(0, 7)))].sort();

  const receitas = meses.map(m => 
    transacoes
      .filter(t => t.date.startsWith(m) && t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0)
  );

  const despesas = meses.map(m => 
    transacoes
      .filter(t => t.date.startsWith(m) && t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0)
  );

  const elemChart = document.getElementById('chartLinha');
  if (document.querySelector('#chartLinha .apexcharts-canvas')) {
    document.querySelector('#chartLinha .apexcharts-canvas').parentElement.innerHTML = '';
  }

  new ApexCharts(elemChart, {
    chart: { type: 'line', height: 300, sparkline: { enabled: false } },
    series: [
      { name: 'Receitas', data: receitas },
      { name: 'Despesas', data: despesas }
    ],
    xaxis: { categories: meses },
    colors: ['#10b981', '#ef4444'],
    stroke: { width: 2 },
    grid: { borderColor: '#475569' },
    theme: { mode: 'dark' }
  }).render();
}

function graficoDespesasPorCategoria(transacoes) {
  const despesas = {};

  transacoes
    .filter(t => t.type === 'despesa')
    .forEach(t => {
      despesas[t.category] = (despesas[t.category] || 0) + t.value;
    });

  if (Object.keys(despesas).length === 0) return;

  const elemChart = document.getElementById('chartCategoria');
  if (document.querySelector('#chartCategoria .apexcharts-canvas')) {
    document.querySelector('#chartCategoria .apexcharts-canvas').parentElement.innerHTML = '';
  }

  new ApexCharts(elemChart, {
    chart: { type: 'donut', height: 300 },
    series: Object.values(despesas),
    labels: Object.keys(despesas),
    colors: ['#0096d6', '#38bdf8', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
    theme: { mode: 'dark' }
  }).render();
}

function graficoReceitasPorCategoria(transacoes) {
  const receitas = {};

  transacoes
    .filter(t => t.type === 'receita')
    .forEach(t => {
      receitas[t.category] = (receitas[t.category] || 0) + t.value;
    });

  if (Object.keys(receitas).length === 0) return;

  const elemChart = document.getElementById('chartCategoriasReceita');
  if (document.querySelector('#chartCategoriasReceita .apexcharts-canvas')) {
    document.querySelector('#chartCategoriasReceita .apexcharts-canvas').parentElement.innerHTML = '';
  }

  new ApexCharts(elemChart, {
    chart: { type: 'pie', height: 300 },
    series: Object.values(receitas),
    labels: Object.keys(receitas),
    colors: ['#10b981', '#38bdf8', '#0096d6', '#8b5cf6', '#f59e0b'],
    theme: { mode: 'dark' }
  }).render();
}

function graficoDistribuicaoDespesas(transacoes) {
  const despesas = {};

  transacoes
    .filter(t => t.type === 'despesa')
    .forEach(t => {
      despesas[t.category] = (despesas[t.category] || 0) + t.value;
    });

  if (Object.keys(despesas).length === 0) return;

  const elemChart = document.getElementById('chartDespesasDistrib');
  if (document.querySelector('#chartDespesasDistrib .apexcharts-canvas')) {
    document.querySelector('#chartDespesasDistrib .apexcharts-canvas').parentElement.innerHTML = '';
  }

  new ApexCharts(elemChart, {
    chart: { type: 'bar', height: 300 },
    series: [{
      name: 'Valor',
      data: Object.values(despesas)
    }],
    xaxis: {
      categories: Object.keys(despesas)
    },
    colors: ['#38bdf8'],
    grid: { borderColor: '#475569' },
    theme: { mode: 'dark' }
  }).render();
}

// ========== TRANSAÇÕES ==========
function carregarTransacoes() {
  const transacoes = obterTransacoes();
  const tbody = document.querySelector('#transacoesTable tbody');
  tbody.innerHTML = '';

  const search = document.getElementById('searchTransacoes').value.toLowerCase();
  const filterCat = document.getElementById('filterCategoria').value;
  const filterType = document.getElementById('filterTipo').value;

  const filtradas = transacoes.filter(t => {
    const matchSearch = t.descricao.toLowerCase().includes(search);
    const matchCat = !filterCat || t.category === filterCat;
    const matchType = !filterType || t.type === filterType;
    return matchSearch && matchCat && matchType;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

  filtradas.forEach(transacao => {
    const tr = document.createElement('tr');
    const dataBR = new Date(transacao.date).toLocaleDateString('pt-BR');
    const valor = `R$ ${transacao.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    const badge = transacao.type === 'receita' 
      ? '<span style="background: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Receita</span>'
      : '<span style="background: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Despesa</span>';

    tr.innerHTML = `
      <td>${dataBR}</td>
      <td>${transacao.descricao}</td>
      <td>${transacao.category}</td>
      <td>${badge}</td>
      <td style="font-weight: bold; color: ${transacao.type === 'receita' ? '#10b981' : '#ef4444'}">${valor}</td>
      <td>
        <div class="table-actions">
          <button class="edit" onclick="abrirModal('${transacao.id}')">Editar</button>
          <button class="delete" onclick="deletarTransacao('${transacao.id}')">Deletar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deletarTransacao(id) {
  if (confirm('Tem certeza que deseja deletar esta transação?')) {
    let transacoes = obterTransacoes();
    transacoes = transacoes.filter(t => t.id !== id);
    salvarTransacoes(transacoes);
    carregarTransacoes();
    atualizarDashboard();
  }
}

document.getElementById('searchTransacoes')?.addEventListener('input', carregarTransacoes);
document.getElementById('filterCategoria')?.addEventListener('change', carregarTransacoes);
document.getElementById('filterTipo')?.addEventListener('change', carregarTransacoes);

document.getElementById('clearFilters')?.addEventListener('click', () => {
  document.getElementById('searchTransacoes').value = '';
  document.getElementById('filterCategoria').value = '';
  document.getElementById('filterTipo').value = '';
  carregarTransacoes();
});

// ========== RELATÓRIOS ==========
document.getElementById('gerarRelatorio')?.addEventListener('click', () => {
  const mesSelecionado = document.getElementById('filtroMes').value;
  if (!mesSelecionado) {
    alert('Selecione um mês!');
    return;
  }

  const transacoes = obterTransacoes();
  const filtradas = transacoes.filter(t => t.date.startsWith(mesSelecionado));

  let receita = 0, despesa = 0;
  filtradas.forEach(t => {
    if (t.type === 'receita') receita += t.value;
    else despesa += t.value;
  });

  const saldo = receita - despesa;

  document.getElementById('totalReceitaPeriodo').textContent = `R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('totalDespesaPeriodo').textContent = `R$ ${despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('totalSaldoPeriodo').textContent = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const despesasCateg = {};
  filtradas
    .filter(t => t.type === 'despesa')
    .forEach(t => {
      despesasCateg[t.category] = (despesasCateg[t.category] || 0) + t.value;
    });

  if (Object.keys(despesasCateg).length > 0) {
    const elemChart = document.getElementById('chartRelatorioDetalhes');
    if (document.querySelector('#chartRelatorioDetalhes .apexcharts-canvas')) {
      document.querySelector('#chartRelatorioDetalhes .apexcharts-canvas').parentElement.innerHTML = '';
    }

    new ApexCharts(elemChart, {
      chart: { type: 'bar', height: 400 },
      series: [{
        name: 'Despesas',
        data: Object.values(despesasCateg)
      }],
      xaxis: {
        categories: Object.keys(despesasCateg)
      },
      colors: ['#38bdf8'],
      grid: { borderColor: '#475569' },
      theme: { mode: 'dark' }
    }).render();
  }
});

// ========== MUDANÇA DE TIPO NA MODAL ==========
document.addEventListener('change', function(e) {
  if (e.target.name === 'tipo') {
    const categoriaSelect = document.getElementById('categoria');
    categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';

    if (e.target.value === 'receita') {
      adicionarOpcoes(categoriaSelect, CATEGORIAS_RECEITA);
    } else {
      adicionarOpcoes(categoriaSelect, CATEGORIAS_DESPESA);
    }
  }
});

function configurarEventos() {
  // Já configurados acima
}

function graficoSaldo(data){
 let saldo=0;
 const meses=[...new Set(data.map(d=>d.date))];
 const acumulado=meses.map(m=>{
   data.filter(d=>d.date===m).forEach(d=>{
     saldo+= d.type==="receita"?d.value:-d.value;
   });
   return saldo;
 });

 new ApexCharts(document.querySelector("#chartSaldo"),{
   chart:{type:"area",height:300},
   series:[{name:"Saldo acumulado",data:acumulado}],
   xaxis:{categories:meses}
 }).render();
}

calcularKPIs(transactions);
graficoLinha(transactions);
graficoCategoria(transactions);
graficoSaldo(transactions);
// ============================
// MENU INTERAÇÕES
// ============================

document.querySelectorAll(".menu-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    const page = btn.dataset.page;

    if(page === "dashboard"){
      alert("Você já está no Dashboard");
    }

    if(page === "relatorios"){
      alert("Abrir Relatórios (implementar página futura)");
    }

    if(page === "categorias"){
      alert("Abrir Categorias");
    }

    if(page === "config"){
      alert("Abrir Configurações");
    }

  });

});