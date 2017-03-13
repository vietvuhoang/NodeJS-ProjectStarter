'use strict';

var exports = module.exports;
var stringUtil = require('../utilities/string-util');
var AppError = require('./app-error');
var util = require('util');
exports.getMessage = function (errorMessageLabel) {
    return stringUtil.getMessage(errorMessageLabel);
};

exports.createAppError = function (error) {
    let message = stringUtil.getMessage(error.message);
    return new AppError(message, error.code);
};

exports.getResponseError = function (error) {
    return {
        code: error.code ? error.code : 0,
        message: error.message
    };
};

exports.toString = function ( error ) {
    if ( error.code && error.message) {
        return util.format('[%s] %s', error.code, error.message );
    } else if ( error.name && error.message ) {
        return util.format('[%s] %s', error.name, error.message );
    } else {
        return util.format('%s', error.toString() );
    }
    
};


