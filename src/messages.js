'use strict';

var messages = require('./messages.json');

module.exports = MessagesManager;

/**
 * Created by vladthelittleone on 04.06.16.
 */
function MessagesManager() {

    var t = {};
    var messageId = 0;

    t.setId = setId;
    t.wrongCommand = wrongCommand;
    t.get = get;
    t.answer = answer;
    t.getByInt = getByInt;

    return t;

    function setId(mid) {

        messageId = mid;

    }

    function get(type) {

        return messages[type];

    }

    function answer(type) {

        return messages[type]
            + messages.reqNum
            + messageId;

    }

    function getByInt(type1, type2, n) {

        return messages[type1 + n]
            + messages.reqNum
            + messageId;

    }

    function wrongCommand() {

        return messages.wrongCommand
            + messages.commands
            + messages.reqNum
            + messageId;
    }

}
