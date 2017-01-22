/**
*  @mixin Comment
*  @property {Integer} id Identifier of the comment
*  @property {String} content The actual comment
*/

/**
* This function defines the model Comment
*
* @param  {Sequelize} sequelize this is the instance of Sequelize
* @ignore
*/
module.exports.defineComment = function(sequelize)
{
   var Sequelize = require("sequelize");

   module.exports.Comment = sequelize.define('comment',
      {
         id:
         {
            type: Sequelize.Integer,
            primaryKey: true
         },
         content:
         {
            type: Sequelize.STRING,
            allowNull: false
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
