'use strict';

var redis = require('../libs/redis');
var async = require('async');

module.exports = function (Group) {

    Group.collectMembersByGroupId = function (groupId, callback) {

        var includeGroups = {
            relation: 'groups',
            scope: {
                where: { id: groupId }
            }
        };

        var filter = {
            include: includeGroups
        };

        Group.app.models.Member.find(filter, function (err, members) {
            callback(err, members);
        });

    };

    Group.removeUserInfoFromRedis = function (members, callback) {

        members.forEach(function (member) {

            var mem = member.toJSON();

            mem.groups.forEach(function (grp) {

                if (grp.permissions && grp.permissions.length > 0) {
                    redis.removeUserInfo(member.username);
                }

            });
        });

        callback(null);
    };

    Group.observe('after save', function (ctx, callback) {

        if (!ctx.instance || !ctx.instance.id) return callback();

        async.waterfall([
            function (next) {
                Group.collectMembersByGroupId(ctx.instance.id, next);
            },
            function (members, next) {
                Group.removeUserInfoFromRedis(members, next);
            }
        ],
            function (err) {
                callback(err);
            }
        );
    });


    Group.observe('before delete', function (ctx, callback) {

        if (!ctx.where || !ctx.where.id) return callback();

        async.waterfall([
            function (next) {
                Group.collectMembersByGroupId(ctx.where.id, next);
            },
            function (members, next) {
                Group.removeUserInfoFromRedis(members, next);
            }
        ],
            function (err) {
                callback(err);
            }
        );
    });

};
