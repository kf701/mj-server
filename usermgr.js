"use strict";

var assign = require('object-assign');

var UserObject = {
    uid : 0,
    roomId: 0,
    ready : false,
    online : true,
    ip : '0.0.0.0',
    time: 0,

    dbData: null,   // 这部分数据需要同步数据库

    gameData: null  // 牌局实时数据
};

var allUsers = [];

exports.newUser = function (uid) {
    var u =  Object.assign({}, UserObject);
    u.uid = uid;
    allUsers[uid] = u;
    return u;
};

exports.syncFromDb = function(uid) {
};

exports.syncToDb = function(uid) {
};

exports.findUser = function (uid) {
    return allUsers[uid];
};

exports.offline = function(uid) {
    var u = findUser(uid);
    u.online = false;
};
