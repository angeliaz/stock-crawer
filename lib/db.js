const mysql = require('mysql');
const config = require('../config/config');
const koa = require('koa')
const app = new koa();
let pool;

function query(sql, paramArr) {
  if (pool) {
    return dbQuery(sql, paramArr);
  } else {
    pool = mysql.createPool(config[app.env].mysql);
    return dbQuery(sql, paramArr);
  }
}

function dbQuery(sql, paramArr) {
  return new Promise(function(resolve, reject) {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  }).then(function(connection) {
    return new Promise(function(resolve, reject) {
      connection.query(sql, paramArr, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
        connection.release();
      });
    });
  }, function(err) {
    return Promise.reject(err);
  });
}

module.exports = query;
