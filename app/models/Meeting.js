/**
*  @mixin Meeting
*  @property {Integer} id The identifier of the meeting
*  @property {Date} date The date of the meeting
*  @property {Text} tools Required tools during the meeting
*  @property {String} duration Duration of the meeting
*  @property {String} location Location of the meeting
*  @property {Text} description Description of the meeting
*  @property {Integer} evalutaion Evalutaion of the meeting
*/

/**
* This function defines the model Meeting
*
* @param  {Sequelize} sequelize this is the instance of Sequelize
* @ignore
*/
module.exports.defineMeeting = function(sequelize)
{
   var Sequelize = require("sequelize");

   module.exports.Meeting = sequelize.define('meeting',
      {
         id:
         {
            type: Sequelize.INTEGER,
            primaryKey: true
         },
         date:
         {
            type: Sequelize.DATE,
            allowNull: false
         },
         tools:
         {
            type: Sequelize.TEXT,
            allowNull: false
         },
         duration:
         {
            type: Sequelize.STRING,
            allowNull: false
         },
         location:
         {
            type: Sequelize.STRING,
            allowNull: false
         },
         description:
         {
            type: Sequelize.TEXT,
            allowNull: false
         }
         evalutaion:
         {
            type: Sequelize.INTEGER,
            allowNull: true
         }
      },
      {
         paranoid: true,
         underscored: true,
         underscoredALL: true,
         charset: 'latin1'
      }
   );
};
