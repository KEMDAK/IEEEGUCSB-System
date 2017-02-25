var app;

before(function(done) {
   require('../server')(function(MyApp, err) {
      if (err) {
         console.log('Unable to start Tests...');
         done(err);
      }
      else {
         console.log('Starting Tests...');
         app = MyApp;
         done();
      }
   });
});

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var data = require('../config/data/Test.json');

chai.use(chaiHttp);

describe('Task Controller', function() {
   // beforeEach(function(done) {
   //    var Task = require('../app/models/Task').Task;
   //    User.destroy({ where : {} }).then(function(affected) {
   //       console.log(affected);
   //       // User.bulkCreate(data.users).then(function() {
   //          done();
   //       // });
   //    });
   // });

   describe('GET /api/task/:id', function() {
      it('Should not allow the route to be accessed', function(done) {
            var User = require('../app/models/User').User;
         User.findAll().then(function(users) {
            console.log(users);
            try
            {
               res.should.have.status(200);
               res.body.should.have.property('users');
               res.body.users.should.be.empty;
               done();
            }
            catch(error)
            {
               done(error);
            }
         });
         // chai.reque33
      });
   });
});
