const AWS = require('aws-sdk');

// PLACEHOLDER: Configure as credenciais AWS adequadamente
// Para desenvolvimento local, use AWS CLI ou variáveis de ambiente
// Para produção, use IAM Roles
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

/**
 * Cliente DynamoDB para operações nas tabelas
 */
class DynamoDBClient {
  /**
   * Cria um novo item na tabela
   * @param {string} tableName - Nome da tabela
   * @param {Object} item - Item a ser criado
   */
  async create(tableName, item) {
    const params = {
      TableName: tableName,
      Item: item
    };

    return await dynamodb.put(params).promise();
  }

  /**
   * Busca um item por chave primária
   * @param {string} tableName - Nome da tabela
   * @param {Object} key - Chave primária
   */
  async getById(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key
    };

    const result = await dynamodb.get(params).promise();
    return result.Item;
  }

  /**
   * Atualiza um item existente
   * @param {string} tableName - Nome da tabela
   * @param {Object} key - Chave primária
   * @param {Object} updates - Campos a atualizar
   */
  async update(tableName, key, updates) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((field, index) => {
      const attributeName = `#field${index}`;
      const attributeValue = `:value${index}`;
      
      updateExpression.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = field;
      expressionAttributeValues[attributeValue] = updates[field];
    });

    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamodb.update(params).promise();
    return result.Attributes;
  }

  /**
   * Query em índice secundário
   * @param {string} tableName - Nome da tabela
   * @param {string} indexName - Nome do índice
   * @param {string} keyName - Nome da chave de partição
   * @param {*} keyValue - Valor da chave
   */
  async queryByIndex(tableName, indexName, keyName, keyValue) {
    const params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: `#key = :value`,
      ExpressionAttributeNames: {
        '#key': keyName
      },
      ExpressionAttributeValues: {
        ':value': keyValue
      }
    };

    const result = await dynamodb.query(params).promise();
    return result.Items;
  }

  /**
   * Scan completo da tabela (usar com cautela)
   * @param {string} tableName - Nome da tabela
   * @param {Object} filterExpression - Filtros opcionais
   */
  async scan(tableName, filterExpression = null) {
    const params = {
      TableName: tableName
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression.expression;
      params.ExpressionAttributeNames = filterExpression.names;
      params.ExpressionAttributeValues = filterExpression.values;
    }

    const result = await dynamodb.scan(params).promise();
    return result.Items;
  }

  /**
   * Deleta um item
   * @param {string} tableName - Nome da tabela
   * @param {Object} key - Chave primária
   */
  async delete(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key
    };

    return await dynamodb.delete(params).promise();
  }
}

module.exports = new DynamoDBClient();
