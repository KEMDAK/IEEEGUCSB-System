/**
*  @mixin Honor
*  @property {String} name Name of the honor
*  @property {Text} description Description of the honor
*/

/**
* This function defines the model Honor
*
* @param  {Sequelize} sequelize this is the instance of Sequelize
* @ignore
*/
module.exports.defineHonor = function(sequelize)
{
  var Sequelize = require("sequelize");

  module.exports.Honor = sequelize.define('honor',
  {
    name:
    {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description:
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
