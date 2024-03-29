import mySQLConnector from './mysqlConnector';

export default class MySQLWrapper {
    
    /**
     * 
     * Queries the database
     * @param {String} query - The query itself
     * @param {Array} params - The parameters to be passed to MySQL
     * @returns {Promise} - A promise to a query result
     * 
     */
    static createQuery({ query, params }) {
        return new Promise((succeed, fail) => {
            mySQLConnector.pool.getConnection((err, connection) => {
                if (err) {
                    return fail(err);
                }
                connection.query(query, params, (err, rows) => {
                    connection.release();
                    if (err) {
                        return fail(err);
                    }
                    return succeed(rows);
                });
            });
        });
    }

    /**
     * 
     * Runs a transactional query
     * @param {MySQL.Connection} connection - The connection whose transaction will be used
     * @param {String} query - The query itself
     * @param {Array} params - The parameters to be passed to MySQL
     * @returns {Promise} - A promise to a query result
     * 
     */
    static createTransactionalQuery({ query, params, connection }) {
        return new Promise((succeed, fail) => {
            connection.query(query, params, (err, rows) => {
                if (err) {
                    return fail(err);
                }
                return succeed(rows);
            });
        });
    }
    
    /**
     * 
     * Rollbacks a transaction
     * @param {MySQL.Connection} connection - The connection whose transaction will be rollbacked
     * @returns {Promise} - A promise to the rollback
     * 
     */
    static rollback(connection) {
        return new Promise<void>((succeed, fail) => {
            try {
                connection.rollback(() => {
                    return succeed();
                });
            } catch (e) {
                return fail(e);
            } finally {
                connection.release();
            }
        });
    }

    /**
     * 
     * Commits a transaction
     * @param {MySQL.Connection} connection - The connection whose transaction will be commited
     * @returns {Promise} - A promise to the commit
     * 
     */
    static commit(connection) {
        return new Promise<void>((succeed, fail) => {
            try {
                connection.commit(err => { 
                    if (err) { 
                        return this.rollback(connection);
                    }
                    return succeed();
                })
            } catch (e) {
                return fail(e);
            } finally {
                connection.release();
            }

        })

    }

    /**
     * 
     * Retrieves a connection from the pool to be used in transactions
     * @param {MySQL.Connection} connection - A connection from the pool
     * 
     */
    static getConnectionFromPool() {
        return new Promise((succeed, fail) => {
            mySQLConnector.pool.getConnection((err, connection) => {
                if (err) {
                    return fail(err);
                }
                return succeed(connection);
            });
        });
    }

    /**
     * 
     * Begins a new transaction in a connection
     * @param {MySQL.Connection} connection - A connection from the pool
     * 
     */
    static beginTransaction(connection) {
        return new Promise((succeed, fail) => {
            connection.beginTransaction(err => {
                if (err) {
                    return fail(err);
                }
                return succeed(connection);
            });
        });
    }
}
