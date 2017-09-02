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

var allRooms = {};
var roomCount = 0;

exports.channelService = null;

exports.broadcast = function(roomId, msg)
{
    if ( ! exports.channelService )
    {
        console.log('room channelService not set, broadcast failed');
        return ;
    }

	var channel = exports.channelService.getChannel(roomId, false);
    channel.pushMessage('onChat', msg);
    console.log('RoomMgr broadcast', msg);
};

exports.pushMsg = function(uids, msg)
{
};

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
    exports.broadcast(roomId, msg);
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
    exports.broadcast(roomId, msg);
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

function syncPlayerGameData(room)
{
    var msg = {
        e: 'gamedata',
    };

    for (var roomPalyer in room.palyers) {
        msg.u = roomPlayer.uid;
        msg.d = roomPlayer.gameData;
        exports.pushMsg([roomPlayer.uid], msg);
    }
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
        exports.broadcast(roomId, msg);

        if ( isReady(room) ) {
            GameAlgo.prepare(room);
            syncPlayerGameData(root);
        }

        return true;
    }

    if (msg.e == 'chupai') {
        GameAlgo.chuPai(room, player, msg.pai);

        var msg = {
            e: 'chupai',
            u: uid
        };
        exports.broadcast(roomId, msg);

        syncPlayerGameData(root);
        return true;
    }

    if (msg.e == 'pengpai') {
        // this code is incorrect !!!
        // player from args, look up !!! 不一定是currentTurn !!!
        // pai is in room.gameData.pai
        // 碰过后，currentTurn 变成 我， 而不是正常的 ++, 碰的消息是要广播的, 同上面的 出牌一样， 我加了广播
        var paiPlayer = room.players[room.currentTurn];
        var ret = GameAlgo.pengPai(room, pengPlayer, paiPlayer.gameData.rids.pop());
        if (ret) {
            exports.pushMsg(paiPlayer.uid, paiPlayer.gameData);
            exports.pushMsg(player.uid, player.gameData);
            return true;
        }
        return false;
    }

    if (msg.e == 'gangpai') {
        var paiPlayer = room.players[room.currentTurn];
        var pai = null;
        if (paiPlayer.uid == player.uid) {
            pai = paiPlayer.gameData.holds.splice(msg.pai, 1);
        } else {
            pai = paiPlayer.gameData.rids.pop();
        }
        var ret = GameAlgo.pengPai(room, pengPlayer, pai);
        if (ret) {
            if (paiPlayer.uid != player.uid) {
                exports.pushMsg(paiPlayer.uid, paiPlayer.gameData);
            }
            exports.pushMsg(player.uid, player.gameData);
            return true;
        }
        return false;
    }
    //TODO
};

