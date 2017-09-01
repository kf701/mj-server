var chatRemote = require('../remote/chatRemote');
var RoomMgr = require('../roommgr');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
    this.channelService = app.get('channelService');
    RoomMgr.channelService = this.channelService;
};

handler.send = function(msg, session, next) {
	var rid = session.get('rid');
	var uid = session.uid;
    var ret = RoomMgr.dealMsg(rid, uid, msg);
	next(null, {result: ret});
};
