module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('POST /api/meeting', function() {

      before(function(done) {
         this.timeout(10000);
         app = args.app;
         fn = args.fn;
         data = args.data;
         models = args.models;
         chai = args.chai;
         should = chai.should();

         models.Committee.bulkCreate(data.committees).then(function() {
            models.User.bulkCreate(data.users).then(function() {
               models.Identity.bulkCreate(data.identities).then(function() {
                  done();
               });
            });
         });
      });

      /***********************
      * Authentication Tests *
      ************************/
      {
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
                  res.should.have.status(403);
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
      }

      /*******************
      * Validation Tests *
      ********************/
      {
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
                  res.should.have.status(403);
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
      }

      /*******************
      * Acceptance Tests *
      ********************/
      {
         it('Should add the meeting in the database (Admin Authentication)', function(done) {
            fn.clearTable('meetings', function() {
               var meeting = {
                  start_date: "2017-2-25 08:00:00",
                  end_date: "2017-2-25 10:00:00",
                  goals: ["Goal 1", "Goal 2", "Goal 3"],
                  location: "Location",
                  description: "Description",
                  attendees: [2, 3, 4, 5, 6]
               };

               chai.request(app)
               .post('/api/meeting')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(meeting)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Meeting.findById(1).then(function(theMeeting) {
                        theMeeting.getAttendees().then(function(attendees) {
                           attendees.should.have.lengthOf(meeting.attendees.length);

                           var valid = true;
                           for (var i = 0; i <= meeting.attendees.length && valid; i++) {
                              valid = false;
                              for (var j = 0; j < attendees.length && !valid; j++) {
                                 if (attendees[j].id === meeting.attendees[i]) {
                                    valid = true;
                                 }
                              }
                           }

                           if (!valid) {
                              throw new Error("The wrong attendees were assigned to the meeting.");
                           }

                           done();
                        });
                     });
                  } catch(error) {
                     done(error);
                  }

               });
            });
         });

         it('Should add the meeting in the database (Upper Board Authentication)', function(done) {
            fn.clearTable('meetings', function() {
               var meeting = {
                  start_date: "2017-2-25 08:00:00",
                  end_date: "2017-2-25 10:00:00",
                  goals: ["Goal 1", "Goal 2", "Goal 3"],
                  location: "Location",
                  description: "Description",
                  attendees: [3, 4, 5, 6]
               };

               chai.request(app)
               .post('/api/meeting')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[1].token)
               .send(meeting)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Meeting.findById(1).then(function(theMeeting) {
                        theMeeting.getAttendees().then(function(attendees) {
                           attendees.should.have.lengthOf(meeting.attendees.length);

                           var valid = true;
                           for (var i = 0; i <= meeting.attendees.length && valid; i++) {
                              valid = false;
                              for (var j = 0; j < attendees.length && !valid; j++) {
                                 if (attendees[j].id === meeting.attendees[i]) {
                                    valid = true;
                                 }
                              }
                           }

                           if (!valid) {
                              throw new Error("The wrong attendees were assigned to the meeting.");
                           }

                           done();
                        });
                     });
                  } catch(error) {
                     done(error);
                  }
               });
            });

         });

         it('Should add the meeting in the database (High Board Authentication)', function(done) {
            fn.clearTable('meetings', function() {
               var meeting = {
                  start_date: "2017-2-25 08:00:00",
                  end_date: "2017-2-25 10:00:00",
                  goals: ["Goal 1", "Goal 2", "Goal 3"],
                  location: "Location",
                  description: "Description",
                  attendees: [8, 12]
               };

               chai.request(app)
               .post('/api/meeting')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[3].token)
               .send(meeting)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Meeting.findById(1).then(function(theMeeting) {
                        theMeeting.getAttendees().then(function(attendees) {
                           attendees.should.have.lengthOf(meeting.attendees.length);

                           var valid = true;
                           for (var i = 0; i <= meeting.attendees.length && valid; i++) {
                              valid = false;
                              for (var j = 0; j < attendees.length && !valid; j++) {
                                 if (attendees[j].id === meeting.attendees[i]) {
                                    valid = true;
                                 }
                              }
                           }

                           if (!valid) {
                              throw new Error("The wrong attendees were assigned to the meeting.");
                           }

                           done();
                        });
                     });
                  } catch(error) {
                     done(error);
                  }
               });
            });

         });
      }
   });
};
