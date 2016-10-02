var mysql = require('mysql');
var Sequelize = require('sequelize');

/* Connecting to the database. */
var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS,
{
    host: 'localhost',
    dialect: 'mysql',
    port:    3306,
    logging: (process.env.SQL_LOG === 'true')? console.log : false,
    define: {
        charset: 'utf8'
    }
});

module.exports.initialize = function(callback) {

     /* define the models */
    require('../../app/models/User').defineUser(sequelize);

    require('../../app/models/Identity').defineIdentity(sequelize);

    /* defining relation */
    require('./Relations');


    var force = (process.env.RESET_DB === 'true')? true : false;

    sequelize.sync({ force: force }).then(function(err) {
        /* seeding */

        callback();
    }, function (err) {
        callback(err);
    });
};
