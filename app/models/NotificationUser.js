/**
 *  @mixin NotificationUser
 *  @property {Boolean} delivered flag to determine if the notification has been delivered 
 *  @property {Boolean} seen flag to determine if the notification has been seen 
 *  @ignore 
 */

/**
 * This function defines the model NotificationUser
 *
 * @param  {Sequelize} sequelize this is the instance of Sequelize
 * @ignore
 */
module.exports.defineNotificationUser = function(sequelize)
{
   var Sequelize = require("sequelize");

   module.exports.NotificationUser = sequelize.define('notification_user',
      {
         delivered:
         {
            type: Sequelize.BOOLEAN,
            allowNull: false
         },
         seen:
         {
            type: Sequelize.BOOLEAN,
            allowNull: false
         }
      },
      {
          paranoid: true,
          underscored: true,
          underscoredALL: true
      }
   );
};
