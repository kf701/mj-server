"use strict";

var assign = require('object-assign');

var UserMgr = require('./usermgr');
var GameAlgo = require('./algo_mj');

var RoomObject = {
    roomId: '0',
    type: 'private',  // normal, private, compete
    turnTimeout: 0,   // 出牌限时, 0 = 无限时
    currentTurn: 0,   // 当前轮到哪个座位出牌
    creatorUid: 0,
    numOfGames: 0,    // 玩了几局了
    timer: null,
    numOfPlayers: 4,  // 共几个玩家
    players: null,
    state: 'wait',    // wait, ready, play, over
    runServer: '',
    gameData: null,
    turnTimeFunc: function(room) {
        var player = room.players[room.currentTurn];
        GameAlgo.chupai(room, player);
    }
};

var allRooms = [];

function generateRoomId() {
	var roomId = '';
	for (var i = 0; i < 6; ++i) {
		roomId += Math.floor(Math.random()*10);
	}
	return roomId;
}

exports.pushMessage = function(touid, ev, data, sender)
{
};

exports.broadcastMessage = function(ev, data, sender, exclude)
{
};

exports.createRoom = function(creatorUid, gameServer, callback)
{
    var room =  Object.assign({}, RoomObject);
    var roomId = generateRoomId();
    room.roomId = roomId;
    room.runServer = gameServer;
    room.craeteUid = creatorUid;
    room.players = [];
    allRooms[roomId] = room;
    callback(0, roomId);
};

exports.findRoom = function(roomId) 
{
    return allRooms[roomId];
};

exports.isFull = function(roomId)
{
    var room = allRooms[roomId];
    if (room.players.length >= room.numOfPlayers) return true;
    return false;
};

exports.prepare = function(roomId)
{
    var room = allRooms[roomId];
    GameAlgo.prepare(room);
};

exports.enter = function(roomId, uid)
{
    if (room.players.length >= room.numOfPlayers) return false;

    var room = allRooms[roomId];
    var u = UserMgr.findUser(uid);
    u.roomId = roomId;
    room.players.push(u); 
    broadcastMessage('enter', {}, uid, false);
    return true;
};

exports.leave = function(roomId, uid)
{
    var room = allRooms[roomId];

    var userIndex = -1;
    for (var i = 0 ; i < room.players.length ; i ++) {
        if (room.players[i].uid == uid) {
            userIndex = i;
            break;
        }
    }
    if (userIndex < 0) return false;
    var u = room.players[userIndex];
    u.roomId = 0;
    room.players.splice(userIndex, 1);
    broadcastMessage('leave', {}, uid, false);
    return true;
};


