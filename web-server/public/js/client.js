
var pomelo = window.pomelo;

var g_rid;
var g_uid;
var g_users = null;
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
    for (var i = 0 ; i < holds.length ; i ++) 
    {
        ss = ss + ' ' + pai_names[holds[i]];
    }
    return ss;
}

function update_users(msg)
{
    g_users = msg.players;
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
    setTimeout(function(){
        var pai = find_chupai_ai(g_data.holds);
        $('#gameView').append( '<div class="msgbox">我出：' + pai_names[pai] + '</div>' );
        sendMsg({e:'chupai', pai:pai});
    }, 2000);
}

function tip(msg)
{
    console.log('收到：' + JSON.stringify(msg));

    if (msg.e == 'state') {
        update_users(msg);
        if (msg.room == 'play') {
            var us = '';
            $.each(msg.players, function(i, item){
                us = us + item.uid + ' &nbsp; ';
            });
            $('#gameView').append('<div class="msgbox">本局已经开始，成员：' + us + '</div>');
        }
    }
    else if (msg.e == 'offline') {
        $('#gameView').append('<div class="msgbox">'+msg.u+'离线了</div>');
    }
    else if (msg.e == 'online') {
        $('#gameView').append('<div class="msgbox">'+msg.u+'上线了</div>');
    }
    else if (msg.e == 'holddata')
    {
        if (msg.u == g_uid) {
            if (msg.d.rids.length > 0) {
                $('#gameView').append( '<div class="msgbox">出的牌：' + holds_display(msg.d.rids) + '</div>' );
            }
            if (msg.d.pengs.length > 0) {
                $('#gameView').append( '<div class="msgbox">碰的牌：' + holds_display(msg.d.pengs) + '</div>' );
            }
            msg.d.holds.sort(function(a,b){return a>b?1:-1;});
            $('#gameView').append( '<div class="msgbox">手里的牌：' + holds_display(msg.d.holds) + '</div>' );
            $('#gameView').append( '<br/>' );
            g_data = msg.d;
            if (g_data.canHu) {
                $('#gameView').append('<div class="msgbox">我胡了！！！</div>');
            }
            if (g_data.canPeng) {
                $('#gameView').append( '<div class="msgbox">我碰</div>' );
                sendMsg({e:'pengpai'});
            }
        }
    }
    else if (msg.e == 'mopai')
    {
        $('#gameView').append( '<div class="msgbox">我摸到：' + pai_names[msg.pai] + '</div>' );
        g_data.holds.push(msg.pai);
        chupai();
    }
    else if (msg.e == 'pengpai')
    {
        if (msg.u != g_uid) {
            $('#gameView').append( '<div class="msgbox">' + msg.u + ' 碰：' + pai_names[msg.pai] + '</div>' );
        }
        else {
            chupai();
        }
    }
    else if (msg.e == 'chupai') 
    {
        if (msg.u != g_uid) {
            $('#gameView').append( '<div class="msgbox">' + msg.u + ' 出：' + pai_names[msg.pai] + '</div>' );
        }
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
    console.log(xx);
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
