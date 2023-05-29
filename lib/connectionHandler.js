const mysql = require('mysql2/promise');
const Connection = require('mysql2/lib/connection');
const Pool = require('mysql2/lib/pool');

const connect = connection => new Promise((resolve, reject) => connection.connect((err) => {
  if (err) return reject(err);
  resolve();
}));

const connectionHandler = async (connection, { logger = { debug: console.log } }) => {
  if (connection instanceof Pool) {
    logger.debug('reusing pool:', connection);
    if (connection._closed) {
      connection = await mysql.createPool(connection.config.connectionConfig);
    }
  }

  if (connection instanceof Connection) {
    logger.debug('reusing connection:', connection);
    if (connection.state !== 'connected') {
      connection = await mysql.createConnection(connection.config);
    }
  }

  if (typeof connection === 'string') {
    logger.debug('creating connection from string:', connection);
    connection = await mysql.createConnection(connection);
  }

  if ((typeof connection === 'object') && (!(connection instanceof Connection) && !(connection instanceof Pool))) {
    logger.debug('creating connection from object:', connection);
    if (connection.isPool) {
      connection = await mysql.createPool(connection);
    } else {
      connection = await mysql.createConnection(connection);
    }
  }

  if ((connection instanceof Connection) && (connection.state !== 'connected')) {
    logger.debug('initializing connection');
    await connect(connection);
  }

  return connection;
};

module.exports = connectionHandler;
