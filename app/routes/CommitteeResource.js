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
    * A get route responsible for getting all committes in the database
    * @var /api/committee GET
    * @name /api/committee GET
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
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
    * A get route to show a specific committee
    * @var /api/committee/{id} GET
    * @name /api/committee/{id} GET
    * @example The route expects a committee id for the committee to be returned
    * @example The route expects a header.user_agent from one of those user agents ['Web', 'IOS', 'Android']
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
    * A post route responsible for creating a committee
    * @var /api/committee POST
    * @name /api/committee POST
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
    * A put route responsible for updating a committee
    * @var /api/committee/{id} POST
    * @name /api/committee/{id} POST
    * @example The route expects a body Object in the following format
    * {
    *   name: String, [required]
    *   description: String [required]
    * }
    * @example The route returns as a rauth,esponse an object in the following format
    * {
    *   status: succeeded/failed,
    *   message: String showing a descriptive text
    * }
    */
    app.put('/api/committee/:id',auth, CommitteeController.update);
};
