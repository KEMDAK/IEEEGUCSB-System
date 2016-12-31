/**
*  @mixin Committee
*  @property {String} name The committee's name
*  @property {String} description The committee's description
*/

/**
* This Function define the model of the committee Object
* @param  {sequelize} connection the instance of the sequelize Object
* @ignore
*/
module.exports.defineCommittee = function(sequelize) {
  var Sequelize = require("sequelize");

  module.exports.Committee = sequelize.define('committee', {
    name: {
      type: Sequelize.STRING(45),
      unique: true,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    }      
  },
  {
    paranoid: true,
    underscored: true,
    underscoredAll: true,
    instanceMethods:
    /** @lends Committee.prototype */
    {
      /**
      * This function calls the callback function 'callback' with the head of this committee.
      * @return User
      */
      head:
      function(callback) {
        var User = require('../../app/models/User').User;
        var res ;

        User.findOne({
         where: {
          committee_id: this.getDataValue('id'),
          type : 'High Board'      
        }
        }).then(function (user) {

          callback(user, null); 
        }).catch(function(err) {
          /* failed duo to an error in the database while trying to find the Head of the Committee */
          callback(null, err);
        });
      }
    }
  });
};
