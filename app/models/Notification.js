/**
*  @mixin Task
*  @property {String}   content   The notification's content 
*  @property {String}   type      The notification's type
*  @property {Date}     URL       The notification's URL  
*/

/**
* This Function define the model of the task Object
* @param  {sequelize} connection the instance of the sequelize Object
* @ignore
*/
module.exports.defineNotification = function(sequelize) {
     var Sequelize = require("sequelize");
     

     module.exports.Notification = sequelize.define('task', {
          content: {
               type: Sequelize.TEXT,
               allowNull: false
          },
          type: {
            type: Sequelize.ENUM('',''),
            allowNull: false
          },
          URL: {
               type: Sequelize.TEXT,
               allowNull: false
          }
        
     },
     {
          paranoid: true,
          underscored: true,
          underscoredAll: true,
         
     });
};
