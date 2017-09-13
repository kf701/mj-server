
var pomelo = window.pomelo;

var g_rid;
var g_uid;
var g_seat;
var g_users = [];
var g_is_myturn = false;
var g_data = null;

var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

var pai_names = [
    '一万', '二万', '三万', '四万', '五万', '六万', '七万', '八万', '九万', 
    '一筒', '二筒', '三筒', '四筒', '五筒', '六筒', '七筒', '八筒', '九筒', 
    '一条', '二条', '三条', '四条', '五条', '六条', '七条', '八条', '九条', 
    '东风', '南风', '西风', '北风', '红中', '白板', '发财'
];

function holds_display(holds)
{
    var ss = '';
    holds.sort(function(a,b){return a>b?1:-1;});
    for (var i = 0 ; i < holds.length ; i ++) 
    {
        ss = ss + ',' + pai_names[holds[i]];
    }
    return ss;
}

function find_user(seat)
{
    for(var i = 0 ; i < g_users.length ; i ++ ) {
        if (g_users[i].seat == seat) return g_users[i];
    }
    return null;
}

function update_users(msg)
{
    var user = find_user(msg.seat);
    if (!user) {
        g_users.push({uid: msg.u, seat: msg.seat});
    }
    if (msg.u == g_uid) g_seat = msg.seat;
}

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

function find_chupai_ai(holds)
{
	var bm = _holdsToBm(holds);
    var i = 33;
    while( i >= 0 ) 
    {
        if ( bm[i] != 1 ) {
            i--;
            continue;
        }
        
        if ( i >= 27 ) return  i;

        if (i == 0 || i == 9 || i == 18) {
            if (bm[i+1] != 1) return i;
        }
        else if (i == 8 || i == 17 || i == 26) {
            if (bm[i-1] != 1) return i;
        }
        else {
            if (bm[i-1] != 1 && bm[i+1] != 1) return i;
        }

        i--;
    }

    return holds[0];
}

function chupai()
{
    var pai = find_chupai_ai(g_data.holds);
    setTimeout(function(){
        $('#gameView').append( '<div class="msgbox">我出：' + pai_names[pai] + '</div>' );
        sendMsg({e:'chupai', pai:pai});
    }, 8000);
}

function tip(msg) {
	//var title = 'Message Notify';
	//var tip = 'msg: ' + msg.e + ', uid: ' + msg.u;
	//var pop=new Pop(title, tip);

	var tip = 'room: ' + g_rid + ', 收到：' + JSON.stringify(msg);
    if (msg.e != 'holddata') $('#gameView').append('<div class="msgbox">' + tip + '</div>');

    if (msg.e == 'ready') {
        update_users(msg);
    }
    else if (msg.e == 'holddata') {
        $('#gameView').append( '<div class="msgbox">' + holds_display(msg.d.holds) + '</div>' );
        g_data = msg.d;
        if (g_data.canHu) {
            $('#gameView').append('<div class="msgbox">我胡了！！！</div>');
        }
        if (g_data.canPeng) {
            $('#gameView').append( '<div class="msgbox">我碰</div>' );
            sendMsg({e:'pengpai'});
        }
    }
    else if (msg.e == 'mopai') {
        $('#gameView').append( '<div class="msgbox">我摸到：' + pai_names[msg.pai] + '</div>' );
        chupai();
    }

    $('#gameView').scrollTop($('#gameView')[0].scrollHeight);
};

// show error
function showError(content) {
	$("#loginError").text(content);
	$("#loginError").show();
};

// show login panel
function showLogin() {
	$("#loginView").show();
	$("#loginError").hide();
	$("#gameView").hide();
};

// show chat panel
function showGame() {
	$("#loginView").hide();
	$("#loginError").hide();
	$("#gameView").empty();
	$("#gameView").show();
    $('#gameView').css('height', $(window).height() + 'px');
    sendMsg({e:'ready'});
};

// query connector
function queryEntry(uid, callback) {
	var route = 'gate.gateHandler.queryEntry';
	pomelo.init({
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(data) {
			pomelo.disconnect();
			if(data.code === 500) {
				showError(LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port);
		});
	});
};

function sendMsg(msg) {
    var xx = '发送: ' + JSON.stringify(msg);
    $('#gameView').append('<div class="msgbox">' +xx + '</div>');
	pomelo.request("chat.chatHandler.send", msg, function(data) {
	});
}

$(document).ready(function() {
	//when first time into chat room.
	showLogin();

	//wait message from the server.
	pomelo.on('onChat', function(msg) {
		tip(msg);
	});

	//handle disconect message, occours when the client is disconnect with servers
	pomelo.on('disconnect', function(reason) {
		showLogin();
	});

	//deal with login button click.
	$("#login").click(function() {
		g_uid = $("#loginUser").attr("value");
		g_rid = $('#channelList').val();

		if(g_uid.length > 20 || g_uid.length == 0 || g_rid.length > 20 || g_rid.length == 0) {
			showError(LENGTH_ERROR);
			return false;
		}

		if(!reg.test(g_uid) || !reg.test(g_rid)) {
			showError(NAME_ERROR);
			return false;
		}

		//query entry of connection
		queryEntry(g_uid, function(host, port) {
			pomelo.init({
				host: host,
				port: port,
				log: true
			}, function() {
				var route = "connector.entryHandler.enter";
				pomelo.request(route, {
					uid: g_uid,
					rid: g_rid
				}, function(data) {
					if(data.error) {
						showError(DUPLICATE_ERROR);
						return;
					}
					showGame();
				});
			});
		});
	});

});
