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
               }).catch(function(err) {
                  done(err);
               });
            }).catch(function(err) {
               done(err);
            });
         }).catch(function(err) {
            done(err);
         });
      }).catch(function(err) {
         done(err);
      });
   });

   describe('POST /api/meeting', function(done) {
      it('Should not allow a visitor to add a meeting.', function(done) {
         chai.request(app)
         .post('/api/meeting')
         .end(function(err, res) {
            try {
               res.should.have.status(401);
               res.body.should.have.property('status').and.equal('failed');
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow a Member to add a meeting.', function(done) {
         chai.request(app)
         .post('/api/meeting')
         .set('Authorization', data.identities[7].token)
         .end(function(err, res) {
            try {
               res.should.have.status(401);
               res.body.should.have.property('status').and.equal('failed');
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow a High Board to add a meeting with members not from his/her committee.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('Authorization', data.identities[3].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(401);
               res.body.should.have.property('status').and.equal('failed');
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });
   });
});
