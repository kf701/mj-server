
var pomelo = window.pomelo;

var g_uid;
var g_rid;

var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

// show tip
function tip(msg) {
	//var title = 'Message Notify';
	//var tip = 'msg: ' + msg.e + ', uid: ' + msg.u;
	//var pop=new Pop(title, tip);

	var tip = 'room: ' + g_rid + ', ' + JSON.stringify(msg);
    $('#gameView').append(tip + '<br/>');
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
	$("#gameView").show();
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


function sendMsg(msg, callback) {
	pomelo.request("chat.chatHandler.send", msg, function(data) {
        callback(data);
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
