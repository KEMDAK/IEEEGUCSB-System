/**
* This function configures the user routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var UserController = require('../controllers/UserController');
    var auth           = require('../middlewares/AuthMiddleware');

    /**
    * A GET route responsible for getting all users currently in the database
    * @var /api/user GET
    * @name /api/user GET
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	users:
    * 	[
    * 	   {
    *        id: the user's id,
    *        first_name: the user's first name,
    *        last_name: the user's last name,
    *        committee: {                       [if found]
    *          id: the users's committee id,
    *          name: the user's committee name
    *        }
    * 	   }, {...}, ...
    * 	 ]
    * 	error: Validation errors
    * }
    */
    app.get('/api/user', auth, UserController.index);

    /**
    * A GET route responsible for getting a specific user currently in the database
    * @var /api/user/{id} GET
    * @name /api/user/{id} GET
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects the id of the desired user in the URL in replace of '{id}'
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    *    result:
    *    {
    *       FIXME The output is based on the basic and detailed profile information.
    *       id: the user id,
    *       type: the type of the account ['Admin', 'Upper Board', 'High Board', 'Member'],
    *       first_name: the logged in user first name,
    *       last_name: the logged in user last name,
    *       email: the logged in user email,
    *       gender: the logged in user gender,
    *       birthdate: the logged in user birthdate,
    *       IEEE_membership_ID: the membership id in IEEE
    *     }
    *     error: Validation errors
    * }
    */
    app.get('/api/user/:id', auth, UserController.show);

    /**
    * A POST route responsible for storing a given user in the database.
    * @var /api/user POST
    * @name /api/user POST
    * @example The route can not be used unless the requesting account is an Upper Board or higher.
    * @example The route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    type: String ['Admin', 'Upper Board', 'High Board', 'Member'], [required]
    *    email: String, [required]
    *    password: String (6 to 20 charecters), [required]
    *    first_name: String, [required]
    *    last_name: String, [required]
    *    birthdate: String (YYYY-MM-DD), [required]
    *    gender: String ['Male', 'Female'], [required]
    *    IEEE_membership_ID: String [optional]
    * }
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	error: Validation errors
    * }
    */
    app.post('/api/user', auth, UserController.store);

    /**
    * A PUT route responsible for updating the information of authenticated user
    * @var /api/user PUT
    * @name /api/user PUT
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    old_password: String, [required]
    *    new_password: String (6 to 20 charecters), [optional]
    *    IEEE_membership_ID: String [optional]
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
