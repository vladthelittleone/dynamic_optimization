'use strict';

var OrderNumberState = require('./number');

module.exports = OrderStartState;

var Storage = require('../storage');

/**
 * Created by vladthelittleone on 23.06.16.
 */
function OrderStartState(args) {

    var t = {};

    var manager = args.manager;
    var mes = args.messageManager;

    t.text = text;

    return t;

    function text(orderText) {

        if (orderText) {

            Storage.order = orderText;

            manager.setState(OrderNumberState(args));

            return mes.answer('orderPhoneNumber');

        } else {

            return mes.answer('tryAgain');
        }

    }

}
