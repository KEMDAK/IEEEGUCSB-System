/**
* This function configures the routes of the entire application.
* @param  {express} app An instance of the express app to be configured.
*/

var AuthController = require('../controllers/AuthController');
var log            = require('../middlewares/LogMiddleware');

module.exports = function(app) {

    /* initializing the log record */
    app.use(log.init);

    /************************
    *                       *
    * Authentication routes *
    *                       *
    ************************/
    require('./AuthResource')(app);
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
