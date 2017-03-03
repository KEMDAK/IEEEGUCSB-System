module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('GET /api/meeting/:id', function() {
      before(function(done) {
         this.timeout(10000);
         app = args.app;
         fn = args.fn;
         data = args.data;
         models = args.models;
         chai = args.chai;
         should = chai.should();


      });

      /***********************
      * Authentication Tests *
      ************************/
      {
         
      }

      /*******************
      * Validation Tests *
      ********************/
      {

      }

      /*******************
      * Acceptance Tests *
      ********************/
      {

      }

      /**************
      * Other Tests *
      ***************/
      {

      }
   });
};
