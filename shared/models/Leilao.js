const { v4: uuidv4 } = require('uuid');

/**
 * Modelo de Leilão
 */
class Leilao {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.titulo = data.titulo;
    this.descricao = data.descricao;
    this.valorInicial = data.valorInicial;
    this.valorAtual = data.valorAtual || data.valorInicial;
    this.dataInicio = data.dataInicio;
    this.dataFim = data.dataFim;
    this.status = data.status || 'ATIVO'; // ATIVO, FINALIZADO, CANCELADO
    this.vendedorId = data.vendedorId;
    this.vencedorId = data.vencedorId || null;
    this.totalLances = data.totalLances || 0;
    
    // PLACEHOLDER: Adicione campos conforme necessário
    // Por exemplo: categoria, imagens, localizacao, condicao, etc.
    this.categoria = data.categoria || 'GERAL';
    this.imagens = data.imagens || [];
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Converte para objeto simples para DynamoDB
   */
  toItem() {
    return {
      id: this.id,
      titulo: this.titulo,
      descricao: this.descricao,
      valorInicial: this.valorInicial,
      valorAtual: this.valorAtual,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      status: this.status,
      vendedorId: this.vendedorId,
      vencedorId: this.vencedorId,
      totalLances: this.totalLances,
      categoria: this.categoria,
      imagens: this.imagens,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Verifica se o leilão está ativo
   */
  isAtivo() {
    const agora = new Date();
    const inicio = new Date(this.dataInicio);
    const fim = new Date(this.dataFim);
    
    return this.status === 'ATIVO' && agora >= inicio && agora <= fim;
  }

  /**
   * Atualiza o valor atual do leilão
   */
  atualizarValor(novoValor) {
    if (novoValor > this.valorAtual) {
      this.valorAtual = novoValor;
      this.totalLances += 1;
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

module.exports = Leilao;
