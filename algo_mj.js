"use strict";

var TableMgr = require( './table_mgr.js' );
var Hulib = require( './hulib.js' );

TableMgr.init();
TableMgrLoadTable();
TableMgr.LoadFengTable();

var HOLDS_NUM = 13;   // 手里的牌数
var PAI_NUM = 34;     // 牌数
var TOTAL_NUM = 136;  // 总牌数 = 牌数 x 4

function holds_to_bm(arr)
{
    var t = {};
    for( var i = 0; i < arr.length; i ++ )
    {
        if( !t[ arr[ i ] ] ) t[ arr[ i ] ] = 0;
        t[ arr[ i ] ] += 1;
    }
    var ret = [];
    for( var i = 1; i < 35; i ++ )
    {
        ret.push( t[ i ] ? t[ i ] : 0 );
    }
    return ret;
}

function craete()
{
    var arr = [];

    for (var i = 0 ; i < PAI_NUM ; i ++) {
        for (var j = 0 ; j < 4 ; j ++) {
            arr[] = i;
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

function prepare_palyer(player)
{
    player.gameData = {};
    player.gameData.holds = [];
}

function prepare(room)
{
    room.gameData = {};
    room.gameData.mahjongs = create();
    room.gameData.mj_index = 0;
    room.gameData.dices = [];

    shuffle(room.gameData.mahjongs);

    for (var i = 0 ; i < room.players.length ; i ++) {
        prepare_palyer(room.players[i]);
    }

    var init_mopai_count = room.players.length * HOLDS_NUM ;
	for (var i = 0; i < init_mopai_count; i++) {
		mopai(room);
    }
}

function mopai(room)
{
    if (room.gameData.mj_index >= room.gameData.mahjongs.length) {
        return -1;
    }

    var pai = room.gameData.mahjongs[room.gameData.mj_index];
    room.players[room.currentTurn].gameData.holds.push(pai);
    room.gameData.mj_index++;
    room.currentTurn++;
    if ( room.currentTurn >= room.players.length ) {
        room.currentTurn = 0;
    }

    return pai;
}

function checkPeng(player, pai)
{
    var bm = holds_to_bm(player.gameData.holds);
    return (bm[pai] >= 2);
}

function checkGang(player, pai)
{
    var bm = holds_to_bm(player.gameData.holds);
    return (bm[pai] >= 3);
}

function checkChi(player, pai)
{
    if (pai > 26) { //feng can not chi
        return false;
    }
    var holds = player.gameData.holds;
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


exports.dice = dice;
exports.shuffle = shuffle;
exports.prepare = prepare;

