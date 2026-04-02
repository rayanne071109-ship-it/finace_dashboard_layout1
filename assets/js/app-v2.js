// ========== CONFIGURAÇÕES INICIAIS ==========
const CATEGORIAS_DESPESA = ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Moradia', 'Utilities', 'Vestuário', 'Outros'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Bônus', 'Outras Receitas'];

let chartLinha, chartComparativo, chartCategoria, chartReceitasCateg, chartDespesasDistrib, chartRelatorioDetalhes, chartComparativoPeriodos;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  setarDataAtual();
  populateCategorias();
  configEventosGlobais();
  atualizarDashboard();
  mostrarNotificacao('Bem-vindo ao Finance Pro! 💰', 'sucesso', 3000);
});

// ========== ELEMENTOS DO DOM ==========
const modal = document.getElementById('modalTransacao');
const modalMeta = document.getElementById('modalMeta');
const formTransacao = document.getElementById('formTransacao');
const formMeta = document.getElementById('formMeta');
const closeModal = document.getElementById('closeModal');
const closeModalMeta = document.getElementById('closeModalMeta');
const cancelBtn = document.getElementById('cancelBtn');
const cancelMetaBtn = document.getElementById('cancelMetaBtn');
const deleteBtn = document.getElementById('deleteBtn');
const deleteMetaBtn = document.getElementById('deleteMetaBtn');
const addBtn = document.getElementById('addBtn');
const addBtn2 = document.getElementById('addBtn2');
const addMetaBtn = document.getElementById('addMetaBtn');

// ========== UTILIDADES ==========
function setarDataAtual() {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data').value = hoje;
  document.getElementById('filtroMes').valueAsDate = new Date();
}

function populateCategorias() {
  const categoriaSelect = document.getElementById('categoria');
  const categoriaFilter = document.getElementById('filterCategoria');
  const metaCategoriaSelect = document.getElementById('metaCategoria');

  adicionarOpcoes(categoriaSelect, CATEGORIAS_DESPESA);
  adicionarOpcoes(categoriaFilter, CATEGORIAS_DESPESA.concat(CATEGORIAS_RECEITA));
  adicionarOpcoes(metaCategoriaSelect, CATEGORIAS_DESPESA);
}

function adicionarOpcoes(element, opcoes) {
  opcoes.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    element.appendChild(option);
  });
}

// ========== NOTIFICAÇÕES ==========
function mostrarNotificacao(mensagem, tipo = 'info', duracao = 5000) {
  const container = document.getElementById('notificacoes');
  const notif = document.createElement('div');
  notif.className = `notificacao ${tipo}`;
  notif.textContent = mensagem;
  
  container.appendChild(notif);

  setTimeout(() => {
    notif.classList.add('removing');
    setTimeout(() => notif.remove(), 300);
  }, duracao);
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

  setTimeout(() => {
    if (pageName === 'dashboard') {
      atualizarDashboard();
    } else if (pageName === 'transacoes') {
      carregarTransacoes();
    } else if (pageName === 'metas') {
      carregarMetas();
    } else if (pageName === 'resumo') {
      gerarResumoExecutivo();
    }
  }, 50);
}

// ========== MODAL TRANSAÇÃO ==========
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
    mostrarNotificacao('Preencha todos os campos!', 'aviso');
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
    mostrarNotificacao('Transação atualizada com sucesso! ✏️', 'sucesso');
  } else {
    transacoes.push(transacao);
    mostrarNotificacao('Transação adicionada com sucesso! ✅', 'sucesso');
  }

  salvarTransacoes(transacoes);
  fecharModal();
  atualizarDashboard();
  carregarTransacoes();
  verificarMetas();
});

deleteBtn.addEventListener('click', () => {
  const id = document.getElementById('transacaoId').value;
  if (confirm('Tem certeza que deseja deletar esta transação?')) {
    let transacoes = obterTransacoes();
    transacoes = transacoes.filter(t => t.id !== id);
    salvarTransacoes(transacoes);
    mostrarNotificacao('Transação deletada! 🗑️', 'info');
    fecharModal();
    atualizarDashboard();
    carregarTransacoes();
  }
});

// ========== MODAL METAS ==========
function abrirModalMeta(id = null) {
  document.getElementById('metaId').value = id || '';
  deleteMetaBtn.classList.add('hidden');

  if (id) {
    const meta = obterMeta(id);
    document.getElementById('modalMetaTitle').textContent = 'Editar Meta';
    document.getElementById('metaCategoria').value = meta.categoria;
    document.getElementById('metaValor').value = meta.valor;
    document.getElementById('metaPeriodo').value = meta.periodo;
    document.getElementById('metaDescricao').value = meta.descricao || '';
    deleteMetaBtn.classList.remove('hidden');
  } else {
    document.getElementById('modalMetaTitle').textContent = 'Nova Meta';
    formMeta.reset();
  }

  modalMeta.classList.add('active');
}

function fecharModalMeta() {
  modalMeta.classList.remove('active');
  formMeta.reset();
}

closeModalMeta.addEventListener('click', fecharModalMeta);
cancelMetaBtn.addEventListener('click', fecharModalMeta);
addMetaBtn.addEventListener('click', () => abrirModalMeta());

modalMeta.addEventListener('click', (e) => {
  if (e.target === modalMeta) fecharModalMeta();
});

// ========== FORM METAS ==========
formMeta.addEventListener('submit', (e) => {
  e.preventDefault();

  const categoria = document.getElementById('metaCategoria').value;
  const valor = parseFloat(document.getElementById('metaValor').value);
  const periodo = document.getElementById('metaPeriodo').value;
  const descricao = document.getElementById('metaDescricao').value;
  const id = document.getElementById('metaId').value;

  if (!categoria || !valor || !periodo) {
    mostrarNotificacao('Preencha os campos obrigatórios!', 'aviso');
    return;
  }

  const meta = {
    id: id || Date.now().toString(),
    categoria,
    valor,
    periodo,
    descricao,
    dataCriacao: new Date().toISOString()
  };

  let metas = obterMetas();
  if (id) {
    metas = metas.map(m => m.id === id ? meta : m);
    mostrarNotificacao('Meta atualizada! ✏️', 'sucesso');
  } else {
    metas.push(meta);
    mostrarNotificacao('Meta criada com sucesso! 🎯', 'sucesso');
  }

  salvarMetas(metas);
  fecharModalMeta();
  carregarMetas();
  gerarResumoExecutivo();
});

deleteMetaBtn.addEventListener('click', () => {
  const id = document.getElementById('metaId').value;
  if (confirm('Tem certeza que deseja deletar esta meta?')) {
    let metas = obterMetas();
    metas = metas.filter(m => m.id !== id);
    salvarMetas(metas);
    mostrarNotificacao('Meta deletada! 🗑️', 'info');
    fecharModalMeta();
    carregarMetas();
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

function obterMetas() {
  return JSON.parse(localStorage.getItem('metas')) || [];
}

function salvarMetas(metas) {
  localStorage.setItem('metas', JSON.stringify(metas));
}

function obterMeta(id) {
  return obterMetas().find(m => m.id === id);
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

  // ANIMAÇÃO DE CONTAGEM
  animarContagem('receita', receita);
  animarContagem('despesa', despesa);
  animarContagem('saldo', saldo);
  animarContagem('media', media);

  // Calcular variações (comparativo com mês anterior)
  const variacoes = calcularVariacoes(transacoes);
  document.getElementById('receita-change').textContent = variacoes.receitaChange;
  document.getElementById('despesa-change').textContent = variacoes.despesaChange;
  document.getElementById('saldo-change').textContent = variacoes.saldoChange;
  document.getElementById('media-change').textContent = variacoes.mediaChange;

  document.getElementById('saldo').parentElement.classList.toggle('card-success', saldo >= 0);
  document.getElementById('saldo').parentElement.classList.toggle('card-danger', saldo < 0);
}

// ANIMAÇÃO DE CONTAGEM DE NÚMEROS
function animarContagem(elementId, valorFinal) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  const valorInicial = 0;
  const duracao = 1000;
  const inicio = Date.now();

  function frame() {
    const progresso = Math.min((Date.now() - inicio) / duracao, 1);
    const valorAtual = Math.floor(valorInicial + (valorFinal - valorInicial) * progresso);
    elemento.textContent = `R$ ${(valorFinal < 0 ? -Math.abs(valorAtual) : valorAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    if (progresso < 1) requestAnimationFrame(frame);
    else elemento.textContent = `R$ ${valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  requestAnimationFrame(frame);
}

// CÁLCULO DE VARIAÇÕES
function calcularVariacoes(transacoes) {
  const agora = new Date();
  const mesAtual = agora.getFullYear() + '-' + String(agora.getMonth() + 1).padStart(2, '0');
  const mesPassed = new Date(agora.getFullYear(), agora.getMonth() - 1).getFullYear() + '-' + String(new Date(agora.getFullYear(), agora.getMonth() - 1).getMonth() + 1).padStart(2, '0');

  let receitaAtual = 0, despesaAtual = 0, receitaPassed = 0, despesaDPassed = 0;

  transacoes.forEach(t => {
    if (t.date.startsWith(mesAtual)) {
      if (t.type === 'receita') receitaAtual += t.value;
      else despesaAtual += t.value;
    } else if (t.date.startsWith(mesPassed)) {
      if (t.type === 'receita') receitaPassed += t.value;
      else despesaDPassed += t.value;
    }
  });

  const calcularVariacao = (atual, anterior) => {
    if (anterior === 0) return '+0%';
    const perc = ((atual - anterior) / anterior) * 100;
    const sinal = perc >= 0 ? '↗' : '↘';
    return `${sinal} ${Math.abs(perc).toFixed(1)}%`;
  };

  return {
    receitaChange: calcularVariacao(receitaAtual, receitaPassed),
    despesaChange: calcularVariacao(despesaAtual, despesaDPassed),
    saldoChange: calcularVariacao((receitaAtual - despesaAtual), (receitaPassed - despesaDPassed)),
    mediaChange: '↗ +0%'
  };
}

function renderizarGraficos(transacoes) {
  if (transacoes.length === 0) {
    document.getElementById('chartLinha').innerHTML = '<p style="text-align:center;padding:20px">Nenhum dado disponível</p>';
    return;
  }

  graficoReceitasDespesas(transacoes);
  graficoComparativoMeses(transacoes);
  graficoDespesasPorCategoria(transacoes);
  graficoReceitasPorCategoria(transacoes);
  graficoDistribuicaoDespesas(transacoes);
}

function graficoReceitasDespesas(transacoes) {
  const meses = [...new Set(transacoes.map(t => t.date.slice(0, 7)))].sort().slice(-12);

  const receitas = meses.map(m => 
    transacoes.filter(t => t.date.startsWith(m) && t.type === 'receita').reduce((sum, t) => sum + t.value, 0)
  );

  const despesas = meses.map(m => 
    transacoes.filter(t => t.date.startsWith(m) && t.type === 'despesa').reduce((sum, t) => sum + t.value, 0)
  );

  const elemChart = document.getElementById('chartLinha');
  if (elemChart.innerHTML) elemChart.innerHTML = '';

  chartLinha = new ApexCharts(elemChart, {
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
  });
  chartLinha.render();
}

function graficoComparativoMeses(transacoes) {
  const meses = [...new Set(transacoes.map(t => t.date.slice(0, 7)))].sort().slice(-6);

  const receitas = meses.map(m => 
    transacoes.filter(t => t.date.startsWith(m) && t.type === 'receita').reduce((sum, t) => sum + t.value, 0)
  );

  const despesas = meses.map(m => 
    transacoes.filter(t => t.date.startsWith(m) && t.type === 'despesa').reduce((sum, t) => sum + t.value, 0)
  );

  const elemChart = document.getElementById('chartComparativo');
  if (elemChart.innerHTML) elemChart.innerHTML = '';

  chartComparativo = new ApexCharts(elemChart, {
    chart: { type: 'bar', height: 300 },
    series: [
      { name: 'Receitas', data: receitas },
      { name: 'Despesas', data: despesas }
    ],
    xaxis: { categories: meses },
    colors: ['#10b981', '#ef4444'],
    grid: { borderColor: '#475569' },
    theme: { mode: 'dark' }
  });
  chartComparativo.render();
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
  if (elemChart.innerHTML) elemChart.innerHTML = '';

  chartCategoria = new ApexCharts(elemChart, {
    chart: { type: 'donut', height: 300 },
    series: Object.values(despesas),
    labels: Object.keys(despesas),
    colors: ['#0096d6', '#38bdf8', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
    theme: { mode: 'dark' }
  });
  chartCategoria.render();
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
  if (elemChart.innerHTML) elemChart.innerHTML = '';

  chartReceitasCateg = new ApexCharts(elemChart, {
    chart: { type: 'pie', height: 300 },
    series: Object.values(receitas),
    labels: Object.keys(receitas),
    colors: ['#10b981', '#38bdf8', '#0096d6', '#8b5cf6', '#f59e0b'],
    theme: { mode: 'dark' }
  });
  chartReceitasCateg.render();
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
  if (elemChart.innerHTML) elemChart.innerHTML = '';

  chartDespesasDistrib = new ApexCharts(elemChart, {
    chart: { type: 'bar', height: 300 },
    series: [{
      name: 'Valor',
      data: Object.values(despesas)
    }],
    xaxis: { categories: Object.keys(despesas) },
    colors: ['#38bdf8'],
    grid: { borderColor: '#475569' },
    theme: { mode: 'dark' }
  });
  chartDespesasDistrib.render();
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
    mostrarNotificacao('Transação deletada! 🗑️', 'info');
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

// ========== METAS ==========
function carregarMetas() {
  const metas = obterMetas();
  const container = document.getElementById('metasContainer');
  container.innerHTML = '';

  if (metas.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8">Nenhuma meta criada. Clique em + Nova Meta para começar!</p>';
    return;
  }

  metas.forEach(meta => {
    const card = criarCardMeta(meta);
    container.appendChild(card);
  });
}

function criarCardMeta(meta) {
  const transacoes = obterTransacoes();
  const gastoAtual = transacoes
    .filter(t => t.type === 'despesa' && t.category === meta.categoria)
    .reduce((sum, t) => sum + t.value, 0);

  const percentual = (gastoAtual / meta.valor) * 100;
  const statusColor = percentual > 100 ? 'critical' : percentual > 80 ? 'warning' : '';
  const statusTexto = percentual > 100 ? 'ULTRAPASSA' : percentual > 80 ? 'ATENÇÃO' : 'OK';

  const card = document.createElement('div');
  card.className = 'meta-card';
  card.innerHTML = `
    <div class="meta-header">
      <h3>${meta.categoria}</h3>
      <div class="meta-actions">
        <button class="edit" onclick="abrirModalMeta('${meta.id}')">✏️</button>
        <button class="delete" onclick="deletarMeta('${meta.id}')">🗑️</button>
      </div>
    </div>

    <div class="meta-info">
      <p>Limite: <span class="meta-valor">R$ ${meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
      <p>Gasto: <span class="meta-valor">R$ ${gastoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
      <p>Período: <strong>${meta.periodo}</strong></p>
      ${meta.descricao ? `<p style="font-size:12px;color:#94a3b8;margin-top:10px">📝 ${meta.descricao}</p>` : ''}
    </div>

    <div class="meta-progress">
      <div class="meta-progress-bar ${statusColor}" style="width: ${Math.min(percentual, 100)}%"></div>
    </div>

    <div class="meta-status">
      <span>${percentual.toFixed(0)}% - <strong style="color:${percentual > 100 ? '#ef4444' : percentual > 80 ? '#f59e0b' : '#10b981'}">${statusTexto}</strong></span>
    </div>
  `;

  return card;
}

function deletarMeta(id) {
  if (confirm('Tem certeza que deseja deletar esta meta?')) {
    let metas = obterMetas();
    metas = metas.filter(m => m.id !== id);
    salvarMetas(metas);
    mostrarNotificacao('Meta deletada! 🗑️', 'info');
    carregarMetas();
  }
}

function verificarMetas() {
  const metas = obterMetas();
  const transacoes = obterTransacoes();

  metas.forEach(meta => {
    const gastoAtual = transacoes
      .filter(t => t.type === 'despesa' && t.category === meta.categoria)
      .reduce((sum, t) => sum + t.value, 0);

    if (gastoAtual > meta.valor) {
      mostrarNotificacao(`⚠️ ALERTA: Você ultrapassou a meta de ${meta.categoria}!`, 'aviso', 6000);
    } else if (gastoAtual > meta.valor * 0.8) {
      mostrarNotificacao(`📊 ${meta.categoria} está em ${(gastoAtual / meta.valor * 100).toFixed(0)}% da meta`, 'info', 5000);
    }
  });
}

// ========== RESUMO EXECUTIVO ==========
function gerarResumoExecutivo() {
  const transacoes = obterTransacoes();
  const metas = obterMetas();

  // INSIGHTS
  const receitaTotal = transacoes.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
  const despesaTotal = transacoes.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
  const saldo = receitaTotal - despesaTotal;
  const economiaPercentual = (saldo / receitaTotal * 100).toFixed(1);

  let insightsHTML = `
    <div class="insight-item">💰 Receita Total: <strong>R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
    <div class="insight-item">💸 Despesa Total: <strong>R$ ${despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
    <div class="insight-item">⚖️ Saldo: <strong>R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
    <div class="insight-item">📈 Taxa de Economia: <strong>${economiaPercentual}%</strong></div>
  `;

  // TENDÊNCIAS
  const meses = [...new Set(transacoes.map(t => t.date.slice(0, 7)))].sort().slice(-3);
  let tendenciasHTML = '';

  meses.forEach(mes => {
    const receitaMes = transacoes.filter(t => t.date.startsWith(mes) && t.type === 'receita').reduce((sum, t) => sum + t.value, 0);
    const despesaMes = transacoes.filter(t => t.date.startsWith(mes) && t.type === 'despesa').reduce((sum, t) => sum + t.value, 0);
    const saldoMes = receitaMes - despesaMes;
    
    tendenciasHTML += `<div class="tendencia-item">📅 ${mes}: R$ ${saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>`;
  });

  // ALERTAS
  let alertasHTML = '';
  metas.forEach(meta => {
    const gastoAtual = transacoes.filter(t => t.type === 'despesa' && t.category === meta.categoria).reduce((sum, t) => sum + t.value, 0);
    const percentual = (gastoAtual / meta.valor) * 100;
    
    if (percentual > 100) {
      alertasHTML += `<div class="alerta-item">⚠️ <strong>${meta.categoria}</strong> ultrapassou em ${(percentual - 100).toFixed(0)}%!</div>`;
    } else if (percentual > 80) {
      alertasHTML += `<div class="alerta-item">📊 <strong>${meta.categoria}</strong> está ${percentual.toFixed(0)}% da meta</div>`;
    }
  });

  if (!alertasHTML) alertasHTML = '<p style="color:#94a3b8;font-size:12px">✅ Nenhum alerta no momento!</p>';

  // STATUS METAS
  let metasHTML = '';
  metas.forEach(meta => {
    const gastoAtual = transacoes.filter(t => t.type === 'despesa' && t.category === meta.categoria).reduce((sum, t) => sum + t.value, 0);
    const percentual = (gastoAtual / meta.valor) * 100;
    metasHTML += `<div class="meta-item">🎯 <strong>${meta.categoria}</strong>: ${percentual.toFixed(0)}% de R$ ${meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>`;
  });

  if (!metasHTML) metasHTML = '<p style="color:#94a3b8;font-size:12px">Nenhuma meta criada</p>';

  document.getElementById('resumoInsights').innerHTML = insightsHTML;
  document.getElementById('resumoTendencias').innerHTML = tendenciasHTML || '<p style="color:#94a3b8">Dados insuficientes</p>';
  document.getElementById('resumoAlertas').innerHTML = alertasHTML;
  document.getElementById('resumoMetas').innerHTML = metasHTML;
}

// ========== RELATÓRIOS ==========
function gerarRelatorio() {
  const tipoFiltro = document.getElementById('tipoFiltro').value;
  const filtroMes = document.getElementById('filtroMes').value;

  let dataInicio, dataFim;

  if (tipoFiltro === 'mes') {
    dataInicio = filtroMes + '-01';
    dataFim = new Date(filtroMes + '-01');
    dataFim.setMonth(dataFim.getMonth() + 1);
    dataFim.setDate(dataFim.getDate() - 1);
    dataFim = dataFim.toISOString().split('T')[0];
  } else if (tipoFiltro === 'trimestre') {
    const [ano, mes] = filtroMes.split('-');
    const trimestre = Math.ceil(parseInt(mes) / 3);
    const mesInicio = (trimestre - 1) * 3 + 1;
    const mesFim = trimestre * 3;
    dataInicio = anno + '-' + String(mesInicio).padStart(2, '0') + '-01';
    dataFim = anno + '-' + String(mesFim).padStart(2, '0') + '-28';
  } else if (tipoFiltro === 'customizado') {
    dataInicio = document.getElementById('filtroDataInicio').value;
    dataFim = document.getElementById('filtroDataFim').value;
    if (!dataInicio || !dataFim) {
      mostrarNotificacao('Selecione o período!', 'aviso');
      return;
    }
  }

  const transacoes = obterTransacoes();
  const filtradas = transacoes.filter(t => t.date >= dataInicio && t.date <= dataFim);

  let receita = 0, despesa = 0;
  filtradas.forEach(t => {
    if (t.type === 'receita') receita += t.value;
    else despesa += t.value;
  });

  const saldo = receita - despesa;

  document.getElementById('totalReceitaPeriodo').textContent = `R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('totalDespesaPeriodo').textContent = `R$ ${despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('totalSaldoPeriodo').textContent = `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // Gráfico detalhado
  const despesasCateg = {};
  filtradas.filter(t => t.type === 'despesa').forEach(t => {
    despesasCateg[t.category] = (despesasCateg[t.category] || 0) + t.value;
  });

  if (Object.keys(despesasCateg).length > 0) {
    const elemChart = document.getElementById('chartRelatorioDetalhes');
    if (elemChart.innerHTML) elemChart.innerHTML = '';

    chartRelatorioDetalhes = new ApexCharts(elemChart, {
      chart: { type: 'bar', height: 400 },
      series: [{ name: 'Despesas', data: Object.values(despesasCateg) }],
      xaxis: { categories: Object.keys(despesasCateg) },
      colors: ['#38bdf8'],
      grid: { borderColor: '#475569' },
      theme: { mode: 'dark' }
    });
    chartRelatorioDetalhes.render();
  }

  mostrarNotificacao('Relatório gerado com sucesso! 📊', 'sucesso');
}

document.getElementById('tipoFiltro')?.addEventListener('change', (e) => {
  const customizado = document.getElementById('filtroCustomizado');
  if (e.target.value === 'customizado') {
    customizado.classList.remove('hidden');
  } else {
    customizado.classList.add('hidden');
  }
});

document.getElementById('gerarRelatorio')?.addEventListener('click', gerarRelatorio);

// ========== EXPORT DE DADOS ==========
function exportarCSV(dados, nome = 'relatorio') {
  let csv = 'Data,Descrição,Categoria,Tipo,Valor\n';
  
  dados.forEach(t => {
    csv += `${t.date},"${t.descricao}",${t.category},${t.type},${t.value.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${nome}_${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
  
  mostrarNotificacao('Arquivo CSV exportado! 📥', 'sucesso');
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let yPosition = 10;
  doc.setFontSize(16);
  doc.text('Relatório Financeiro', 10, yPosition);
  yPosition += 10;

  const transacoes = obterTransacoes();
  let receita = 0, despesa = 0;

  transacoes.forEach(t => {
    if (t.type === 'receita') receita += t.value;
    else despesa += t.value;
  });

  const saldo = receita - despesa;

  doc.setFontSize(12);
  doc.text(`Receita Total: R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10, yPosition);
  yPosition += 7;
  doc.text(`Despesa Total: R$ ${despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10, yPosition);
  yPosition += 7;
  doc.text(`Saldo: R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 10, yPosition);
  yPosition += 15;

  doc.setFontSize(11);
  doc.text('Últimas Transações:', 10, yPosition);
  yPosition += 7;

  transacoes.slice(-10).forEach(t => {
    const texto = `${t.date} | ${t.descricao} | ${t.category} | R$ ${t.value.toFixed(2)}`;
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 10;
    }
    doc.setFontSize(9);
    doc.text(texto, 10, yPosition);
    yPosition += 5;
  });

  doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
  mostrarNotificacao('PDF exportado! 📥', 'sucesso');
}

document.getElementById('exportCSV')?.addEventListener('click', () => {
  exportarCSV(obterTransacoes(), 'transacoes');
});

document.getElementById('exportPDF')?.addEventListener('click', exportarPDF);

document.getElementById('exportRelatorioCSV')?.addEventListener('click', () => {
  exportarCSV(obterTransacoes(), 'relatorio');
});

document.getElementById('exportRelatorioPDF')?.addEventListener('click', exportarPDF);

// ========== PRINT ==========
document.getElementById('printBtn')?.addEventListener('click', () => {
  window.print();
  mostrarNotificacao('Impressão iniciada! 🖨️', 'info');
});

document.getElementById('printRelatorio')?.addEventListener('click', () => {
  window.print();
  mostrarNotificacao('Impressão iniciada! 🖨️', 'info');
});

document.getElementById('printResumo')?.addEventListener('click', () => {
  window.print();
  mostrarNotificacao('Impressão iniciada! 🖨️', 'info');
});

// ========== CONFIGURAÇÕES GLOBAIS ==========
function configEventosGlobais() {
  // Alterar categorias ao mudar tipo na modal
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
}
