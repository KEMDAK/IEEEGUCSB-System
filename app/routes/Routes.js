/**
* This function configures the routes of the entire application.
* @param  {express} app An instance of the express app to be configured.
* @ignore
*/

var AuthController = require('../controllers/AuthController');
var log            = require('../middlewares/LogMiddleware');
var CommitteeController = require('../controllers/CommitteeController');


module.exports = function(app) {

    /* allowing cross origin requests */
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', "http://localhost:" + process.env.PORT);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, User_Agent, Authorization');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.send(200);
        }

        next();
    });

    /* initializing the log record */
    app.use(log.init);

    /************************
    *                       *
    * Authentication routes *
    *                       *
    ************************/
    require('./AuthResource')(app);

    /**************
    *             *
    * User routes *
    *             *
    ***************/
    require('./UserResource')(app);


    /***************************
    *                          *
    * CommitteeResource routes *
    *                          *
    ****************************/

    require('./CommitteeResource')(app);

    /***************************
    *                          *
    * TaskResource routes *
    *                          *
    ****************************/

    require('./TaskResource')(app);
    /*************************
    *                        *
    * MeetingResource routes *
    *                        *
    **************************/

    require('./MeetingResource')(app);
    /*====================================================================================================================================*/

    /* any other request will be treated as not found (404) */
    app.use(function(req, res, next) {
        if(!res.headersSent){
            res.status(404).json({
                status:'failed',
                message: 'The requested route was not found.'
            });
        }

        next();
    });

    /* saving the log record */
    app.use(log.save);
};
