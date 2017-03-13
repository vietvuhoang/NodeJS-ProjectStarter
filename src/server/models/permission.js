'use strict';

var redis = require('../libs/redis');
var async = require('async');

module.exports = function (Permission) {

    function collectMembersByPermissionId(permissionId, callback) {
        var includePermission = {
            relation: 'permissions',
            scope: {
                where: { id: permissionId }
            }
        };

        var includeGroups = {
            relation: 'groups',
            scope: {
                include: includePermission
            }
        };

        var filter = {
            include: includeGroups
        };

        Permission.app.models.Member.find(filter, function (err, members) {
            callback(err, members);

        });

    }

    function removeUserInfoFromRedis(members, callback) {

        members.forEach(function (member) {

            var mem = member.toJSON();

            mem.groups.forEach(function (grp) {

                if (grp.permissions && grp.permissions.length > 0) {
                    redis.removeUserInfo(member.username);
                }

            });
        });

        callback(null);
    }

    Permission.observe('after save', function (ctx, callback) {

        if (!ctx.instance || !ctx.instance.id) return callback();

        async.waterfall([
            function (next) {
                collectMembersByPermissionId(ctx.instance.id, next);
            },
            function (members, next) {
                removeUserInfoFromRedis(members, next);
            }
        ],
            function (err) {
                callback(err);
            }
        );
    });

    Permission.observe('before delete', function (ctx, callback) {

        if (!ctx.where || !ctx.where.id) return callback();

        async.waterfall([
            function (next) {
                collectMembersByPermissionId(ctx.where.id, next);
            },
            function (members, next) {
                removeUserInfoFromRedis(members, next);
            }
        ],
            function (err) {
                callback(err);
            }
        );
    });

};
