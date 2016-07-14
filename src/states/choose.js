'use strict';

var Random = require('../random');
var MenuState = require('./menu');
var OrderStartState = require('./order');

module.exports = ChooseState;

/**
 * Created by vladthelittleone on 23.06.16.
 */
function ChooseState(args) {

    var t = {};

    var manager = args.manager;
    var mes = args.messageManager;

    t.menu = menu;
    t.order = order;
    t.text = text;

    return t;

    function text() {

        var n = Random.randomInt(1, 3);

        return mes.get('hello' + n) + mes.answer('commands');

    }

    function menu() {

        manager.setState(MenuState(args));

        return 'menu';

    }

    function order() {

        manager.setState(OrderStartState(args));

        return mes.answer('orderType');

    }

}
