/**
 * Created by vladthelittleone on 04.06.16.
 */

var random =
{
    /**
     * Returns a random number between min (inclusive) and max (exclusive)
     */
    randomArbitrary: function (min, max)
    {
        return Math.random() * (max - min) + min;
    },

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    randomInt: function (min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    random: function ()
    {
        return this.randomInt(0, 1);
    },

    randomOf : function (i1, i2)
    {
        return this.random() ? i1 : i2;
    }
};

module.exports = random;
