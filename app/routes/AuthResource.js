/**
* This function configures the authentication routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var AuthController = require('../controllers/AuthController');
    var auth           = require('../middlewares/AuthMiddleware');
    var reset          = require('../middlewares/ResetMiddleware');

    /**
    * A post route responsible for Logging in an existing user
    * @var /api/login POST
    * @name /api/login POST
    * @example The route expects a body Object in the following format
    * {
    * 	email: String, [required]
    * 	password: String [required]
    * }
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	token: access token as a response to a successfull login,
    * 	user:
    * 	 {
    *       first_name: the logged in user first name;
    *       last_name: the logged in user last name;
    *       email: the logged in user email;
    *       gender: the logged in user gender;
    *       birthdate: the logged in user birthdate;
    *       settings: the logged in user settings;
    * 	 }
    * 	error: Validation errors
    * }
    */
    app.post('/api/login', AuthController.login);

    /**
    * A get route to logOut A user
    * @var /api/logout GET
    * @name /api/logout GET
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers
    * @example The route respond with a json Object having the following format
    * {
    * 	status: succeeded/failed
    * 	message: Descriptive text about the errors
    * }
    */
    app.get('/api/logout', auth, AuthController.logout);

    /**
    * A post request responsible for sending an email to the user containing an link to reset password
    * @var /api/forgotPassword POST
    * @name /api/forgotPassword POST
    * @example The route expects a body Object with the following format
    * {
    * 	email: String [required]
    * }
    * @example The route responds with an object having the following format
    * {
    * 	status: succeeded/failed
    * 	message: Descriptive text about the errors,
    * 	error: Validation errors
    * }
    */
    app.post('/api/forgotPassword', AuthController.forgotPassword);

    /**
    * A post route responsible for updating a user password in the database
    * @var /api/resetPassword POST
    * @name /api/resetPassword POST
    * @example The route expects the reset token in the query string as 'token'
    * @example The route expects a body object with the following format
    * {
    * 	password: String containing the new password [required (length between 6-20 characters)]
    * }
    * @example The route responds with an object having the following format
    * {
    * 	status: succeeded/failed,
    * 	message: Descriptive text about the errors,
    * 	error: Validation errors
    * }
    */
    app.post('/api/resetPassword', reset, AuthController.resetPassword);
};