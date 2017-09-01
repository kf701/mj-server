
var UserMgr = require('../usermgr');
var RoomMgr = require('../roommgr');

module.exports = function(app) {
	return new ChatRemote(app);
};

var ChatRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
    RoomMgr.channelService = this.channelService;
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} rid channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, rid, flag, cb) {
	var channel = this.channelService.getChannel(rid, flag);
	if( !! channel) {
		channel.add(uid, sid);
	}
    if ( !UserMgr.findUser(uid) ) {
        UserMgr.newUser(uid);
    }
    if ( !RoomMgr.findRoom(rid) ) {
        RoomMgr.createRoom(uid, rid, sid);
    }
    var ret = RoomMgr.enter(rid, uid);
	cb({result:ret});
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} rid channel name
 *
 */
ChatRemote.prototype.kick = function(uid, sid, rid) {
	var channel = this.channelService.getChannel(rid, false);
	if( !! channel) {
		channel.leave(uid, sid);
	}
    RoomMgr.leave(rid, uid);
    UserMgr.del(uid);
};
