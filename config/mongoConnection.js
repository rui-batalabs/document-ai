import {MongoClient} from 'mongodb';
import {mongoConfig} from './settings.js';

let _connection = undefined;
let _db = undefined;

/**
 * Establishes a connection to the MongoDB server and returns the database object.
 */
export const dbConnection = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoConfig.serverUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        _db = _connection.db(mongoConfig.database);
    }

    return _db;
};

/**
 * Closes the connection to the MongoDB server.
 */
export const closeConnection = async () => {
    if (_connection) {
        await _connection.close();
        _connection = undefined;
        _db = undefined;
    }
};
