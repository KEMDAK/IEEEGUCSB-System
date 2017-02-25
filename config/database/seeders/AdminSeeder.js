/**
* This function seeds the predefined Admins into the database
* @param  {Function} callback callback function that is called once the seeding is done
* @ignore
*/
module.exports = function(callback){
	var User   = require('../../../app/models/User').User;
	var admins = require('../../data/Admins.json');

	User.bulkCreate(admins, { updateOnDuplicate : ['type', 'first_name', 'last_name', 'birthdate', 'gender', 'email', 'password', 'phone_number', '	IEEE_membership_ID', 'settings'] }).then(function(records) {
		callback();
	}).catch(function(err) {
		callback(err);
	});
};