var CommitteeController = require('../controllers/CommitteeController');

var auth = require('./middlewares/AuthMiddleware');

/**
* This function configures the routes of the entire application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {

    /* Dummy route to test if the server is working */
    app.get('/demo', function(req, res, next) {
        res.status(200).send("Welcome to the Hood...!!!!");
    });

    app.get('/api/committe/index',CommitteeController.index);
    app.get('/api/committe/show/:id',CommitteeController.show);
    app.post('/api/committe/store',auth.committee,CommitteeController.store);
    app.post('/api/committe/update/:id',auth.committee, CommitteeController.update);

};
