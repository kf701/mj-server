"use strict";

var assign = require('object-assign');

var UserObject = {
    uid : 0,
    roomId: 0,
    seat: -1,       // 在房间里的座位
    ready : false,
    online : true,
    ip : '0.0.0.0',
    time: 0,

    dbData: null,   // 这部分数据需要同步数据库

    gameData: null  // 牌局实时数据
};

var allUsers = {};
var userCount = 0;

exports.newUser = function (uid) {
    var u =  Object.assign({}, UserObject);
    u.uid = uid;
    allUsers[uid] = u;
    userCount ++
    console.log('Now users = ' + userCount);
    return true;
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

exports.del = function(uid) {
    //TODO  delete user from AllUsers array
    userCount --
    console.log('Now users = ' + userCount);
};

