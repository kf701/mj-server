"use strict";

exports.channelService = null;

exports.broadcast = function(roomId, msg)
{
    if ( ! exports.channelService )
    {
        console.log('room channelService not set, broadcast failed');
        return ;
    }

	var channel = exports.channelService.getChannel(roomId, false);
    channel.pushMessage('onChat', msg);
    console.log('broadcast msg', msg);
};

exports.push = function(roomId, uids, msg)
{
    if ( ! exports.channelService )
    {
        console.log('room channelService not set, broadcast failed');
        return ;
    }

    var uu = [];
	var channel = exports.channelService.getChannel(roomId, false);

    for (var i = 0 ; i < uids.length ; i ++ )
    {
        var tsid = channel.getMember(uids[i])['sid'];
        uu.push({uid: uids[i], sid: tsid});
    }

    exports.channelService.pushMessageByUids('onChat', msg, uu);
    console.log('push msg', msg);
    console.log('push to', uu);
};
