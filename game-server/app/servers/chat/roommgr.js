"use strict";

var assign = require('object-assign');

var UserMgr = require('./usermgr');
var GameAlgo = require('./algo_mj');
var RoomMsg = require('../roommsg');

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

var allRooms = {};
var roomCount = 0;

exports.generateRoomId = function () {
	var roomId = '';
	for (var i = 0; i < 6; ++i) {
		roomId += Math.floor(Math.random()*10);
	}
	return roomId;
}

exports.createRoom = function(creatorUid, roomId, gameServer)
{
    var room =  Object.assign({}, RoomObject);
    room.roomId = roomId;
    room.runServer = gameServer;
    room.craeteUid = creatorUid;
    room.players = [];
    allRooms[roomId] = room;
    roomCount ++;
    console.log('Now room count = ' + roomCount);
};

exports.findRoom = function(roomId) 
{
    return allRooms[roomId];
};

exports.enter = function(roomId, uid)
{
    var room = allRooms[roomId];

    if (room.players.length >= room.numOfPlayers) return false;

    var u = UserMgr.findUser(uid);
    u.roomId = roomId;
    room.players.push(u); 
    u.seat = room.players.length - 1;

    var msg = {
        e: 'enter',
        u: uid
    };
    RoomMsg.broadcast(roomId, msg);
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

    var msg = {
        e: 'leave',
        u: uid
    };
    RoomMsg.broadcast(roomId, msg);
    return true;
};

function isReady(room)
{
    for (var i = 0 ; i < room.players.length ; i ++) {
        if ( ! room.players[i].ready ) {
            return false;
        }
    }
    return true;
}

exports.dealMsg = function(roomId, uid, msg)
{
    var room = allRooms[roomId];
    var player = UserMgr.findUser(uid);

    if (msg.e == 'ready') {
        player.ready = true;

        var msg = {
            e: 'ready',
            u: uid
        };
        RoomMsg.broadcast(roomId, msg);

        if ( isReady(room) ) {
            GameAlgo.prepare(room);
        }

        return true;
    }

    if (msg.e == 'chupai') {
        return GameAlgo.chuPai(room, player, msg.pai);
    }

    if (msg.e == 'pengpai') {
        return GameAlgo.pengPai(room, player);
    }

    if (msg.e == 'gangpai') {
        return GameAlgo.pengPai(room, player);
    }

    if (msg.e == 'chipai') {
        return GameAlgo.chiPai(room, player, msg.pai1, msg.pai2);
    }

    //TODO
};

