
var algo = require( './algo_mj.js' );

var player = {
    gameData: {
        holds: [ 1, 2, 3, 33, 33, 33, 7, 8, 9, 32, 32, 32, 25 ]
    }
};

var ret = algo.checkHu( player, 2 );
if (ret) {
    console.log("胡了");
} else {
    console.log("没胡");
}
