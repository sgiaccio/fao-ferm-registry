const { Pool } = require("pg");

let pool;

/**
 * Returns a PostgreSQL connection pool based on the provided secrets.
 * Note: This function is designed to work with a consistent set of secrets.
 * If called with different secrets, the pool from the initial call will be reused.
 *
 * @param {Object} secrets - Contains user, host, database, and password properties for the database connection.
 * @returns {Pool} A connection pool for PostgreSQL.
 */
function getDatabasePool(user, host, database, password) {
    if (!pool) {
        pool = new Pool({ user, host, database, password });
    }
    return pool;
}

function getDatabaseClient(user, host, database, password) {
    return getDatabasePool(user, host, database, password).connect()
}

exports.getDatabaseClient = getDatabaseClient;
