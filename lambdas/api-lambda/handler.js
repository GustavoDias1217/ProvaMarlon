const { successResponse, errorResponse } = require('../../shared/utils/response');
const dynamoClient = require('../../shared/clients/dynamodb');
const sqsClient = require('../../shared/clients/sqs');
const Leilao = require('../../shared/models/Leilao');
const Lance = require('../../shared/models/Lance');
const { validateLeilao, validateLance } = require('../../shared/validators');

/**
 * LAMBDA 1: API Gateway Handler
 * 
 * Responsável por:
 * - Receber requisições HTTP do usuário frontend
 * - Validar dados de entrada
 * - Para operações de escrita (lances): enviar para fila SQS
 * - Para operações de leitura: consultar DynamoDB diretamente
 * - Retornar respostas HTTP padronizadas
 */

const LEILOES_TABLE = process.env.LEILOES_TABLE;
const LANCES_TABLE = process.env.LANCES_TABLE;
const LANCES_QUEUE_URL = process.env.LANCES_QUEUE_URL;

/**
 * Handler principal da Lambda
 */
exports.handler = async (event) => {
  console.log('Evento recebido:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, path, pathParameters, body } = event;
    
    // Roteamento baseado no método HTTP e path
    
    // POST /leiloes - Criar novo leilão
    if (httpMethod === 'POST' && path === '/leiloes') {
      return await criarLeilao(body);
    }
    
    // GET /leiloes - Listar todos os leilões
    if (httpMethod === 'GET' && path === '/leiloes') {
      return await listarLeiloes();
    }
    
    // GET /leiloes/{id} - Buscar leilão específico
    if (httpMethod === 'GET' && path.startsWith('/leiloes/')) {
      return await buscarLeilao(pathParameters.id);
    }
    
    // POST /lances - Criar novo lance (envia para fila SQS)
    if (httpMethod === 'POST' && path === '/lances') {
      return await criarLance(body);
    }
    
    // GET /lances/{leilaoId} - Listar lances de um leilão
    if (httpMethod === 'GET' && path.startsWith('/lances/')) {
      return await listarLances(pathParameters.leilaoId);
    }
    
    return errorResponse(404, 'Rota não encontrada');
    
  } catch (error) {
    console.error('Erro no handler:', error);
    return errorResponse(500, 'Erro interno do servidor', error.message);
  }
};

/**
 * Cria um novo leilão
 */
async function criarLeilao(bodyString) {
  try {
    const data = JSON.parse(bodyString);
    
    // Validar dados
    const validation = validateLeilao(data);
    if (!validation.valid) {
      return errorResponse(400, 'Dados inválidos', validation.errors);
    }
    
    // PLACEHOLDER: Adicione autenticação/autorização aqui
    // Exemplo: verificar token JWT, validar permissões do usuário
    // const usuarioAutenticado = await verificarToken(event.headers.Authorization);
    // data.vendedorId = usuarioAutenticado.id;
    
    // Por enquanto, usar um vendedorId mock
    data.vendedorId = data.vendedorId || 'vendedor-mock-123';
    
    // Criar objeto Leilao
    const leilao = new Leilao(data);
    
    // Salvar no DynamoDB
    await dynamoClient.create(LEILOES_TABLE, leilao.toItem());
    
    console.log('Leilão criado:', leilao.id);
    
    return successResponse(201, {
      message: 'Leilão criado com sucesso',
      leilao: leilao.toItem()
    });
    
  } catch (error) {
    console.error('Erro ao criar leilão:', error);
    return errorResponse(500, 'Erro ao criar leilão', error.message);
  }
}

/**
 * Lista todos os leilões ativos
 */
async function listarLeiloes() {
  try {
    // PLACEHOLDER: Adicione paginação e filtros
    // Por exemplo: status, categoria, preço, data, etc.
    
    // Buscar leilões ativos usando índice
    const leiloes = await dynamoClient.queryByIndex(
      LEILOES_TABLE,
      'StatusDataFimIndex',
      'status',
      'ATIVO'
    );
    
    // Ordenar por data de fim (mais próximos primeiro)
    leiloes.sort((a, b) => new Date(a.dataFim) - new Date(b.dataFim));
    
    return successResponse(200, {
      total: leiloes.length,
      leiloes
    });
    
  } catch (error) {
    console.error('Erro ao listar leilões:', error);
    return errorResponse(500, 'Erro ao listar leilões', error.message);
  }
}

/**
 * Busca um leilão específico por ID
 */
async function buscarLeilao(leilaoId) {
  try {
    const leilao = await dynamoClient.getById(LEILOES_TABLE, { id: leilaoId });
    
    if (!leilao) {
      return errorResponse(404, 'Leilão não encontrado');
    }
    
    return successResponse(200, { leilao });
    
  } catch (error) {
    console.error('Erro ao buscar leilão:', error);
    return errorResponse(500, 'Erro ao buscar leilão', error.message);
  }
}

/**
 * Cria um novo lance (envia para fila SQS para processamento assíncrono)
 */
async function criarLance(bodyString) {
  try {
    const data = JSON.parse(bodyString);
    
    // Validar dados
    const validation = validateLance(data);
    if (!validation.valid) {
      return errorResponse(400, 'Dados inválidos', validation.errors);
    }
    
    // PLACEHOLDER: Adicione autenticação/autorização aqui
    // const usuarioAutenticado = await verificarToken(event.headers.Authorization);
    // data.usuarioId = usuarioAutenticado.id;
    // data.usuarioNome = usuarioAutenticado.nome;
    
    // Por enquanto, usar um usuarioId mock
    data.usuarioId = data.usuarioId || 'usuario-mock-456';
    data.usuarioNome = data.usuarioNome || 'Usuário Teste';
    
    // Verificar se o leilão existe e está ativo
    const leilao = await dynamoClient.getById(LEILOES_TABLE, { id: data.leilaoId });
    
    if (!leilao) {
      return errorResponse(404, 'Leilão não encontrado');
    }
    
    const leilaoObj = new Leilao(leilao);
    if (!leilaoObj.isAtivo()) {
      return errorResponse(400, 'Leilão não está ativo');
    }
    
    // Verificar se o lance é maior que o valor atual
    if (data.valor <= leilao.valorAtual) {
      return errorResponse(400, `Lance deve ser maior que o valor atual: R$ ${leilao.valorAtual}`);
    }
    
    // Criar objeto Lance
    const lance = new Lance(data);
    
    // Enviar para fila SQS para processamento assíncrono
    await sqsClient.sendMessage(LANCES_QUEUE_URL, lance.toItem(), {
      leilaoId: lance.leilaoId,
      usuarioId: lance.usuarioId,
      valor: String(lance.valor)
    });
    
    console.log('Lance enviado para fila SQS:', lance.id);
    
    return successResponse(202, {
      message: 'Lance recebido e será processado em breve',
      lanceId: lance.id,
      status: 'PENDENTE'
    });
    
  } catch (error) {
    console.error('Erro ao criar lance:', error);
    return errorResponse(500, 'Erro ao criar lance', error.message);
  }
}

/**
 * Lista todos os lances de um leilão
 */
async function listarLances(leilaoId) {
  try {
    // Buscar lances usando índice
    const lances = await dynamoClient.queryByIndex(
      LANCES_TABLE,
      'LeilaoIdTimestampIndex',
      'leilaoId',
      leilaoId
    );
    
    // Ordenar por timestamp (mais recentes primeiro)
    lances.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return successResponse(200, {
      leilaoId,
      total: lances.length,
      lances
    });
    
  } catch (error) {
    console.error('Erro ao listar lances:', error);
    return errorResponse(500, 'Erro ao listar lances', error.message);
  }
}
