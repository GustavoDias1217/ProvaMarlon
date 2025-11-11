const { v4: uuidv4 } = require('uuid');

/**
 * Modelo de Usuário
 */
class Usuario {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.nome = data.nome;
    this.email = data.email;
    this.telefone = data.telefone || '';
    this.tipo = data.tipo || 'COMPRADOR'; // COMPRADOR, VENDEDOR, ADMIN
    this.ativo = data.ativo !== undefined ? data.ativo : true;
    
    // PLACEHOLDER: Adicione campos de autenticação/autorização
    // Por exemplo: senha (hash), tokens, preferências, endereço, etc.
    this.endereco = data.endereco || {};
    this.preferencias = data.preferencias || {};
    
    // Estatísticas
    this.totalLancesRealizados = data.totalLancesRealizados || 0;
    this.totalLeiloesVencidos = data.totalLeiloesVencidos || 0;
    this.totalLeiloesCriados = data.totalLeiloesCriados || 0;
    
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Converte para objeto simples para DynamoDB
   */
  toItem() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
      tipo: this.tipo,
      ativo: this.ativo,
      endereco: this.endereco,
      preferencias: this.preferencias,
      totalLancesRealizados: this.totalLancesRealizados,
      totalLeiloesVencidos: this.totalLeiloesVencidos,
      totalLeiloesCriados: this.totalLeiloesCriados,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Incrementa contador de lances
   */
  incrementarLances() {
    this.totalLancesRealizados += 1;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Incrementa contador de leilões vencidos
   */
  incrementarVitorias() {
    this.totalLeiloesVencidos += 1;
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Usuario;
