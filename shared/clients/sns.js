const AWS = require('aws-sdk');

// PLACEHOLDER: Configure as credenciais AWS adequadamente
const sns = new AWS.SNS({
  region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * Cliente SNS para envio de notificações
 */
class SNSClient {
  /**
   * Publica uma mensagem em um tópico SNS
   * @param {string} topicArn - ARN do tópico SNS
   * @param {string} message - Mensagem a ser enviada
   * @param {string} subject - Assunto da mensagem
   * @param {Object} attributes - Atributos adicionais
   */
  async publish(topicArn, message, subject = '', attributes = {}) {
    const params = {
      TopicArn: topicArn,
      Message: typeof message === 'string' ? message : JSON.stringify(message),
      Subject: subject,
      MessageAttributes: this._formatAttributes(attributes)
    };

    try {
      const result = await sns.publish(params).promise();
      console.log('Notificação enviada via SNS:', result.MessageId);
      return result;
    } catch (error) {
      console.error('Erro ao enviar notificação via SNS:', error);
      throw error;
    }
  }

  /**
   * Publica mensagem com estrutura diferente por protocolo
   * @param {string} topicArn - ARN do tópico SNS
   * @param {Object} messages - Mensagens por protocolo (email, sms, default)
   */
  async publishMultiProtocol(topicArn, messages) {
    const messageStructure = {
      default: messages.default || 'Notificação do Sistema de Leilão',
      email: messages.email || messages.default,
      sms: messages.sms || messages.default,
      // PLACEHOLDER: Adicione mais protocolos conforme necessário (lambda, http, etc)
    };

    const params = {
      TopicArn: topicArn,
      Message: JSON.stringify(messageStructure),
      MessageStructure: 'json',
      Subject: messages.subject || 'Notificação de Leilão'
    };

    try {
      const result = await sns.publish(params).promise();
      console.log('Notificação multi-protocolo enviada:', result.MessageId);
      return result;
    } catch (error) {
      console.error('Erro ao enviar notificação multi-protocolo:', error);
      throw error;
    }
  }

  /**
   * Inscreve um endpoint no tópico SNS
   * @param {string} topicArn - ARN do tópico SNS
   * @param {string} protocol - Protocolo (email, sms, lambda, etc)
   * @param {string} endpoint - Endpoint a ser inscrito
   */
  async subscribe(topicArn, protocol, endpoint) {
    const params = {
      TopicArn: topicArn,
      Protocol: protocol,
      Endpoint: endpoint
    };

    try {
      const result = await sns.subscribe(params).promise();
      console.log('Inscrição criada:', result.SubscriptionArn);
      return result;
    } catch (error) {
      console.error('Erro ao criar inscrição SNS:', error);
      throw error;
    }
  }

  /**
   * Formata atributos da mensagem para o formato esperado pelo SNS
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

module.exports = new SNSClient();
