/**
 *  @mixin Honor
 *  @property {Integer} id Identifier of the honor
 *  @property {String} description Description of the honor
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
         id:
         {
            type: Sequelize.Integer,
            primaryKey: true
         },
         name:
         {
            type: Sequelize.STRING,
            allowNull: false
         },
         description:
         {
            type: Sequelize.TEXT,
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
