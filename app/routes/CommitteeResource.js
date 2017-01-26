/**
* This function configures the authentication routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var AuthController      = require('../controllers/AuthController');
    var CommitteeController = require('../controllers/CommitteeController');
    var auth                = require('../middlewares/AuthMiddleware');
    var reset               = require('../middlewares/ResetMiddleware');

    /**
    * A GET route responsible for getting all committes in the database
    * @var /api/committee GET
    * @name /api/committee GET
    * @example the route expects the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   committees:
    *   [
    *      {
    *          id: the committee id,
    *          name: the committee name,
    *          description: the committee description
    *      }, {...}, ...
    *    ],
    *   error: Validation errors
    * }
    */
    app.get('/api/committee', CommitteeController.index);

    /**
    * A GET route to show a specific committee
    * @var /api/committee/{id} GET
    * @name /api/committee/{id} GET
    * @example The route expects a committee id for the committee to be returned
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   committee:
    *      {
    *          id: the committee id,
    *          name: the committee name,
    *          description: the committee description
    *      },
    *    error: Validation errors
    * }
    */
    app.get('/api/committee/:id', auth, CommitteeController.show);
    
    /**
    * A POST route responsible for creating a committee. This route can not be used unless the requesting account is an Upper Board or higher.
    * @var /api/committee POST
    * @name /api/committee POST
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *   name: String, [required]
    *   description: String [required]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text
    * }
    */
    app.post('/api/committee', auth, CommitteeController.store);
    
    /**
    * A PUT route responsible for updating a committee. This route can not be used unless the requesting account is an Upper Board or higher.
    * @var /api/committee/{id} PUT
    * @name /api/committee/{id} PUT
    * @example The route expects a committee id for the committee to be updated
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *   name: String, [required]
    *   description: String [required]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text
    * }
    */
    app.put('/api/committee/:id', auth, CommitteeController.update);
};
