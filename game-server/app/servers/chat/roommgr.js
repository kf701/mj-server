"use strict";

var assign = require('object-assign');

var UserMgr = require('./usermgr');
var GameAlgo = require('./algo_mj');
var RoomMsg = require('./roommsg');

var RoomObject = {
    roomId: '0',
    type: 'private',  // normal, private, compete
    turnTimeout: 0,   // 出牌限时, 0 = 无限时
    passTimeout: 30,  
    currentTurn: 0,   // 当前轮到哪个座位出牌
    creatorUid: 0,
    numOfGames: 0,    // 玩了几局了
    timer: null,
    numOfPlayers: 2,  // 共几个玩家
    players: null,
    state: 'wait',    // wait, play, over
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

function _findPlayerSeat(room, uid)
{
    var userIndex = -1;
    for (var i = 0 ; i < room.players.length ; i ++) {
        if (room.players[i].uid == uid) {
            userIndex = i;
            break;
        }
    }
    return userIndex;
}

function _resetSeat(room)
{
    for (var i = 0 ; i < room.players.length ; i ++) {
        room.players[i].seat = i;
    }
}

exports.enter = function(roomId, uid)
{
    var room = allRooms[roomId];

    var player = UserMgr.findUser(uid);
    var userIndex = _findPlayerSeat(room, uid);

    // offline to online
    if (userIndex > -1) {
        GameAlgo.online(room, player);
        return true;
    }

    if (room.players.length >= room.numOfPlayers) return false;

    room.players.push(player); 
    player.roomId = roomId;

    _resetSeat(room); // 游戏没有正式开始，重新排座次

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

    var userIndex = _findPlayerSeat(room, uid);
    if (userIndex < 0) return false;

    if (room.state == 'play') {
        var msg = {
            e: 'offline',
            u: uid
        };
        RoomMsg.broadcast(roomId, msg);
        return true;
    }

    var u = room.players[userIndex];
    u.roomId = 0;
    room.players.splice(userIndex, 1);

    var msg = {
        e: 'leave',
        u: uid
    };
    RoomMsg.broadcast(roomId, msg);

    UserMgr.del(uid);

    return true;
};

function isReady(room)
{
    if (room.numOfPlayers > room.players.length) return false;

    for (var i = 0 ; i < room.players.length ; i ++) {
        if ( ! room.players[i].ready ) {
            return false;
        }
    }
    return true;
}

exports.dealMsg = function(roomId, uid, msg)
{
    console.log('dealMsg', msg);

    var room = allRooms[roomId];
    var player = UserMgr.findUser(uid);

    if (msg.e == 'ready')
    {
        player.ready = true;

        if ( isReady(room) ) {
            room.state = 'play';
        }

        var msg = {
            e: 'state',
            room: room.state,
            players: []
        };
        for (var i = 0 ; i < room.players.length ; i ++) {
            msg.players.push({uid:room.players[i].uid, seat: room.players[i].seat, ready:room.players[i].ready});
        }
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

    if (msg.e == 'pass') {
        return GameAlgo.pass(room, player);
    }

    //TODO
};

