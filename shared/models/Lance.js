const { v4: uuidv4 } = require('uuid');

/**
 * Modelo de Lance
 */
class Lance {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.leilaoId = data.leilaoId;
    this.usuarioId = data.usuarioId;
    this.usuarioNome = data.usuarioNome || '';
    this.valor = data.valor;
    this.status = data.status || 'PENDENTE'; // PENDENTE, PROCESSADO, VENCEDOR, REJEITADO
    this.timestamp = data.timestamp || new Date().toISOString();
    
    // PLACEHOLDER: Adicione campos conforme necessário
    // Por exemplo: observacoes, tipo_lance (automatico/manual), ip, etc.
    this.tipoLance = data.tipoLance || 'MANUAL';
    
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Converte para objeto simples para DynamoDB
   */
  toItem() {
    return {
      id: this.id,
      leilaoId: this.leilaoId,
      usuarioId: this.usuarioId,
      usuarioNome: this.usuarioNome,
      valor: this.valor,
      status: this.status,
      timestamp: this.timestamp,
      tipoLance: this.tipoLance,
      createdAt: this.createdAt
    };
  }

  /**
   * Marca o lance como processado
   */
  marcarComoProcessado() {
    this.status = 'PROCESSADO';
  }

  /**
   * Marca o lance como vencedor
   */
  marcarComoVencedor() {
    this.status = 'VENCEDOR';
  }

  /**
   * Marca o lance como rejeitado
   */
  marcarComoRejeitado(motivo) {
    this.status = 'REJEITADO';
    this.motivoRejeicao = motivo;
  }
}

module.exports = Lance;
