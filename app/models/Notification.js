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
            type: Sequelize.ENUM('TASK','MEETING','EVENT','ANNOUNCEMENT','COMMENT'),
            allowNull: false
          },
          url: {
            type: Sequelize.STRING,
            allowNull: false ,
            unique : true 
          }
},
{
     underscored: true,
     underscoredAll: true,
     instanceMethods:
          /** @lends Notification.prototype */
          {
               /**
               * This function checks if the notification is a task.
               * @return {Boolean} true if it is a new task.
               */
               isTask: function() {
                    return this.type === 'TASK' ;
               },
               /**
               * This function checks if the notification is a meeting.
               * @return {Boolean} true if it is a new meeting.
               */
               isMeeting: function() {
                    return this.type === 'MEETING' ;
               },
               /**
               * This function checks if the notification is a event.
               * @return {Boolean} true if it is a new event.
               */
               isEvent: function() {
                    return this.type === 'EVENT' ;
               },
               /**
               * This function checks if the notification is a announcement.
               * @return {Boolean} true if it is a new announcement.
               */
               isAnnouncement: function() {
                    return this.type === 'ANNOUNCEMENT' ;
               },
               /**
               * This function checks if the notification is a comment.
               * @return {Boolean} true if it is a comment.
               */
               isComment: function() {
                    return this.type === 'COMMENT' ;
               }
          }
});
};
