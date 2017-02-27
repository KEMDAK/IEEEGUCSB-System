var app, sq, data;

before(function(done) {
   process.env.ENV = 'test';
   require('../server')(function(MyApp, MySq, err) {
      if (err) {
         console.log('Unable to start Tests.');
         done(err);
      }
      else {
         console.log('Starting Tests...');
         app = MyApp;
         sq = MySq;
         data = require('./data.js')();
         done();
      }
   });
});

var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);

var User, Meeting, Committee, Identity;

describe('Meeting Controller', function() {
   before(function(done) {
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
      /************************
      * Authentication Tests *
      ************************/
      it('Should not allow a visitor to add a meeting.', function(done) {
         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
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
         .set('User_Agent', 'Web')
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

      it('Should deny access due to missing User Agent header.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: [2, 3, 4]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('Authorization', data.identities[0].token)
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

      it('Should deny access due to invalid User Agent header.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: [2, 3, 4]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Windows Phone')
         .set('Authorization', data.identities[0].token)
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

      /********************
      * Validation Tests *
      ********************/
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
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[3].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to missing \'start_date\' parameter in the body.', function(done) {
         var meeting = {
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to invalid \'start_date\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "This is an invalid start_date",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to missing \'end_date\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to invalid \'end_date\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "This is an invalid end_date",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to missing \'goals\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            location: "Location",
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to invalid \'goals\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: "Goal 1",
            location: "Location",
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to missing \'location\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to invalid \'location\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: 1,
            description: "Description",
            attendees: [9, 13]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to missing \'attendees\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });

      it('Should not allow the meeting to be added due to invalid \'attendees\' parameter in the body.', function(done) {
         var meeting = {
            start_date: "2017-2-25 08:00:00",
            end_date: "2017-2-25 10:00:00",
            goals: ["Goal 1", "Goal 2", "Goal 3"],
            location: "Location",
            description: "Description",
            attendees: ["This", "is", "invalid"]
         };

         chai.request(app)
         .post('/api/meeting')
         .set('User_Agent', 'Web')
         .set('Authorization', data.identities[0].token)
         .send(meeting)
         .end(function(err, res) {
            try {
               res.should.have.status(400);
               res.body.should.have.property('status').and.equal('failed');
               res.body.should.have.property('errors');  // TODO: Test the errors themselves
               should.exist(err);
               done();
            } catch(error) {
               done(error);
            }
         });
      });
   });
});
