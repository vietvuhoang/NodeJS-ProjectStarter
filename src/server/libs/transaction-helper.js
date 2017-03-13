'use strict';

var exports = module.exports;

exports.beginTransaction = function (model, options, callback) {

    if (options && options.transaction) return callback(null, options.transaction, false);

    if (!options) options = {};

    var transOptions = {
        isolationLevel: model.Transaction.READ_COMMITTED
    };

    model.beginTransaction(transOptions, function (err, tx) {
        if (err) return callback(err);
        options.transaction = tx;
        callback(null, options.transaction, true);
    });

};

exports.rollback = function (transaction, isInit, callback) {
    if (isInit) {
        transaction.rollback(callback);
    } else {
        callback(null);
    }

};

exports.commit = function (transaction, isInit, callback) {
    if (isInit) {
        transaction.commit(callback);
    } else {
        callback(null);
    }
};
