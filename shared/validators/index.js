/**
 * Validadores para os dados de entrada da API
 */

/**
 * Valida dados de criação de leilão
 * @param {Object} data - Dados do leilão
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateLeilao(data) {
  const errors = [];

  if (!data.titulo || typeof data.titulo !== 'string' || data.titulo.trim().length === 0) {
    errors.push('Título é obrigatório');
  }

  if (!data.descricao || typeof data.descricao !== 'string') {
    errors.push('Descrição é obrigatória');
  }

  if (!data.valorInicial || typeof data.valorInicial !== 'number' || data.valorInicial <= 0) {
    errors.push('Valor inicial deve ser um número positivo');
  }

  if (!data.dataInicio) {
    errors.push('Data de início é obrigatória');
  } else {
    const dataInicio = new Date(data.dataInicio);
    if (isNaN(dataInicio.getTime())) {
      errors.push('Data de início inválida');
    }
  }

  if (!data.dataFim) {
    errors.push('Data de fim é obrigatória');
  } else {
    const dataFim = new Date(data.dataFim);
    if (isNaN(dataFim.getTime())) {
      errors.push('Data de fim inválida');
    }
    
    if (data.dataInicio && dataFim <= new Date(data.dataInicio)) {
      errors.push('Data de fim deve ser posterior à data de início');
    }
  }

  // PLACEHOLDER: Adicione mais validações conforme necessário
  // Por exemplo: categoria, imagens, dados do vendedor, etc.

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida dados de criação de lance
 * @param {Object} data - Dados do lance
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateLance(data) {
  const errors = [];

  if (!data.leilaoId || typeof data.leilaoId !== 'string') {
    errors.push('ID do leilão é obrigatório');
  }

  if (!data.usuarioId || typeof data.usuarioId !== 'string') {
    errors.push('ID do usuário é obrigatório');
  }

  if (!data.valor || typeof data.valor !== 'number' || data.valor <= 0) {
    errors.push('Valor do lance deve ser um número positivo');
  }

  // PLACEHOLDER: Adicione validações de regras de negócio
  // Por exemplo: incremento mínimo, lance não inferior ao anterior, etc.

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida dados de usuário
 * @param {Object} data - Dados do usuário
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateUsuario(data) {
  const errors = [];

  if (!data.nome || typeof data.nome !== 'string' || data.nome.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email inválido');
    }
  }

  // PLACEHOLDER: Adicione validações de autenticação/autorização
  // Por exemplo: senha, telefone, documentos, etc.

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateLeilao,
  validateLance,
  validateUsuario
};
