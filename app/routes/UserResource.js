/**
* This function configures the user routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var UserController = require('../controllers/UserController');
    var auth           = require('../middlewares/AuthMiddleware');

    /**
    * A GET route responsible for getting all users in the database
    * @var /api/user GET
    * @name /api/user GET
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	users:
    * 	[
    * 	   {
    *        id: the user id,
    *        type: the type of the account ['Admin', 'Upper Board', 'High Board', 'Member'],
    *        first_name: the logged in user first name,
    *        last_name: the logged in user last name,
    *        email: the logged in user email,
    *        gender: the logged in user gender,
    *        birthdate: the logged in user birthdate,
    *        IEEE_membership_ID: the membership id in IEEE
    * 	   }, {...}, ...
    * 	 ]
    * 	error: Validation errors
    * }
    */
    app.get('/api/user', auth, UserController.index);

    /**
    * A GET route to show a specific user
    * @var /api/user/{id} GET
    * @name /api/user/{id} GET
    * @example The route expects a user id for the user to be returned
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    *   result:
    *   {
    *     id: the user id,
    *     type: the type of the account ['Admin', 'Upper Board', 'High Board', 'Member'],
    *     first_name: the logged in user first name,
    *     last_name: the logged in user last name,
    *     email: the logged in user email,
    *     gender: the logged in user gender,
    *     birthdate: the logged in user birthdate,
    *     IEEE_membership_ID: the membership id in IEEE
    *   }
    *   error: Validation errors
    * }
    */
    app.get('/api/user/:id', auth, UserController.show);

    /**
    * A POST route responsible for storing a user in the database. This route can not be used unless the requesting account is an Upper Board or higher.
    * @var /api/user POST
    * @name /api/user POST
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers
    * @example The route expects a body Object in the following format
    * {
    *   type: String ['Admin', 'Upper Board', 'High Board', 'Member'], [required]
    *   email: String, [required]
    *   password: String (6 to 20 charecters), [required]
    *   first_name: String, [required]
    *   last_name: String, [required]
    *   birthdate: String (YYYY-MM-DD), [required]
    *   gender: String ['Male', 'Female'], [required]
    *   IEEE_membership_ID: String [optional]
    * }
    * @example The route responds with an object having the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	error: Validation errors
    * }
    */
    app.post('/api/user', auth, UserController.store);

    /**
    * A PUT route responsible for updating a user's information in the database
    * @var /api/user PUT
    * @name /api/user PUT
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers
    * @example The route expects a body Object in the following format
    * {
    *   type: String ['Admin', 'Upper Board', 'High Board', 'Member'], [required]
    *   email: String, [required]
    *   password: String (6 to 20 charecters), [required]
    *   first_name: String, [required]
    *   last_name: String, [required]
    *   birthdate: String (YYYY-MM-DD), [required]
    *   gender: String ['Male', 'Female'], [required]
    *   IEEE_membership_ID: String [optional]
    * }
    * @example The route responds with an object having the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	error: Validation errors
    * }
    */
    app.put('/api/user', auth, UserController.update);
};
