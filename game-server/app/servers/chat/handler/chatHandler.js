
var RoomMgr = require('../roommgr');
var RoomMsg = require('../roommsg');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
    this.channelService = app.get('channelService');
    RoomMsg.channelService = this.channelService;
};

var handler = Handler.prototype;

handler.send = function(msg, session, next) {
	var rid = session.get('rid');
	var uid = session.uid;
    var ret = RoomMgr.dealMsg(rid, uid, msg);
	next(null, {result: ret});
};
