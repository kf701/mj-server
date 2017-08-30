"use strict";

var TableMgr = require( './table_mgr.js' );
var Hulib = require( './hulib.js' );

TableMgr.init();
TableMgrLoadTable();
TableMgr.LoadFengTable();

function craete()
{
    var arr = [];

    for (var i = 0 ; i < 34 ; i ++) {
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

function prepare(room)
{
    room.gameData = {};
    room.gameData.mahjongs = create();
    room.gameData.mj_index = 0;
    shuffle(room.gameData.mahjongs);
}

exports.shuffle = shuffle;
exports.prepare = prepare;

