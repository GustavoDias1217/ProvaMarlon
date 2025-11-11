const AWS = require('aws-sdk');

// PLACEHOLDER: Configure as credenciais AWS adequadamente
const sqs = new AWS.SQS({
  region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * Cliente SQS para envio de mensagens para filas
 */
class SQSClient {
  /**
   * Envia uma mensagem para a fila
   * @param {string} queueUrl - URL da fila SQS
   * @param {Object} messageBody - Corpo da mensagem
   * @param {Object} attributes - Atributos adicionais da mensagem
   */
  async sendMessage(queueUrl, messageBody, attributes = {}) {
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
      MessageAttributes: this._formatAttributes(attributes)
    };

    try {
      const result = await sqs.sendMessage(params).promise();
      console.log('Mensagem enviada para SQS:', result.MessageId);
      return result;
    } catch (error) {
      console.error('Erro ao enviar mensagem para SQS:', error);
      throw error;
    }
  }

  /**
   * Envia múltiplas mensagens em lote
   * @param {string} queueUrl - URL da fila SQS
   * @param {Array} messages - Array de mensagens
   */
  async sendMessageBatch(queueUrl, messages) {
    const entries = messages.map((msg, index) => ({
      Id: `msg-${index}`,
      MessageBody: JSON.stringify(msg.body),
      MessageAttributes: this._formatAttributes(msg.attributes || {})
    }));

    const params = {
      QueueUrl: queueUrl,
      Entries: entries
    };

    try {
      const result = await sqs.sendMessageBatch(params).promise();
      console.log(`${result.Successful.length} mensagens enviadas com sucesso`);
      
      if (result.Failed.length > 0) {
        console.error(`${result.Failed.length} mensagens falharam:`, result.Failed);
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao enviar lote de mensagens para SQS:', error);
      throw error;
    }
  }

  /**
   * Formata atributos da mensagem para o formato esperado pelo SQS
   * @private
   */
  _formatAttributes(attributes) {
    const formatted = {};
    
    Object.keys(attributes).forEach(key => {
      formatted[key] = {
        DataType: 'String',
        StringValue: String(attributes[key])
      };
    });
    
    return formatted;
  }
}

module.exports = new SQSClient();
