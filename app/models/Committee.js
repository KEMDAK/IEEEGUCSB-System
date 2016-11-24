var User = require('../../app/models/User').User;
/**
*  @Committee
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
               type: Sequelize.STRING(1234),
               allowNull: false
          }      
     },
     {
          paranoid: true,
          underscored: true,
          underscoredAll: true,
          instanceMethods:
         
          {
               /**
               * This function calls the callback function 'cb' with the head of this committee.
               * @return User
               */
               head:
                function(cb) {
                  var res ;
                   
                   User.findOne({
                       where: {
                          committee_id: this.getDataValue('id'),
                          type : 'High Board'      
                     }
                }).then(function (user) {
                   cb(user); 
               });  
   


          
     }
}

});
}
