'use strict';

var MessagesManager = require('../messages');
var ChooseState = require('./choose');

module.exports = StatesManager;

/**
 * Created by vladthelittleone on 05.06.16.
 */
function StatesManager() {

    var t = {};
    var messageManager = MessagesManager();

    var state = initState();

    t.setState = setState;
    t.text = text;
    t.order = order;
    t.menu = menu;
    t.setMessageId = setMessageId;

    return t;

    function initState() {

        return ChooseState({
            manager:        t,
            messageManager: messageManager
        });

    }

    function menu() {

        if (state.menu) {

            return state.menu();

        }

        return wrongCommand();

    }

    function setMessageId(mid) {

        messageManager.setId(mid);

    }

    function order() {

        if (state.order) {

            return state.order();

        }

        return wrongCommand();

    }

    function text(text) {

        if (state.text) {

            return state.text(text);

        }

        return wrongCommand();

    }

    function setState(_state) {

        state = _state;

    }

    function wrongCommand() {

        initState();

        return messageManager.wrongCommand();

    }

}
