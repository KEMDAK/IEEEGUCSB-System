/**
*  @mixin Notification
*  @property {String}   content   The notification's content 
*  @property {String}   type      The notification's type
*  @property {Date}     url       The notification's url  
*/

/**
* This Function define the model of the notification Object
* @param  {sequelize} connection the instance of the sequelize Object
* @ignore
*/
module.exports.defineNotification = function(sequelize) {
     var Sequelize = require("sequelize");
     
     module.exports.Notification = sequelize.define('notification', {
          content: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          type: {
            type: Sequelize.ENUM('TASK','MEETING','EVENT'),
            allowNull: false
          },
          url: {
            type: Sequelize.TEXT,
            allowNull: false 
          }

},
{
     paranoid: true,
     underscored: true,
     underscoredAll: true,
     instanceMethods:
          /** @lends Notification.prototype */
          {
               /**
               * This function checks if the notification is a new task.
               * @return {Boolean} true if it is a new task.
               */
               isNewTask: function() {
                    return this.type === 'TASK' ;
               },
               /**
               * This function checks if the notification is a new meeting.
               * @return {Boolean} true if it is a new meeting.
               */
               isNewMeeting: function() {
                    return this.type === 'MEETING' ;
               },
               /**
               * This function checks if the notification is a new event.
               * @return {Boolean} true if it is a new event.
               */
               isNewEvent: function() {
                    return this.type === 'EVENT' ;
               }
          }

});
};
