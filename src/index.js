'use strict';

/**
 * Created by vladthelittleone on 03.06.16.
 */
var VK = require('vksdk');

var settings = require('./settings');
var users = require('./users');
var binding = require('./binding');

var pollParams;

var vk = new VK({
    'appId':     0,
    'appSecret': '0',
    'mode':      settings.mode
});

// Turn on requests with access tokens
vk.setSecureRequests(true);
vk.setToken(settings.token);

// Waiting for special 'serverTokenReady' event
vk.request('messages.getLongPollServer', {'need_pts': 1, 'use_ssl': 1});

done('messages.send', function (data) {
    console.log(data);
});

done('messages.getLongPollHistory', onLongPollHistoryDone);
done('messages.getLongPollServer', onLongPollServerDone);

// =============================================================================================

function onLongPollServerDone(data) {
    pollParams = data.response;

    vk.request('messages.getLongPollHistory', {'ts': pollParams.ts, 'pts': pollParams.pts});
}

function onLongPollHistoryDone(data) {

    var res = data.response;

    if (res) {

        pollParams.pts = res.new_pts ? res.new_pts : pollParams.pts;

        handleMessages(res);
    }

    vk.request('messages.getLongPollHistory', {'ts': pollParams.ts, 'pts': pollParams.pts});

}

function handleMessages(res) {

    var m = res.messages.items;

    m.length && m.forEach(function (m) {

        console.log(m);

        if (!m.out) {

            var user = users.addUser(m);
            var text = m.body.trim();
            var command = binding[text.toLocaleLowerCase()] || 'text';

            user.states.setMessageId(m.id);

            markAsRead(m.id);

            sendMessage(m.user_id, user.states[command](text));

        }

    });

}

function sendMessage(id, message) {

    vk.request('messages.send', {'user_id': id, 'message': message});

}

function markAsRead(mid) {

    vk.request('messages.markAsRead', {'message_ids': mid});

}

function done(type, callback) {

    vk.on('done:' + type, callback);

}
