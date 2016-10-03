/**
*  @mixin User
*  @property {String} type The users's type ('Admin', 'Upper Board', 'High Board', 'Member')
*  @property {String} first_name The users's first name
*  @property {String} last_name The users's last name
*  @property {Date} birthdate The users's birthdate
*  @property {String} gender The users's gender ('Male', 'Female')
*  @property {String} email The users's email
*  @property {String} password The users's password
*  @property {String} IEEE_membership_ID The users's IEEE_membership_ID
*/

/**
* This Function define the model of the user Object
* @param  {sequelize} connection the instance of the sequelize Object
* @ignore
*/
module.exports.defineUser = function(sequelize) {
     var Sequelize = require("sequelize");
     var bcrypt = require('bcrypt-nodejs');

     module.exports.User = sequelize.define('user', {
          type: {
               type: Sequelize.ENUM('Admin', 'Upper Board', 'High Board', 'Member'),
               allowNull: false
          },
          first_name: {
               type: Sequelize.STRING(45),
               allowNull: false
          },
          last_name: {
               type: Sequelize.STRING(45),
               allowNull: false
          },
          birthdate: {
               type: Sequelize.DATEONLY,
               allowNull: false
          },
          gender: {
               type: Sequelize.ENUM('Male', 'Female'),
               allowNull: false
          },
          email: {
               type: Sequelize.STRING,
               unique: true,
               allowNull: false
          },
          password: {
               type: Sequelize.STRING,
               set: function(value){
                    this.setDataValue('password', bcrypt.hashSync(value));
               },
               allowNull: false
          },
          IEEE_membership_ID: {
               type: Sequelize.STRING,
               unique: true,
               allowNull: true
          },
          reset_token: {
              type: Sequelize.STRING(700),
              allowNull: true
          }
     },
     {
          paranoid: true,
          underscored: true,
          underscoredAll: true,
          instanceMethods:
          /** @lends User.prototype */
          {
               /**
               * This function validates the password of the user.
               * @param  {String} password the claimed password.
               * @return {Boolean} true if the claimed password matches the real one.
               */
               validPassword: function(password) {
                    return bcrypt.compareSync(password, this.password);
               },
               /**
               * This function checks if the user is an admin.
               * @return {Boolean} true if the claimed password matches the real one.
               */
               isAdmin: function() {
                    return this.type === 'Admin';
               },
               /**
               * This function checks if the user is an upper board.
               * @return {Boolean} true if the claimed password matches the real one.
               */
               isUpperBoard: function() {
                    return this.type === 'Upper Board';
               },
               /**
               * This function checks if the user is a high board.
               * @return {Boolean} true if the claimed password matches the real one.
               */
               isHighBoard: function() {
                    return this.type === 'High Board';
               },
               /**
               * This function checks if the user is a member.
               * @return {Boolean} true if the claimed password matches the real one.
               */
               isMember: function() {
                    return this.type === 'Member';
               }
          }
     });
};
