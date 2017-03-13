'use strict';

var exports = module.exports;
var md5 = require('js-md5');
var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var app = require('../server');
var redis = require('../libs/redis');
var token = require('../libs/token');
var async = require('async');
var transactionHelper = require('../libs/transaction-helper');

exports.createUser = function (user, options, callback) {

    var isInitTransaction = false;

    if (typeof options == 'function') {
        callback = options;
        options = {};
    }

    if (user.username === undefined) {
        return callback(errorUtil.createAppError(errors.MEMBER_NO_USERNAME));
    }

    if (user.password === undefined) {
        return callback(errorUtil.createAppError(errors.MEMBER_NO_PASSWORD));
    }

    if (user.email === undefined) {
        return callback(errorUtil.createAppError(errors.MEMBER_NO_EMAIL));
    }

    user.password = md5(user.password);

    async.waterfall([
        function (next) {
            transactionHelper.beginTransaction(app.models.Member, options, function (err, tx, isInit) {
                if (err) return next(err);
                isInitTransaction = isInit;
                next(null);
            });
        },
        function (next) {
            app.models.Member.create(user, options, function (err, instance) {
                next(err, instance);
            });
        },
        function (instance, next) {

            if (!user.addresses || user.addresses.lengh <= 0) {
                return next(null, instance);
            }

            user.addresses.forEach(function (addr) {
                addr.memberId = instance.id;
            });

            instance.addresses.create(user.addresses, options, function (err) {
                next(err, instance);
            });

        },
        function (instance, next) {
            if (!user.groups || user.groups.lengh <= 0) {
                return next(null, instance);
            }

            let userGrps = [];

            user.groups.forEach(function (grp) {

                if (!grp.id) return;

                userGrps.push({
                    memberId: instance.id,
                    groupId: grp.id
                });
            });

            app.models.MemberGroup.create(userGrps, options, function (err) {
                next(err, instance);
            });

        },
        function (instance, next) {
            transactionHelper.commit(options.transaction, isInitTransaction, next);
        }
    ], function (err, instance) {

        if (!err) return callback(null, instance);

        console.error('ERROR : %s', errorUtil.toString(err));

        transactionHelper.rollback(options.transaction, isInitTransaction, function () {
            let error = err ? errorUtil.createAppError(errors.SERVER_GET_PROBLEM) : null;
            callback(error, instance);
        });

    });
};

var createUsers = function (users, options, callback) {

    let userObjs = [];

    async.eachSeries(users, function (user, next) {
        exports.createUser(user, options, function (err, instance) {
            if (err || !instance) return next(err, instance);
            userObjs.push(instance);
            next(null, instance);
        });

    }, function (err) {
        callback(err, userObjs);
    });

};

exports.createUsers = function (users, options, callback) {

    var isInitTransaction = false;

    if (typeof options == 'function') {
        callback = options;
        options = {};
    }

    async.waterfall([
        function (next) {
            transactionHelper.beginTransaction(app.models.Member, options, function (err, tx, isInit) {
                if (err) return next(err);
                isInitTransaction = isInit;
                next(null);
            });
        },
        function (next) {
            createUsers(users, options, next);
        },
        function (userObjs, next) {
            transactionHelper.commit(options.transaction, isInitTransaction, function (err) {
                next(err, userObjs);
            });
        }],
        function (err, userObjs) {
            if (!err) return callback(null, userObjs);
            
            transactionHelper.rollback(options.transaction, isInitTransaction, function () {
                let error = err ? errorUtil.createAppError(errors.SERVER_GET_PROBLEM) : null;
                callback(error, userObjs);
            });
        });
};


exports.getUserById = function (userId, callback) {
    app.models.Member.findByUserId(userId, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });
};

exports.getUserByUsername = function (username, callback) {

    app.models.Member.findByUsername(username, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });
};

exports.getUserByUsernameWithPermissions = function (username, callback) {

    app.models.Member.findByUsernameWithPermissions(username, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });

};

exports.login = function (user, callback) {

    async.waterfall([
        function (next) {
            app.models.Member.findByUsername(user.username, true, function (err, userObj) {

                if (err) return next(err);

                let password = md5(user.password);

                if (userObj.password != password) {
                    return next(errorUtil.createAppError(errors.MEMBER_INVALID_PASSWORD));
                }

                next(null, userObj);
            });
        },
        function (user, next) {
            // get User Secret Key
            redis.getSecretKey(user.username, function (err, value) {

                if (!err) return next(null, user, value);

                if (err.code != errors.MISSING_REDIS_KEY.code) {
                    return next(err);
                }

                // Generate Secret Key
                let secret = token.generateSecretKey(user.username);

                // Set to redis
                redis.setSecretKey(user.username, secret);

                return next(null, user, secret);

            });
        },
        function (user, secret, next) {
            let tokenKey = token.generate({ username: user.username, fullName: user.fullName }, secret);

            token.getSignature(tokenKey, function (err, sign) {
                next(err, user, secret, tokenKey, sign);
            });

        },
        function (user, secret, tokenKey, sign, next) {
            redis.setSecretKeyBySignature(sign, JSON.stringify({ username: user.username, secret: secret }));
            next(null, tokenKey);
        }
    ], function (err, tokenKey) {
        callback(err, tokenKey);
    });

}
