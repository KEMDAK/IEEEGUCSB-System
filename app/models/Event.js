/**
*  @mixin Event
*  @property {String} name The event's name
*  @property {String} description The events's description
*  @property {Date} start_date The event's start date and time
*  @property {Date} end_date The event's end date and time
*  @property {String} location The event's location
*/

/**
 * This function defines the model of the event Object
 * @param  {sequelize} connection the instance of the sequelize Object
 * @ignore
 */
module.exports.defineEvent = function(sequelize) {
   var Sequelize = require("sequelize");

   module.exports.Event = sequelize.define('event', {
      name: {
         type: Sequelize.STRING(45),
         allowNull: false
      },
      description: {
         type: Sequelize.TEXT,
         allowNull: false
      },
      start_date: {
         type: Sequelize.DATE,
         allowNull: false
      },
      end_date: {
         type: Sequelize.DATE,
         allowNull: false
      },
      location: {
         type: Sequelize.STRING,
         allowNull: false
      }
   },
   {
      paranoid: true,
      underscored: true,
      underscoredAll: true
   });
};
