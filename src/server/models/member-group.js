'use strict';

var redis = require('../libs/redis');

module.exports = function (MemberGroup) {
    MemberGroup.observe('after save', function (ctx, next) {

        if ( !ctx.instance || !ctx.instance.memberId) {
            return next();
        }

        var filter = {
            where: { id: ctx.instance.memberId }
        };

        MemberGroup.app.models.Member.findOne(filter, function (err, member) {
            if ( !member || err) return next(err);
            redis.removeUserInfo(member.username);
            next();
        });
    });

    MemberGroup.observe('before delete', function (ctx, next) {
        
        if ( !ctx.where || !ctx.where.memberId) {
            return next();
        }

        var filter = {
            where: { id: ctx.where.memberId }
        };

        MemberGroup.app.models.Member.findOne(filter, function (err, member) {

            if ( !member || err) return next(err);

            redis.removeUserInfo(member.username);
            next();
        });

    });
};
