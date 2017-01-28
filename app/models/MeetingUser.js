/**
 *  @mixin MeetingUser
 *  @property {int} rating rating of the user's performance in a meeting
 *  @property {Text} review review of the user's performance in a meeting
 *  @ignore 
 */

/**
 * This function defines the model MeetingUser
 *
 * @param  {Sequelize} sequelize this is the instance of Sequelize
 * @ignore
 */
module.exports.defineMeetingUser = function(sequelize)
{
   var Sequelize = require("sequelize");

   module.exports.MeetingUser = sequelize.define('meeting_user',
      {
         rating:
         {
            type: Sequelize.INTEGER,
            allowNull: true
         },
         review:
         {
            type: Sequelize.TEXT,
            allowNull: true
         }
      },
      {
          paranoid: true,
          underscored: true,
          underscoredALL: true
      }
   );
};
