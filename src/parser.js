/**
 * Created by vladthelittleone on 05.06.16.
 */
var states = require('./states');

var usersManager = function ()
{
    var t = {};
    var usersMeta = [];

    t.addUser = function (user)
    {
        if (!usersMeta[user.user_id])
        {
            usersMeta[user.user_id] = user;
            usersMeta[user.user_id].states = states();
        }

        return usersMeta[user.user_id];
    };

    t.isNewMessage = function (user_id, message_id)
    {
        return usersMeta[user_id].id < message_id;
    };

    t.getUser = function (user_id)
    {
        return usersMeta[user_id];
    }
};

module.exports = usersManager();
