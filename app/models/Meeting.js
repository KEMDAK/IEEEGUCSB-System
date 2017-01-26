/**
*  @mixin Meeting
*  @property {Date} date The date and time of the meeting
*  @property {Text} goals Goals of the meeting
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
         date:
         {
            type: Sequelize.DATE,
            allowNull: false
         },
         goals:
         {
            type: Sequelize.TEXT,
            allowNull: false,
            set: function(val)
            {
                 this.setDataValue('goals', JSON.stringify(val));
            },
            get: function()
            {
               return JSON.parse(this.getDataValue('goals'));
            }
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
         },
         evaluation:
         {
            type: Sequelize.INTEGER,
            allowNull: true
         }
      }
   );
};
