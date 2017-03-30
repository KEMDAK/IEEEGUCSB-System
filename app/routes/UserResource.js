/**
* This function configures the user routes of the application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {
    var UserController = require('../controllers/UserController');
    var auth           = require('../middlewares/AuthMiddleware');
    var upper          = require('../middlewares/UpperBoardMiddleware');
    var upload         = require('../middlewares/UploadMiddleware');

    /**
    * A GET route responsible for getting all users currently in the database
    * @var /api/user GET
    * @name /api/user GET
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  users:
    *  [
    *     {
    *        id: the user's id,
    *        first_name: the user's first name,
    *        last_name: the user's last name,
    *        committee: {                       [if found]
    *          id: the users's committee id,
    *          name: the user's committee name
    *        },
    *        profile_picture:{                            [if found]
    *          url:the user's profile pic url
    *          type:the media type 
    *        }
    *     }, {...}, ...
    *  ]
    *  error:
    *  [
    *    {
    *       param: the field that caused the error,
    *       value: the value that was provided for that field,
    *       type: the type of error that was caused ['required', 'validity', 'unique violation']
    *    }, {...}, ...
    *  ]
    * }
    */
    app.get('/api/user', UserController.index);

    /**
    * A GET route responsible for getting a specific user currently in the database
    * @var /api/user/{id} GET
    * @name /api/user/{id} GET
    * @example The user requesting the route has to be of type 'Member' at least.
    * @example The route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects the id of the desired user in the URL in replace of '{id}'
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *    result:
    *    {
    *       id: the user's id,
    *       type: the type of the account ['Admin', 'Upper Board', 'High Board', 'Member'],
    *       first_name: the user's first name,
    *       last_name: the user's last name,
    *       email: the user's email,
    *       gender: the user's gender,       [for detailed view only]
    *       phone_number: the user's phone number,       [for detailed view only]
    *       birthdate: the user's birthdate,        [for detailed view only]
    *       IEEE_membership_ID: the user's membership id in IEEE,       
    *       settings: {  the user's profile settings  
    *             public: {                                         [public settings only for basic view]
    *               background: "The background of the profile"
    *             },
    *             private: {                                         [private settings only for mine view]
    *                    notifications: {
    *                    email: {
    *                    comment: "boolean sent email on comments",
    *                    lastSent: "timestamp",
    *                    meetingDay: "boolean sent email on meeting day",
    *                    taskDeadline: "boolean sent a reminder email before the task deadline",
    *                    taskAssignment: "boolean sent email on task assignment",
    *                    meetingAssignment: "boolean sent email on meetings"
    *                  }
    *                }
    *              }
    *            },
    *       profilePicture:{                           
    *          url:the user's profile pic url
    *          type:the media type 
    *        },
    *        committee: {                       [if found]
    *          id: the users's committee id,
    *          name: the user's committee name
    *        },
    *        honors: [{
    *           id: the honor's id,
    *           name: the honor title
    *            }, {...}, ...
    *          ],
    *        tasks: [{                     [for detailed view only]
    *            id: the task's id,
    *            title: the task's title,
    *            deadline: the task's deadline,
    *            priority: the task's priority,
    *            status:  the task's status ,
    *            evaluation:  the task's evaluation,
    *            created_at:  the task's creation time,
    *            updated_at:  the task's updated time,
    *            supervisor:   the task's supervisor
    *            }, {...}, ...
    *          ],
    *         meetings: [{               [for detailed view only]
    *            id: the meeting's id,
    *            duration: the meeting's duration,
    *            start_date: the meeting's start date,
    *            end_date: the meeting's end date,
    *            goals:  the meeting's gools ,
    *            location :the meeting's location
    *            evaluation:  the meeting's evaluation,
    *            created_at:  the meeting's creation time,
    *            updated_at:  the meeting's updated time,
    *            supervisor:   the meeting's supervisor
    *            }, {...}, ...
    *          ],
    *     }
    *  error:
    *  [
    *    {
    *       param: the field that caused the error,
    *       value: the value that was provided for that field,
    *       type: the type of error that was caused ['required', 'validity', 'unique violation']
    *    }, {...}, ...
    *  ]
    * }
    */
    app.get('/api/user/:id', auth, UserController.show);

    /**
    * A POST route responsible for storing a given user in the database.
    * @var /api/user POST
    * @name /api/user POST
    * @example The user requesting the route has to be of type 'Upper Board' at least.
    * @example The route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    type: String ['Upper Board', 'High Board', 'Member'], [required]
    *    email: String, [required]
    *    first_name: String, [required]
    *    last_name: String, [required]
    *    birthdate: String (YYYY-MM-DD), [required]
    *    phone_number: String, [required]
    *    gender: String ['Male', 'Female'], [required]
    *    IEEE_membership_ID: String [optional]
    * }
    * @example The route returns as a response an object in the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  error:
    *  [
    *    {
    *       param: the field that caused the error,
    *       value: the value that was provided for that field,
    *       type: the type of error that was caused ['required', 'validity', 'unique violation']
    *    }, {...}, ...
    *  ]
    * }
    */
    app.post('/api/user', auth, upper, UserController.store);

    /**
    * A PUT route responsible for updating the information of authenticated user
    * @var /api/user PUT
    * @name /api/user PUT
    * @example The user requesting the route has to be of type 'Member' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    old_password: String, [required]
    *    new_password: String (6 to 20 charecters), [optional]
    *    phone_number: String, [optional]
    *    IEEE_membership_ID: String [optional]
    * }
    * @example The route responds with an object having the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  error:
    *  [
    *    {
    *       param: the field that caused the error,
    *       value: the value that was provided for that field,
    *       type: the type of error that was caused ['required', 'validity', 'unique violation']
    *    }, {...}, ...
    *  ]
    * }
    */
    app.put('/api/user', auth,upload.Image, upload.validate,UserController.update);
     /**
    * A DELETE route responsible for deleting user from the database and deleting his folder
    * @var /api/user/{id} DELETE
    * @name /api/user/{id} DELETE
    * @example The user requesting the route has to be of type 'Upper Board' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects the id of the desired user in the URL in replace of '{id}'
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
    app.delete('/api/user/:id', auth,upper,UserController.delete);
        /**
    * A PUT route responsible for updating the information of a specified authenticated user
    * @var /api/user/{id} PUT
    * @name /api/user/{id} PUT
    * @example The user requesting the route has to be of type 'Upper Board' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a body Object in the following format
    * {
    *    committee_id: String ,[optional]
    *    type: String ['Upper Board', 'High Board', 'Member'], [optional]
    *    email: String, [optional]
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
    app.put('/api/user/:id', auth,upper,UserController.updateAuth);
        /**
    * A PUT route responsible for updating the information of authenticated user
    * @var /api/user PUT
    * @name /api/user PUT
    * @example The user requesting the route has to be of type 'Member' at least.
    * @example the route expects the access token as 'Authorization' and the user agent as 'user_agent' in the request headers with one of the following values ['Web', 'IOS', 'Android']
    * @example The route expects a file in the following format
    * {
    *    enctype    ="multipart/form-data"
    *    field name ='picture'
    * }
    * @example The route responds with an object having the following format
    * {
    *  status: succeeded/failed,
    *  message: String showing a descriptive text,
    *  error:
    *  [
    *    {
    *       param: the field that caused the error,
    *       value: the value that was provided for that field,
    *       type: the type of error that was caused ['required', 'validity', 'unique violation']
    *    }, {...}, ...
    *  ]
    * }
    */
    app.post('/api/user/upload', auth,upload.Image, upload.validate,UserController.upload);

};
