/**
* This function configures the authentication routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var CommitteeController = require('../controllers/CommitteeController');
    var auth                = require('../middlewares/AuthMiddleware');
    var upper               = require('../middlewares/UpperBoardMiddleware');

    /**
    * A GET route responsible for getting all committes in the database
    * @var /api/committee GET
    * @name /api/committee GET
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
    * 	error:
    * 	[
    * 	  {
    * 	     param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	  }, {...}, ...
    * 	]
    * }
    */
    app.get('/api/committee', CommitteeController.index);

    /**
    * A GET route to show a specific committee
    * @var /api/committee/{id} GET
    * @name /api/committee/{id} GET
    * @example The route expects a committee id for the desired committee in the URL in replace of '{id}'
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
    * 	error:
    * 	[
    * 	  {
    * 	     param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	  }, {...}, ...
    * 	]
    * }
    */
    app.get('/api/committee/:id', CommitteeController.show);

    /**
    * A POST route responsible for creating a committee.
    * @var /api/committee POST
    * @name /api/committee POST
    * @example The user requesting the route has to be of type 'Upper Board' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *   name: String, [required]
    *   description: String [required]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   error:
    *   [
    *     {
    *         param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	 }, {...}, ...
    *   ]
    * }
    */
    app.post('/api/committee', auth, upper, CommitteeController.store);

    /**
    * A PUT route responsible for updating a committee.
    * @var /api/committee/{id} PUT
    * @name /api/committee/{id} PUT
    * @example The user requesting the route has to be of type 'Upper Board' at least.
    * @example The route expects a committee id for the desired committee in the URL in replace of '{id}'
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *   name: String, [optional]
    *   description: String [optional]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   error:
    *   [
    *     {
    *         param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	 }, {...}, ...
    *   ]
    * }
    */
    app.put('/api/committee/:id', auth, upper, CommitteeController.update);
};
