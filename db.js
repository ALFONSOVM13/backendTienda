const { createPool } = require('mysql2');

// Creación del pool de conexiones
const pool = createPool({
    host: 'monorail.proxy.rlwy.net',
    user: 'root',
    password: 'a-eHHFeCDB4F6-AG3C3Hbca2ca1CfFde',
    database: 'railway',
    port: '41598'
});

// const pool = createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'Ares1781',
//     database: 'api',
//     port: '3306'
// });

// Exportar el pool para su uso en otros archivos
module.exports = {
    query: (sql, values, callback) => {
        pool.query(sql, values, (err, rows) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return callback(err, null);
            }
            callback(null, rows);
        });
    }
};
