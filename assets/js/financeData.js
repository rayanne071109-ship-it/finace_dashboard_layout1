// Dados iniciais de exemplo para o seu dashboard financeiro
const DADOS_INICIAIS = [
  { id: '1', date: '2025-01-05', type: 'receita', category: 'Salário', descricao: 'Salário do mês - Janeiro', value: 4500 },
  { id: '2', date: '2025-01-10', type: 'despesa', category: 'Moradia', descricao: 'Aluguel - Janeiro', value: 1500 },
  { id: '3', date: '2025-01-12', type: 'despesa', category: 'Alimentação', descricao: 'Compras no supermercado', value: 350 },
  { id: '4', date: '2025-01-15', type: 'despesa', category: 'Transporte', descricao: 'Combustível carro', value: 200 },
  { id: '5', date: '2025-01-20', type: 'receita', category: 'Freelance', descricao: 'Projeto freelancer', value: 1200 },
  
  { id: '6', date: '2025-02-05', type: 'receita', category: 'Salário', descricao: 'Salário do mês - Fevereiro', value: 4500 },
  { id: '7', date: '2025-02-10', type: 'despesa', category: 'Moradia', descricao: 'Aluguel - Fevereiro', value: 1500 },
  { id: '8', date: '2025-02-12', type: 'despesa', category: 'Alimentação', descricao: 'Compras no supermercado', value: 420 },
  { id: '9', date: '2025-02-18', type: 'despesa', category: 'Saúde', descricao: 'Consulta médica e medicamentos', value: 300 },
  { id: '10', date: '2025-02-25', type: 'receita', category: 'Freelance', descricao: 'Outro projeto freelancer', value: 800 },
  
  { id: '11', date: '2025-03-05', type: 'receita', category: 'Salário', descricao: 'Salário do mês - Março', value: 4500 },
  { id: '12', date: '2025-03-10', type: 'despesa', category: 'Moradia', descricao: 'Aluguel - Março', value: 1500 },
  { id: '13', date: '2025-03-15', type: 'despesa', category: 'Utilities', descricao: 'Conta de luz', value: 150 },
  { id: '14', date: '2025-03-18', type: 'despesa', category: 'Utilities', descricao: 'Internet', value: 80 },
  { id: '15', date: '2025-03-20', type: 'despesa', category: 'Entretenimento', descricao: 'Cinema e diversão', value: 100 },
  { id: '16', date: '2025-03-25', type: 'receita', category: 'Investimentos', descricao: 'Rendimento de investimento', value: 250 }
];

// Inicializar dados no localStorage se estiverem vazios
document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('transacoes') || JSON.parse(localStorage.getItem('transacoes')).length === 0) {
    localStorage.setItem('transacoes', JSON.stringify(DADOS_INICIAIS));
  }
});
