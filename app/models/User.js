/**
*  @mixin User
*  @property {String} type The users's type ('Admin', 'Upper Board', 'High Board', 'Member')
*  @property {String} first_name The users's first name
*  @property {String} last_name The users's last name
*  @property {Date} birthdate The users's birthdate
*  @property {String} gender The users's gender ('Male', 'Female')
*  @property {String} email The users's email
*  @property {String} password The users's password
*  @property {String} phone_number The users's phone number
*  @property {String} IEEE_membership_ID The users's IEEE_membership_ID
*  @property {String} reset_token The reset token of the user that could be used to reset the password
*  @property {Object} settings The users's settings as a JSON object
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
   phone_number: {
     type: Sequelize.STRING,
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
   },
   settings: {
    type: Sequelize.JSON,
    allowNull: false
   }
 },
 {
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
     },
      /**
      * this function returns the user object.
      * @param {boolean} detailed true if the returned attributes should be detailed.
      * @param {boolean} mine true if the returned attributes are requested by thier owner.
      * @return {Object} The user object.
      */
      toJSON: function(detailed,mine) {
        var res = {};
       // if(this.settings)
        var settings = JSON.parse(this.settings);
        var type = 'Basic' ;




        if(mine==true){
              type = 'Mine';
           }else{
              delete settings.private ;
              if(detailed==true )
                type = 'Detailed';
               }
          if(this.profilePicture)
          this.profilePicture.url = 'http://' + process.env.DOMAIN + ':' + process.env.PORT+this.profilePicture.url;

          res.profile_type       = type;
          res.id                 = this.id;
          res.type               = this.type;
          res.first_name         = this.first_name;
          res.last_name          = this.last_name;
          res.gender             = this.gender;
          res.email              = this.email;
          res.phone_number       = this.phone_number;
          res.birthdate          = this.birthdate;
          res.IEEE_membership_ID = this.IEEE_membership_ID;
          res.settings           = settings;
          res.committee          = this.Committee;
          res.profile_picture    = this.profilePicture;
          res.honors             = this.Honors ;
          res.tasks              = this.Tasks ;

          if(this.Meetings){
           var meetings = [];
           for (var i = this.Meetings.length - 1; i >= 0; i--) {
            var currM= this.Meetings[i];
            var currRes = {
              id : currM.id ,
              start_date: currM.start_date,
              end_date: currM.end_date,
              location: currM.location,
              created_at: currM.created_at,
              updated_at: currM.updated_at
            };
            meetings.push(currRes);
          }
          res.meetings = meetings
        }else{
         res.meetings = this.Meetings
       }


        return res;
      }

    }
  });
};
