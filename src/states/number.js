'use strict';

var Storage = require('../storage');
var ChooseState = require('./choose');

module.exports = OrderNumberState;

/**
 * Created by vladthelittleone on 23.06.16.
 */
function OrderNumberState(args) {

    var t = {};

    var MIN_LENGTH = 10;
    var MAX_LENGTH = 11;

    var manager = args.manager;
    var mes = args.messageManager;

    t.text = text;

    return t;

    function text(orderText) {

        if (orderText) {

            var len = orderText.length;

            var lenCheck = len >= MIN_LENGTH && len <= MAX_LENGTH;

            if (isNumeric(orderText) && lenCheck) {

                Storage.number = orderText;

                manager.setState(ChooseState(args));

                return mes.answer('thanksForOrder');

            } else {

                return mes.answer('canNotGetNumber');

            }

        }

    }

    function isNumeric(n) {

        return !isNaN(parseFloat(n)) && isFinite(n);

    }

}
