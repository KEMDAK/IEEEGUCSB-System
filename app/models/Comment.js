/**
*  @mixin Comment
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
    content:
    {
      type: Sequelize.TEXT,
      allowNull: false
    }
  },
  {
    underscored: true,
    underscoredALL: true
  });
};
