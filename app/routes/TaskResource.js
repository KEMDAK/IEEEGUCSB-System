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
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   task:
    *      {
    *         id: task identifier,
    *         title: task title,
    *         description: task description,
    *         deadline: task deadline date and time*,
    *         priority: task priority,
    *         status: task status,
    *         evaluation: task evaluation,
    *         created_at: task creation date and time,
    *         updated_at: task update date and time,
    *         supervisor: task supervisor,
    *         assigned_to: task assignees
    *         [ {
    *              id: user identifier,
    *              first_name: user first name,
    *              last_name: user last name,
    *              profile_picture: user profile picture { type: "Image", url: picture url } }
    *           }, ... ],
    *         comments: task comments [
    *                 { id: comment identifier,
    *                   content: comment content,
    *                   created_at: comment creation date and time,
    *                   updated_at: comment upadte date and time,
    *                   user:
    *                   {
    *                     id: user identifier,
    *                     first_name: user first name,
    *                     last_name: user last name,
    *                     profile_picture: user profile picture { type: "Image", url: picture url }
    *                   }
    *                 } , ... ]
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
    * A POST route responsible for creating a task.
    * @var /api/task POST
    * @name /api/task POST
    * @example The user requesting the route has to be of type 'High Board' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *     title: the task's title (String) [required],
    *     description: the task's description (String) [optional|null],
    *     deadline: the task's end date and time ("YYYY-MM-DD HH:MM:SS")[required],
    *     priority: the task's priority (Integer, one of these: 1, 3, 5, 8) [required],
    *     evaluation: task's evaluation [optional|null],
    *     assigned_to: The task's assignees (Array of Integers: user ids) [optional|[]]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   errors:
    *   [
    *     {
    *         param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	 }, {...}, ...
    *   ]
    * }
    */
    app.post('/api/task', auth, high, TaskController.store);

    /**
    * A PUT route responsible for updating a task.
    * @var /api/task/{id} PUT
    * @name /api/task/{id} PUT
    * @example The user requesting the route has to be of type 'High Board' at least.
    * @example The route expects a task id for the desired task in the URL in replace of '{id}'
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *     title: the task's title (String) [optional],
    *     description: the task's description (String) [optional],
    *     deadline: the task's end date and time ("YYYY-MM-DD HH:MM:SS") [optional],
    *     priority: the task's priority (Integer, one of these: 1, 3, 5, 8) [optional],
    *     status: the task's status (String, one of these: "New", "Done", "In Progress", "Ready") [optional],
    *     evaluation: task's evaluation (Integer)[optional],
    *     assigned_to: The task's assignees (Array of Integers: user ids) [optional]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   errors:
    *   [
    *     {
    *         param: the field that caused the error,
    * 	     value: the value that was provided for that field,
    * 	     type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	 }, {...}, ...
    *   ]
    * }
    */
    app.put('/api/task/:id', auth, high, TaskController.update);

    /**
    * A DELETE route to delete a specific task
    * @var /api/task/{id} GET
    * @name /api/task/{id} GET
    * @example The route expects a task id for the desired task in the URL in replace of '{id}'
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
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
