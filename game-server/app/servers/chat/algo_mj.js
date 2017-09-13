"use strict";

var Hulib = require( './hulib.js' );
var RoomMsg = require('./roommsg');

var HOLDS_NUM = 13;   // 手里的牌数
var PAI_NUM = 34;     // 牌数
var TOTAL_NUM = 136;  // 总牌数 = 牌数 x 4

function _holdsToBm(arr)
{
    var t = {};
    for( var i = 0; i < arr.length; i ++ )
    {
        if( !t[ arr[ i ] ] ) t[ arr[ i ] ] = 0;
        t[ arr[ i ] ] += 1;
    }
    var ret = [];
    for( var i = 0; i < 34; i ++ )
    {
        ret.push( t[ i ] ? t[ i ] : 0 );
    }
    return ret;
}

function _syncPlayerData(player)
{
    var msg = {
        e: 'holddata',
        u: player.uid,
        d: player.gameData
    };

    RoomMsg.push(player.roomId, [player.uid], msg);
}

function _removeItems(arr, item, removeCount)
{
    var findCount = arr.filter(function(arrItem) {
            arrItem == item;
        }).length;

    if (removeCount > findCount) {
        return false;
    }
    for (var i = 0; i < removeCount; i++) {
        var index = arr.indexOf(item);
        arr.splice(item, 1);
    }
    return true;
}

function _broadcastTurn(roomId, turn)
{
    var msg = {
        e: 'turn',
        turn: turn
    };
    RoomMsg.broadcast(roomId, msg);
}

function create()
{
    var arr = [];

    for (var i = 0 ; i < PAI_NUM ; i ++) {
        for (var j = 0 ; j < 4 ; j ++) {
            arr.push(i);
        }
    }

    return arr;
}

function shuffle(arr)
{
	for (var i = 0; i < arr.length; i++)
    {
		var lastIndex = arr.length - 1 - i;
		var index = Math.floor(Math.random() * lastIndex);
		var t = arr[index];
		arr[index] = arr[lastIndex];
		arr[lastIndex] = t;
    }
}

function dice(room)
{
    var dices = room.gameData.dices;
    dices.push((Math.floor(Math.random() * 100) % 6) + 1);
    dices.push((Math.floor(Math.random() * 1000) % 6) + 1);
}

function _preparePlayer(player)
{
    player.gameData = {};
    player.gameData.holds = [];   // 手里的牌
    player.gameData.rids  = [];   // 打出的牌
    player.gameData.pengs = [];
    player.gameData.gangs = [];
    player.gameData.chis  = [];
    player.gameData.tings = [];
    player.gameData.canPeng = false;
    player.gameData.canGang = false;
    player.gameData.canChi  = false;
    player.gameData.canHu   = false;
}

function _liuJu(room)
{
    // TODO
    var msg = {
        e: 'over',
    };
    RoomMsg.broadcast(roomId, msg);
}

function _moveNext(room)
{
    room.currentTurn++;
    if ( room.currentTurn >= room.players.length ) {
        room.currentTurn = 0;
    }
}

function _moPai(room, player)
{
    if (room.gameData.mj_index >= room.gameData.mahjongs.length) {
        _liuJu(room);
        return -1;
    }

    var pai = room.gameData.mahjongs[room.gameData.mj_index];
    player.gameData.holds.push(pai);
    room.gameData.mj_index++;

    return pai;
}

function prepare(room)
{
    room.gameData = {};
    room.gameData.mahjongs = create();
    room.gameData.mj_index = 0;   // 摸牌位置
    room.gameData.pai = -1;       // 当前打出的牌
    room.gameData.dices = [];

    shuffle(room.gameData.mahjongs);

    for (var i = 0 ; i < room.players.length ; i ++) {
        _preparePlayer(room.players[i]);
    }

    var init_mopai_count = room.players.length * HOLDS_NUM ;
	for (var i = 0; i < init_mopai_count; i++) {
		_moPai(room, room.players[room.currentTurn]);
        _moveNext(room);
    }
    var mo = _moPai(room, room.players[room.currentTurn]);

    for (var i = 0 ; i < room.players.length ; i ++) {
        _syncPlayerData(room.players[i]);
    }

    _broadcastTurn(room.roomId, room.currentTurn);
    var msg = {
        e: 'mopai',
        u: room.players[room.currentTurn].uid,
        pai: mo
    };
    RoomMsg.push(room.roomId, [room.players[room.currentTurn].uid], msg);
}

function pass(room, player)
{
    _moveNext(room);
    _broadcastTurn(room.roomId, room.currentTurn);

    var mo = _moPai(room, room.players[room.currentTurn]);
    if (mo > -1 ) {
        msg = {
            e: 'mopai',
            u: room.players[room.currentTurn].uid,
            pai: mo
        };
        RoomMsg.push(room.roomId, [room.players[room.currentTurn].uid], msg);
    }
    return true;
}

function chuPai(room, player, pai)
{
    var paiIndex = player.gameData.holds.indexOf(pai);
    if (paiIndex != -1) {
        player.gameData.holds.splice(paiIndex, 1);
        player.gameData.rids.push(pai);
    }

    room.gameData.pai = pai;

    var msg = {
        e: 'chupai',
        u: player.uid,
        pai: pai
    };
    RoomMsg.broadcast(room.roomId, msg);

    var nohup = true;

    for(var i = 0 ; i < room.players.length ; i ++)
    {
        var roomPlayer = room.players[i];
        var gd = roomPlayer.gameData;
        var bm = _holdsToBm(gd.holds);

        gd.canPeng = false;
        gd.canGang = false;
        gd.canChi  = false;
        gd.canHu   = false;

        if (roomPlayer.uid != player.uid)
        {
            gd.canPeng = checkPeng(bm, pai);
            gd.canGang = checkGang(bm, pai);
            gd.canChi  = checkChi(bm, pai);
            gd.canHu   = checkHu(bm, pai);
        }
        
        if (gd.canPeng || gd.canGang || gd.canChi || gd.canHu) {
            nohup = false;
        }

        _syncPlayerData(roomPlayer);
    }

    if (nohup) {
        _moveNext(room);
        _broadcastTurn(room.roomId, room.currentTurn);

        var mo = _moPai(room, room.players[room.currentTurn]);
        if (mo > -1 ) {
            msg = {
                e: 'mopai',
                u: room.players[room.currentTurn].uid,
                pai: mo
            };
            RoomMsg.push(room.roomId, [room.players[room.currentTurn].uid], msg);
        }
    }

    return true;
}

function chiPai(room, player, pai1, pai2)
{
    var pai = room.gameData.pai;

    if (!player.canChi) {
        return false;
    }

    if (!_removeItems(player.gameData.holds, pai, 1)) {
        return false;
    }

    var chi = {pai: pai, arr: [pai, pai1, pai2]};
    chi.arr.sort();
    player.gameData.chis.push(chi);

    room.currentTurn = player.seat;
    _broadcastTurn(room.roomId, room.currentTurn);

    _syncPlayerData(player);

    return true;
};

function pengPai(room, player)
{
    var pai = room.gameData.pai;

    if (!player.canPeng) {
        return false;
    }
    if (!_removeItems(player.gameData.holds, pai, 2)) {
        return false;
    }

    player.gameData.pengs.push(pai, pai, pai);

    room.currentTurn = player.seat;
    _broadcastTurn(roomId, room.currentTurn);

    _syncPlayerData(player);

    return true;
};

function gangPai(room, player)
{
    var pai = room.gameData.pai;

    if (!player.canGang) {
        return false;
    }
    if (!_removeItems(player.gameData.holds, pai, 3)) {
        return false;
    }

    player.gameData.gangs.push(pai, pai, pai, pai);

    room.currentTurn = player.seat;
    _broadcastTurn(roomId, room.currentTurn);

    _syncPlayerData(player);

    return true;
};

function checkPeng(bm, pai)
{
    return (bm[pai] >= 2);
}

function checkGang(bm, pai)
{
    return (bm[pai] >= 3);
}

function checkChi(holds, pai)
{
    if (pai > 26) {
        return false;
    }
    var hasBeforeBeforePai = false;
    if (pai % 9 > 1) {
        hasBeforeBeforePai = holds[pai - 2] > 0;
    }
    var hasBeforePai = false;
    if (pai % 9 > 0) {
        hasBeforePai = holds[pai - 1] > 0;
    }
    var hasAfterPai = false;
    if ( pai % 9 < 8) {
        hasAfterPai = holds[pai + 1] > 0;
    }
    var hasAfterAfterPai = false;
    if (pai % 9 < 7) {
        hasAfterAfterPai = holds[pai + 2] > 0;
    }

    return hasBeforeBeforePai && hasBeforePai
        || hasBeforePai && hasAfterPai
        || hasAfterPai && hasAfterAfterPai;
}

function checkHu(bm, pai)
{
    return Hulib.checkHu(bm, pai, -1, -1);
}

function getTings(player)
{
    var tings = [];
    var bm = _holdsToBm(player.gameData.holds);

    for (var i = 0 ; i < PAI_NUM ; i ++) {
        bm[i] += 1;
        if (Hulib.checkHu(bm, pai, -1, -1))
            tings.push(i); 
        bm[i] -= 1;
    }

    return tings;
}


exports.dice = dice;
exports.shuffle = shuffle;
exports.prepare = prepare;
exports.getTings = getTings;
exports.chuPai = chuPai;
exports.pengPai = pengPai;
exports.gangPai = gangPai;
exports.chiPai = chiPai;
exports.pass = pass;

