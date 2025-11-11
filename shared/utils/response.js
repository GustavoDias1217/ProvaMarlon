/**
 * Utilitário para gerar respostas HTTP padronizadas
 */

/**
 * Cria uma resposta HTTP de sucesso
 * @param {number} statusCode - Código HTTP (200, 201, etc)
 * @param {Object} data - Dados a retornar
 * @returns {Object} Resposta formatada para API Gateway
 */
function successResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // PLACEHOLDER: Configure CORS adequadamente para produção
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * Cria uma resposta HTTP de erro
 * @param {number} statusCode - Código HTTP de erro (400, 404, 500, etc)
 * @param {string} message - Mensagem de erro
 * @param {Object} details - Detalhes adicionais do erro
 * @returns {Object} Resposta formatada para API Gateway
 */
function errorResponse(statusCode, message, details = null) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // PLACEHOLDER: Configure CORS adequadamente para produção
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      success: false,
      error: {
        message,
        details,
        timestamp: new Date().toISOString()
      }
    })
  };
}

module.exports = {
  successResponse,
  errorResponse
};
