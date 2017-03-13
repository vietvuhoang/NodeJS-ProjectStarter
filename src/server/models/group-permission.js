'use strict';

var async = require('async');

module.exports = function (GroupPermission) {

    GroupPermission.observe('after save', function (ctx, callback) {

        if (!ctx.instance || !ctx.instance.groupId) return callback();

        async.waterfall([
            function (next) {
                GroupPermission.app.models.Group.collectMembersByGroupId(ctx.instance.groupId, next);
            },
            function (members, next) {
                GroupPermission.app.models.Group.removeUserInfoFromRedis(members, next);
            }
        ],
            function (err) {
                callback(err);
            }
        );
    });

    GroupPermission.observe('before delete', function (ctx, callback) {

        if (!ctx.where || !ctx.where.groupId) return callback();

        async.waterfall([
            function (next) {
                GroupPermission.app.models.Group.collectMembersByGroupId(ctx.where.groupId, next);
            },
            function (members, next) {
                GroupPermission.app.models.Group.removeUserInfoFromRedis(members, next);
            }
        ],
            function (err) {
                callback(err);
            }
        );

    });
};
