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
    console.log('broadcast', msg);
};

exports.push = function(uids, msg)
{
    console.log('push', msg);
};
