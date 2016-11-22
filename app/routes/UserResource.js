/**
* This function configures the user routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var UserController = require('../controllers/UserController');
    var auth           = require('../middlewares/AuthMiddleware');

    /**
    * A get route responsible for getting all users in the database
    * @var /api/user/index GET
    * @name /api/user/index GET
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	users:
    * 	[
    * 	   {
    *          first_name: the logged in user first name;
    *          last_name: the logged in user last name;
    *          email: the logged in user email;
    *          gender: the logged in user gender;
    *          birthdate: the logged in user birthdate;
    *          settings: the logged in user settings;
    * 	   }, {...}, ...
    * 	 ]
    * 	error: Validation errors
    * }
    */
    app.get('/api/user', auth, UserController.index);

    /**
    * A get route to show a specific user
    * @var /api/user GET
    * @name /api/user GET
    * @example The route expects a user id for the user to be returned
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    *    result:
    *    {
    *       The user depends on basic or detailed // to be modified!!
    *    }
    *    error: Validation errors
    * }
    */
    app.get('/api/user/:id', auth, UserController.show);

    /**
    * A post route responsible for storing a user in the database
    * @var /api/user POST
    * @name /api/user POST
    * @example The route expects a body Object in the following format
    * {
    * 	email: String, [required]
    * 	password: String [required]
    * }
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
    * @example The route responds with an object having the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	error: Validation errors
    * }
    */
    app.post('/api/user', UserController.store);

    /**
    * A put route responsible for updating a user's information in the database
    * @var /api/user PUT
    * @name /api/user PUT
    * @example The route expects a body Object in the following format
    * {
    * 	email: String, [required]
    * 	password: String, [required]
    * 	type: String, [required]
    * 	first_name: String, [required]
    * 	last_name: String, [required]
    * 	birthday: Date, [required]
    * 	gender: String, [required]
    * 	IEEE_membership_ID: String [required]
    * }
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
    * @example The route responds with an object having the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	error: Validation errors
    * }
    */
    app.put('/api/user', auth, UserController.update);
};
