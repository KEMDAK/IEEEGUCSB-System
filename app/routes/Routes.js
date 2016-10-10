var CommitteeController = require('../controllers/CommitteeController');
var UserController = require('../controllers/UserController');


var auth = require('../middlewares/AuthMiddleware');

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
    * A get route responsible for getting all committees
    * @var /api/committee/index GET
    */
    app.get('/api/committee/index',CommitteeController.index);
    /**
    * A get route responsible for getting a specific committee
    */
    app.get('/api/committee/show/:id',CommitteeController.show);
    /**
    * A post route responsible for creating a committee
    * @var /api/committee/store POST
    * @name /api/committee/store POST
    * @example The route expects a body Object in the following format
    * {
    *   name: String, [required]
    *   description: String [required]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    */
    app.post('/api/committee/store',auth.committee,CommitteeController.store);
    /**
    * A post route responsible for updating a committee
    * @var /api/committee/update/:id POST
    * @name /api/committee/update/:id POST
    * @example The route expects a body Object in the following format
    * {
    *   description: String [required]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    */
    app.post('/api/committee/update/:id',auth.committee, CommitteeController.update);

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
