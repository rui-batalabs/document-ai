import {MongoClient} from 'mongodb';
import {mongoConfig} from './settings.js';

let _connection = undefined;
let _db = undefined;

/**
 * Establish a MongoDB connection and return the database object.
 */
export const dbConnection = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoConfig.serverUrl);
        _db = _connection.db(mongoConfig.database);
    }

    return _db;
};

/**
 * Close the MongoDB connection.
 */
export const closeConnection = async () => {
    if (_connection) {
        await _connection.close();
        _connection = undefined;
        _db = undefined;
    }
};
