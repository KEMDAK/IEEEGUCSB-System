/**
* This function configures the routes of the entire application.
* @param  {express} app An instance of the express app to be configured.
*/
module.exports = function(app) {

    /* Dummy route to test if the server is working */
    app.get('/demo', function(req, res, next) {
        res.status(200).send("Welcome to the Hood...!!!!");
    });

};
