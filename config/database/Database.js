var mysql = require('mysql');
var Sequelize = require('sequelize');

/* Connecting to the database. */
var db_name = process.env.DB_NAME;
if (process.env.ENV === 'test') {
   db_name += '_test';
}

var sequelize = new Sequelize(db_name, process.env.DB_USER, process.env.DB_PASS,
{
   host: process.env.DB_HOST,
   dialect: 'mysql',
   port:    3306,
   logging: (process.env.SQL_LOG === 'true')? console.log : false,
   define: {
      charset: 'utf8'
   }
});
module.exports.Seq = sequelize ;
module.exports.initialize = function(callback) {

   /* define the models */
   require('../../app/models/Log').defineLog(sequelize);
   require('../../app/models/Task').defineTask(sequelize);
   require('../../app/models/Honor').defineHonor(sequelize);
   require('../../app/models/Comment').defineComment(sequelize);
   require('../../app/models/Media').defineMedia(sequelize);
   require('../../app/models/Event').defineEvent(sequelize);
   require('../../app/models/NotificationUser').defineNotificationUser(sequelize);
   require('../../app/models/MeetingUser').defineMeetingUser(sequelize);
   require('../../app/models/Committee').defineCommittee(sequelize);
   require('../../app/models/Meeting').defineMeeting(sequelize);
   require('../../app/models/Notification').defineNotification(sequelize);
   require('../../app/models/User').defineUser(sequelize);
   require('../../app/models/Identity').defineIdentity(sequelize);

   /* defining relation */
   require('../../app/models/Relations');

   var force = (process.env.RESET_DB === 'true')? true : false;

   sequelize.sync({ force: force }).then(function(err) {
      /* seeding */
      require('./seeders/Seeder.js')(function(err) {
         if(err){
            callback(null, err);
         }
         else{
            callback(sequelize, null);
         }
      });
   }, function (err) {
      callback(null, err);
   });
};
