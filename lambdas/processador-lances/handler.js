const dynamoClient = require('../../shared/clients/dynamodb');
const snsClient = require('../../shared/clients/sns');
const Leilao = require('../../shared/models/Leilao');
const Lance = require('../../shared/models/Lance');

/**
 * LAMBDA 2: Processador de Lances
 * 
 * Responsável por:
 * - Processar mensagens da fila SQS (lances recebidos)
 * - Validar regras de negócio
 * - Atualizar DynamoDB com os lances processados
 * - Atualizar valor atual do leilão
 * - Enviar notificações via SNS para usuários interessados
 * - Tratar erros e dead letter queue
 */

const LEILOES_TABLE = process.env.LEILOES_TABLE;
const LANCES_TABLE = process.env.LANCES_TABLE;
const USUARIOS_TABLE = process.env.USUARIOS_TABLE;
const NOTIFICATIONS_TOPIC_ARN = process.env.NOTIFICATIONS_TOPIC_ARN;

/**
 * Handler principal da Lambda
 * Recebe lote de mensagens da fila SQS
 */
exports.handler = async (event) => {
  console.log('Processando lote de mensagens:', JSON.stringify(event, null, 2));

  const results = {
    successful: [],
    failed: []
  };

  // Processar cada mensagem do lote
  for (const record of event.Records) {
    try {
      const lance = JSON.parse(record.body);
      console.log('Processando lance:', lance.id);

      await processarLance(lance);
      
      results.successful.push({
        lanceId: lance.id,
        messageId: record.messageId
      });
      
    } catch (error) {
      console.error('Erro ao processar lance:', error);
      
      results.failed.push({
        messageId: record.messageId,
        error: error.message
      });
      
      // PLACEHOLDER: Implementar lógica de retry ou envio para DLQ
      // Se o erro for recuperável, lance exceção para retry automático
      // Se não for recuperável, apenas logue e continue
    }
  }

  console.log('Resultado do processamento:', results);
  console.log(`Sucessos: ${results.successful.length}, Falhas: ${results.failed.length}`);

  // Se houver falhas, você pode decidir se quer falhar todo o lote ou não
  // Para não reprocessar mensagens bem-sucedidas, retornamos sucesso
  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
};

/**
 * Processa um lance individual
 */
async function processarLance(lanceData) {
  console.log('Iniciando processamento do lance:', lanceData.id);

  // 1. Buscar o leilão
  const leilao = await dynamoClient.getById(LEILOES_TABLE, { id: lanceData.leilaoId });
  
  if (!leilao) {
    throw new Error(`Leilão ${lanceData.leilaoId} não encontrado`);
  }

  const leilaoObj = new Leilao(leilao);

  // 2. Validar se o leilão ainda está ativo
  if (!leilaoObj.isAtivo()) {
    console.log('Leilão não está mais ativo, rejeitando lance');
    
    const lance = new Lance(lanceData);
    lance.marcarComoRejeitado('Leilão não está mais ativo');
    
    await dynamoClient.create(LANCES_TABLE, lance.toItem());
    
    // Notificar usuário sobre rejeição
    await notificarRejeicaoLance(lanceData, 'Leilão não está mais ativo');
    
    return;
  }

  // 3. Verificar se o lance é maior que o valor atual
  if (lanceData.valor <= leilao.valorAtual) {
    console.log('Lance menor que o valor atual, rejeitando');
    
    const lance = new Lance(lanceData);
    lance.marcarComoRejeitado(`Lance deve ser maior que R$ ${leilao.valorAtual}`);
    
    await dynamoClient.create(LANCES_TABLE, lance.toItem());
    
    await notificarRejeicaoLance(lanceData, `Lance deve ser maior que R$ ${leilao.valorAtual}`);
    
    return;
  }

  // PLACEHOLDER: Adicione mais validações de regras de negócio
  // Por exemplo:
  // - Incremento mínimo (lance deve ser X% ou X reais maior)
  // - Usuário não pode dar lance no próprio leilão (se for o vendedor)
  // - Limite de lances por usuário
  // - Verificar saldo/crédito do usuário

  // 4. Atualizar o leilão com o novo valor
  const lanceAceito = leilaoObj.atualizarValor(lanceData.valor);
  
  if (!lanceAceito) {
    throw new Error('Erro ao atualizar valor do leilão');
  }

  // 5. Salvar lance como processado
  const lance = new Lance(lanceData);
  lance.marcarComoProcessado();
  
  await dynamoClient.create(LANCES_TABLE, lance.toItem());

  // 6. Atualizar leilão no DynamoDB
  await dynamoClient.update(
    LEILOES_TABLE,
    { id: leilao.id },
    {
      valorAtual: leilaoObj.valorAtual,
      totalLances: leilaoObj.totalLances,
      vencedorId: lanceData.usuarioId,
      updatedAt: new Date().toISOString()
    }
  );

  // 7. Atualizar estatísticas do usuário (opcional)
  try {
    const usuario = await dynamoClient.getById(USUARIOS_TABLE, { id: lanceData.usuarioId });
    
    if (usuario) {
      await dynamoClient.update(
        USUARIOS_TABLE,
        { id: lanceData.usuarioId },
        {
          totalLancesRealizados: (usuario.totalLancesRealizados || 0) + 1,
          updatedAt: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do usuário:', error);
    // Não falhar o processamento por causa disso
  }

  // 8. Enviar notificações
  await enviarNotificacoes(leilao, lance);

  console.log('Lance processado com sucesso:', lance.id);
}

/**
 * Envia notificações sobre o novo lance
 */
async function enviarNotificacoes(leilao, lance) {
  try {
    // PLACEHOLDER: Implementar lógica de notificação mais sofisticada
    // Por exemplo:
    // - Notificar vendedor do leilão
    // - Notificar usuário que foi ultrapassado
    // - Notificar usuários que favoritaram o leilão
    // - Enviar email, SMS, push notification, etc.

    const mensagem = {
      default: `Novo lance de R$ ${lance.valor} no leilão: ${leilao.titulo}`,
      email: `
        Olá!
        
        Um novo lance foi realizado no leilão "${leilao.titulo}".
        
        Detalhes:
        - Valor do lance: R$ ${lance.valor}
        - Lance realizado por: ${lance.usuarioNome}
        - Total de lances: ${leilao.totalLances + 1}
        
        Acesse a plataforma para ver mais detalhes!
      `,
      sms: `Novo lance: R$ ${lance.valor} em "${leilao.titulo}". Acesse para dar seu lance!`,
      subject: `Novo lance no leilão: ${leilao.titulo}`
    };

    await snsClient.publishMultiProtocol(NOTIFICATIONS_TOPIC_ARN, mensagem);
    
    console.log('Notificações enviadas com sucesso');
    
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    // Não falhar o processamento por causa disso
  }
}

/**
 * Notifica usuário sobre rejeição do lance
 */
async function notificarRejeicaoLance(lanceData, motivo) {
  try {
    const mensagem = {
      default: `Lance rejeitado: ${motivo}`,
      email: `
        Olá ${lanceData.usuarioNome},
        
        Seu lance de R$ ${lanceData.valor} foi rejeitado.
        
        Motivo: ${motivo}
        
        Tente novamente com um valor maior!
      `,
      sms: `Lance rejeitado: ${motivo}`,
      subject: 'Lance rejeitado'
    };

    await snsClient.publishMultiProtocol(NOTIFICATIONS_TOPIC_ARN, mensagem);
    
    console.log('Notificação de rejeição enviada');
    
  } catch (error) {
    console.error('Erro ao enviar notificação de rejeição:', error);
  }
}
