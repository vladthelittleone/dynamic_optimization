'use strict';

module.exports = MenuState;

/**
 * Created by vladthelittleone on 23.06.16.
 */
function MenuState(args) {

    var t = {};

    var manager = args.manager;
    var mes = args.messageManager;

    t.text = text;

    return t;

    function text() {

        return 'menu';

    }
}
