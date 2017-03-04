/**
* This function configures the authentication routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var TaskController = require('../controllers/TaskController');
    var auth           = require('../middlewares/AuthMiddleware');
    var high           = require('../middlewares/HighBoardMiddleware');

    /**
    * A GET route to show a specific task
    * @var /api/task/{id} GET
    * @name /api/task/{id} GET
    * @example The route expects a task id for the desired task in the URL in replace of '{id}'
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   task:
    *      {
    *
    *      },
    * 	errors:
    * 	[
    * 	  {
    * 	     param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	  }, {...}, ...
    * 	]
    * }
    */
    app.get('/api/task/:id', auth, TaskController.show);

    /**
    * A DELETE route to delete a specific task
    * @var /api/task/{id} GET
    * @name /api/task/{id} GET
    * @example The route expects a task id for the desired task in the URL in replace of '{id}'
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   errors:
    * 	[
    * 	  {
    * 	     param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	  }, {...}, ...
    * 	]
    * }
    */
    app.delete('/api/task/:id', auth, high, TaskController.delete);

};