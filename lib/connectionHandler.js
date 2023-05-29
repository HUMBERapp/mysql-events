const mysql = require('mysql2/promise');

const connect = connection => new Promise((resolve, reject) => connection.connect((err) => {
  if (err) return reject(err);
  resolve();
}));

const connectionHandler = async (connection, { logger = { debug: console.log } }) => {
  if (connection instanceof mysql.Pool) {
    logger.debug('reusing pool:', connection);
    if (connection._closed) {
      connection = await mysql.createPool(connection.config.connectionConfig);
    }
  }

  if (connection instanceof mysql.Connection) {
    logger.debug('reusing connection:', connection);
    if (connection.state !== 'connected') {
      connection = await mysql.createConnection(connection.config);
    }
  }

  if (typeof connection === 'string') {
    logger.debug('creating connection from string:', connection);
    connection = await mysql.createConnection(connection);
  }

  if ((typeof connection === 'object') && (!(connection instanceof mysql.Connection) && !(connection instanceof mysql.Pool))) {
    logger.debug('creating connection from object:', connection);
    if (connection.isPool) {
      connection = await mysql.createPool(connection);
    } else {
      connection = await mysql.createConnection(connection);
    }
  }

  if ((connection instanceof mysql.Connection) && (connection.state !== 'connected')) {
    logger.debug('initializing connection');
    await connect(connection);
  }

  return connection;
};

module.exports = connectionHandler;
