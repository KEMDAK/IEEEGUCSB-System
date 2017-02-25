/**
* This function configures the meeting routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var MeetingController = require('../controllers/MeetingController');
    var auth              = require('../middlewares/AuthMiddleware');
    var high              = require('../middlewares/HighBoardMiddleware');

    /**
    * A GET route responsible for getting a specific meeting currently in the database
    * @var /api/meeting/{id} GET
    * @name /api/meeting/{id} GET
    * @example The meeting requesting the route has to be of type 'Member' at least.
    * @example The route expects the access token as 'Authorization' and the meeting agent as 'meeting_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects the id of the desired meeting in the URL in replace of '{id}'
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    *    result:
    *    {
    *       id: the meeting's id,
    *       type: the type of the account ['Admin', 'Upper Board', 'High Board', 'Member'],
    *       first_name: the meeting's first name,
    *       last_name: the meeting's last name,
    *       email: the meeting's email,
    *       gender: the meeting's gender,       [for detailed view only]
    *       phone_number: the meeting's phone number,       [for detailed view only]
    *       birthdate: the meeting's birthdate,        [for detailed view only]
    *       IEEE_membership_ID: the meeting's membership id in IEEE,
    *       settings: the meeting's profile settings        [public settings only for basic view]
    *     }
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
    app.get('/api/meeting/:id', auth, MeetingController.show);

    /**
    * A POST route responsible for storing a given meeting in the database.
    * @var /api/meeting POST
    * @name /api/meeting POST
    * @example The meeting requesting the route has to be of type 'Upper Board' at least.
    * @example The route expects the access token as 'Authorization' and the meeting agent as 'meeting_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    type: String ['Admin', 'Upper Board', 'High Board', 'Member'], [required]
    *    email: String, [required]
    *    password: String (6 to 20 charecters), [required]
    *    first_name: String, [required]
    *    last_name: String, [required]
    *    birthdate: String (YYYY-MM-DD), [required]
    *    phone_number: String, [required]
    *    gender: String ['Male', 'Female'], [required]
    *    IEEE_membership_ID: String [optional]
    * }
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
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
    app.post('/api/meeting', auth, high, MeetingController.store);

    /**
    * A PUT route responsible for updating the information of authenticated meeting
    * @var /api/meeting PUT
    * @name /api/meeting PUT
    * @example The meeting requesting the route has to be of type 'Member' at least.
    * @example the route expects the access token as 'Authorization' and the meeting agent as 'meeting_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    old_password: String, [required]
    *    new_password: String (6 to 20 charecters), [optional]
    *    phone_number: String, [optional]
    *    IEEE_membership_ID: String [optional]
    * }
    * @example The route responds with an object having the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   error:
    *   [
    *     {
    *        param: the field that caused the error,
    *        value: the value that was provided for that field,
    *        type: the type of error that was caused ['required', 'validity', 'unique violation']
    *     }, {...}, ...
    *   ]
    * }
    */
    app.put('/api/meeting/:id', auth, high, MeetingController.update);

    /**
    * A DELETE route responsible for updating the information of authenticated meeting
    * @var /api/meeting DELETE
    * @name /api/meeting DELETE
    * @example The meeting requesting the route has to be of type 'Member' at least.
    * @example the route expects the access token as 'Authorization' and the meeting agent as 'meeting_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    old_password: String, [required]
    *    new_password: String (6 to 20 charecters), [optional]
    *    phone_number: String, [optional]
    *    IEEE_membership_ID: String [optional]
    * }
    * @example The route responds with an object having the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   error:
    *   [
    *     {
    *        param: the field that caused the error,
    *        value: the value that was provided for that field,
    *        type: the type of error that was caused ['required', 'validity', 'unique violation']
    *     }, {...}, ...
    *   ]
    * }
    */
    app.delete('/api/meeting/:id', auth, high, MeetingController.delete);

    /**
    * A POST route responsible for updating the information of authenticated meeting
    * @var /api/meeting POST
    * @name /api/meeting POST
    * @example The meeting requesting the route has to be of type 'Member' at least.
    * @example the route expects the access token as 'Authorization' and the meeting agent as 'meeting_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    old_password: String, [required]
    *    new_password: String (6 to 20 charecters), [optional]
    *    phone_number: String, [optional]
    *    IEEE_membership_ID: String [optional]
    * }
    * @example The route responds with an object having the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
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
    app.post('/api/meeting/:id/rate', auth, high, MeetingController.rate);
};
