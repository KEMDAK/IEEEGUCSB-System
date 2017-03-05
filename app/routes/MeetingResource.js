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
    * @example The user requesting the route has to be of type 'Member' at least.
    * @example The route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects the id of the desired meeting in the URL in replace of '{id}'
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    *   meeting:
    *       {
    *           id: the meeting's id,
    *           description: The meeting description,
    *           start_date: the meeting's start date and time,
    *           end_date: the meeting's end date and time,
    *           duration: the meeting's duration in minutes,
    *           location: the meeting's location,
    *           evaluation: the meeting's evaluation,
    *           goals: [
    *               {
    *                   name: The goal itself,
    *                   isDone: Boolean flag indicating the goal's status
    *               }, {}, ...
    *           ],
    *           attendees: [
    *               {
    *                   id: attendee's id,
    *                   first_name: attendee's first name,
    *                   last_name: attendee's last name,
    *                   profile_picture: {
    *                       type: "Image",
    *                       url: the image url
    *                   },
    *                   rating: The attendee's rating in this meeting,
    *                   review: The attendee's review in this meeting
    *               }, {}, ...
    *           ],
    *           supervisor: {
    *               id: attendee's id,
    *               first_name: attendee's first name,
    *               last_name: attendee's last name,
    *               profile_picture: {
    *                   type: "Image",
    *                   url: the image url
    *               }
    *           },
    *           created_at: the meeting's creation date and time,
    *           updaetd_at: the meeting's update date and time
    *       }
    * 	errors: [
    * 	    {
    * 	        param: the field that caused the error,
    * 	        value: the value that was provided for that field,
    * 	        type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	    }, {...}, ...
    * 	]
    * }
    */
    app.get('/api/meeting/:id', auth, MeetingController.show);

    /**
    * A POST route responsible for storing a given meeting in the database.
    * @var /api/meeting POST
    * @name /api/meeting POST
    * @example The user requesting the route has to be of type 'High Board' at least.
    * @example The route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *     start_date: the meeting's start date and time "YYYY-MM-DD HH:MM:SS" [required],
    *     end_date: the meeting's end date and time "YYYY-MM-DD HH:MM:SS" [required],
    *     location: the meeting's location String [optional|null],
    *     goals: The meeting goals Array of Strings [optional|[]],
    *     description: the meeting's description String [optional|null],
    *     attendees: The meeting's attendees Array of integers user ids [optional|[]]
    * }
    * @example The route returns as a response an object in the following format
    * {
    * 	status: succeeded/failed,
    * 	message: String showing a descriptive text,
    * 	error:
    * 	[
    * 	    {
    * 	        param: the field that caused the error,
    * 	        value: the value that was provided for that field,
    * 	        type: the type of error that was caused ['required', 'validity', 'unique violation']
    * 	    }, {...}, ...
    * 	]
    * }
    */
    app.post('/api/meeting', auth, high, MeetingController.store);

    /**
    * A PUT route responsible for updating the given meeting.
    * @var /api/meeting/{id} PUT
    * @name /api/meeting/{id} PUT
    * @example The user requesting the route has to be of type 'High Board' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *     start_date: the meeting's start date and time "YYYY-MM-DD HH:MM:SS" [optional],
    *     end_date: the meeting's end date and time "YYYY-MM-DD HH:MM:SS" [optional],
    *     location: the meeting's location String [optional],
    *     goals: The meeting goals Array of Strings [optional],
    *     description: the meeting's description String [optional],
    *     attendees: The meeting's attendees Array of integers user ids [optional]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   error:
    *   [
    *       {
    *           param: the field that caused the error,
    *           value: the value that was provided for that field,
    *           type: the type of error that was caused ['required', 'validity', 'unique violation']
    *       }, {...}, ...
    *   ]
    * }
    */
    app.put('/api/meeting/:id', auth, high, MeetingController.update);

    /**
    * A DELETE route responsible for deleting the given meeting.
    * @var /api/meeting/{id} DELETE
    * @name /api/meeting/{id} DELETE
    * @example The user requesting the route has to be of type 'High Board' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   error:
    *   [
    *       {
    *           param: the field that caused the error,
    *           value: the value that was provided for that field,
    *           type: the type of error that was caused ['required', 'validity', 'unique violation']
    *       }, {...}, ...
    *   ]
    * }
    */
    app.delete('/api/meeting/:id', auth, high, MeetingController.delete);

    /**
    * A POST route responsible for rating a given meeting.
    * @var /api/meeting/{id}/rate POST
    * @name /api/meeting/{id}/rate POST
    * @example The user requesting the route has to be of type 'High Board' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *     meeting_evaluation: Integer the meeting evaluation [1...5] [required],
    *     goals: Array of Booleans to indicate the status of the goals [required],
    *     ratings: [
    *         {
    *             rating: Integer the attendee's rating [1...5] [required],
    *             review: String the attendee's rating [required if rating less than 4]
    *         }, {}, ...
    *     ]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text,
    *   error:
    *   [
    *       {
    *           param: the field that caused the error,
    *           value: the value that was provided for that field,
    *           type: the type of error that was caused ['required', 'validity', 'unique violation']
    *       }, {...}, ...
    *   ]
    * }
    */
    app.post('/api/meeting/:id/rate', auth, high, MeetingController.rate);
};
