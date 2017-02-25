/**
*  @mixin Meeting
*  @property {Date} start_date The date and time when the meeting starts
*  @property {Date} end_date The date and time when the meeting ends
*  @property {Text} goals JSON object representing the goals of the meeting
*  @property {String} duration Duration of the meeting (Virtual)
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
         start_date:
         {
            type: Sequelize.DATE,
            allowNull: false
         },
         end_date:
         {
            type: Sequelize.DATE,
            allowNull: false
         },
         goals:
         {
            type: Sequelize.JSON,
            allowNull: true
         },
         duration:
         {
            type: Sequelize.VIRTUAL,
            get: function ()
            {
               // duration in mins
               return (this.end_date - this.start_date)/(1000*60);
            }
         },
         location:
         {
            type: Sequelize.STRING,
            allowNull: true
         },
         description:
         {
            type: Sequelize.TEXT,
            allowNull: true
         },
         evaluation:
         {
            type: Sequelize.INTEGER,
            allowNull: true
         }
      },
      {
          underscored: true,
          underscoredALL: true
      }
   );
};
