/**
* This function configures the routes of the entire application.
* @param  {express} app An instance of the express app to be configured.
*/

var AuthController = require('../controllers/AuthController');

module.exports = function(app) {

    /* Dummy route to test if the server is working */
    app.get('/demo', function(req, res, next) {
        res.status(200).send("Welcome to the Hood...!!!!");
    });

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

};
