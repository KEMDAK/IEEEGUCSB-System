/**
 *  @mixin Media
 *  @property {String} type Type of the media
 *  @property {String} url URL of the media
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
            type: Sequelize.ENUM("Video", "Audio", "Image"),
            allowNull: false
         },
         url:
         {
            type:Sequelize.STRING,
            allowNull: false,
            unique: true
         }
      },
      {
          paranoid: true,
          underscored: true,
          underscoredALL: true
      }
   );
};
