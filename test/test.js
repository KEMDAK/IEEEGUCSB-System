var app, sq;

before(function(done) {
   require('../server')(function(MyApp, MySq, err) {
      if (err) {
         console.log('Unable to start Tests.');
         done(err);
      }
      else {
         console.log('Starting Tests...');
         app = MyApp;
         sq = MySq;
         done();
      }
   });
});

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var data = require('./data.js')();

chai.use(chaiHttp);

var User, Meeting, Committee, Identity;

describe('Meeting Controller', function() {
   before(function(done) {
      this.timeout(10000);
      sq.sync({ force: true }).then(function() {

         /* Require models */
         User = require('../app/models/User').User;
         Meeting = require('../app/models/Meeting').Meeting;
         Committee = require('../app/models/Committee').Committee;
         Identity = require('../app/models/Identity').Identity;

         Committee.bulkCreate(data.committees).then(function() {
            User.bulkCreate(data.users).then(function() {
               Identity.bulkCreate(data.identities).then(function() {
                  done();
               });
            });
         });

      }).catch(function(err) {
         done(err);
      });
   });

   it('Should be empty', function(done) {
      User.findAll().then(function(users) {
         try {
            users.should.not.be.empty;
            done();
         } catch(error) {
            done(error);
         }
      });
   });
});
