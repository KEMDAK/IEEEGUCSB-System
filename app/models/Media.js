/**
 *  @mixin Media
 *  @property {Integer} id Identifier of the media
 *  @property {String} type Type of the media
 *  @property {Text} url URL of the media
 */

/**
 * This function defines the model Media
 *
 * @param  {Sequelize} sequelize this is the instance of Sequelize
 * @ignore
 */
module.exports.defineMedia = function(sequelize)
{
   var Sequelize = require("sequelize");

   module.exports.Media = sequelize.define('media',
      {
         type:
         {
            type: Sequelize.STRING,
            allowNull: false
         },
         url:
         {
            type: Sequelize.STRING(1000),
            allowNull: false,
            unique: true
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
