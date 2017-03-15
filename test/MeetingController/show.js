module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('GET /api/meeting/:id', function() {
      before(function(done) {
         this.timeout(20000);
         app = args.app;
         fn = args.fn;
         data = args.data;
         models = args.models;
         chai = args.chai;
         should = chai.should();

         fn.clearAll(function(err) {
            if (err) {
               done(err);
               return;
            }

            models.Committee.bulkCreate(data.committees).then(function() {
               models.User.bulkCreate(data.users).then(function() {
                  models.Identity.bulkCreate(data.identities).then(function() {
                     models.Meeting.bulkCreate(data.meetings).then(function() {
                        return models.Meeting.findAll();
                     }).then(function(meetings) {

                        for (var i = 0; i < data.meeting_user.length; i++) {
                           meetings[i].addAttendees(data.meeting_user[i], { rating: 4, review: "Good" });
                        }

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
      });

      /***********************
      * Authentication Tests *
      ************************/
      {
         it('Should not allow a visitor to get the meeting.', function(done) {
            chai.request(app)
            .get('/api/meeting/1')
            .set('User_Agent', 'Web')
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.not.have.property('meeting');
                  should.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member who is not part of the attendees to get the meeting.', function(done) {
            chai.request(app)
            .get('/api/meeting/1')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.not.have.property('meeting');
                  should.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to get the meeting if not the supervisor.', function(done) {
            chai.request(app)
            .get('/api/meeting/1')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.not.have.property('meeting');
                  should.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to missing User Agent header.', function(done) {
            chai.request(app)
            .get('/api/meeting/1')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.not.have.property('meeting');
                  should.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to invalid User Agent header.', function(done) {
            chai.request(app)
            .get('/api/meeting/1')
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.not.have.property('meeting');
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
         it('Should not get the meeting due to invalid meeting ID in the URL.', function(done) {
            chai.request(app)
            .get('/api/meeting/a')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  res.body.should.not.have.property('meeting');
                  should.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not get a non-existing meeting.', function(done) {
             var meeting_id = 10;
            chai.request(app)
            .get('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(404);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.not.have.property('meeting');
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
         it('Should get the meeting (Admin Authentication).', function(done) {
            var meeting_id = 2;

            chai.request(app)
            .get('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  res.body.should.have.property('meeting');
                  res.body.meeting.should.have.property('id').and.equal(meeting_id);
                  res.body.meeting.should.have.property('start_date');
                  res.body.meeting.should.have.property('end_date');
                  res.body.meeting.should.have.property('goals');
                  res.body.meeting.goals.should.have.lengthOf(3);
                  var i;
                  for (i = 0; i < res.body.meeting.goals.length; i++) {
                     res.body.meeting.goals[i].should.have.property('name');
                     res.body.meeting.goals[i].should.have.property('isDone').and.equal(false);
                  }
                  res.body.meeting.should.have.property('location').and.equal("Location " + meeting_id);
                  res.body.meeting.should.have.property('description').and.equal("Description " + meeting_id);
                  res.body.meeting.should.have.property('evaluation').and.equal(meeting_id);
                  res.body.meeting.should.have.property('created_at');
                  res.body.meeting.should.have.property('updated_at');
                  res.body.meeting.should.have.property('supervisor').and.eql({ id: meeting_id, first_name: ("First Name " + meeting_id), last_name: ("Last Name " + meeting_id), profile_picture: null });
                  res.body.meeting.should.have.property('attendees');
                  res.body.meeting.attendees.should.have.lengthOf(2);
                  res.body.meeting.attendees.sort(function(a, b) {
                     return a.id - b.id;
                  });

                  for (i = 0; i < res.body.meeting.attendees.length; i++) {
                     var attendee_id = meeting_id + (4 * (i+1));
                     res.body.meeting.attendees[i].should.have.property('id').and.equal(attendee_id);
                     res.body.meeting.attendees[i].should.have.property('first_name').and.equal("First Name " + attendee_id);
                     res.body.meeting.attendees[i].should.have.property('last_name').and.equal("Last Name " + attendee_id);
                     res.body.meeting.attendees[i].should.have.property('rating').and.equal(4);
                     res.body.meeting.attendees[i].should.have.property('review').and.equal("Good");
                  }

                  should.not.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should get the meeting (Upper Board Authentication).', function(done) {
            var meeting_id = 3;

            chai.request(app)
            .get('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  res.body.should.have.property('meeting');
                  res.body.meeting.should.have.property('id').and.equal(meeting_id);
                  res.body.meeting.should.have.property('start_date');
                  res.body.meeting.should.have.property('end_date');
                  res.body.meeting.should.have.property('goals');
                  res.body.meeting.goals.should.have.lengthOf(3);
                  var i;
                  for (i = 0; i < res.body.meeting.goals.length; i++) {
                     res.body.meeting.goals[i].should.have.property('name');
                     res.body.meeting.goals[i].should.have.property('isDone').and.equal(false);
                  }
                  res.body.meeting.should.have.property('location').and.equal("Location " + meeting_id);
                  res.body.meeting.should.have.property('description').and.equal("Description " + meeting_id);
                  res.body.meeting.should.have.property('evaluation').and.equal(meeting_id);
                  res.body.meeting.should.have.property('created_at');
                  res.body.meeting.should.have.property('updated_at');
                  res.body.meeting.should.have.property('supervisor').and.eql({ id: meeting_id, first_name: ("First Name " + meeting_id), last_name: ("Last Name " + meeting_id), profile_picture: null });
                  res.body.meeting.should.have.property('attendees');
                  res.body.meeting.attendees.should.have.lengthOf(2);
                  res.body.meeting.attendees.sort(function(a, b) {
                     return a.id - b.id;
                  });

                  for (i = 0; i < res.body.meeting.attendees.length; i++) {
                     var attendee_id = meeting_id + (4 * (i+1));
                     res.body.meeting.attendees[i].should.have.property('id').and.equal(attendee_id);
                     res.body.meeting.attendees[i].should.have.property('first_name').and.equal("First Name " + attendee_id);
                     res.body.meeting.attendees[i].should.have.property('last_name').and.equal("Last Name " + attendee_id);
                     res.body.meeting.attendees[i].should.have.property('rating').and.equal(4);
                     res.body.meeting.attendees[i].should.have.property('review').and.equal("Good");
                  }

                  should.not.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should get the meeting (Supervisor Authentication).', function(done) {
            var meeting_id = 4;

            chai.request(app)
            .get('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  res.body.should.have.property('meeting');
                  res.body.meeting.should.have.property('id').and.equal(meeting_id);
                  res.body.meeting.should.have.property('start_date');
                  res.body.meeting.should.have.property('end_date');
                  res.body.meeting.should.have.property('goals');
                  res.body.meeting.goals.should.have.lengthOf(3);
                  var i;
                  for (i = 0; i < res.body.meeting.goals.length; i++) {
                     res.body.meeting.goals[i].should.have.property('name');
                     res.body.meeting.goals[i].should.have.property('isDone').and.equal(false);
                  }
                  res.body.meeting.should.have.property('location').and.equal("Location " + meeting_id);
                  res.body.meeting.should.have.property('description').and.equal("Description " + meeting_id);
                  res.body.meeting.should.have.property('evaluation').and.equal(meeting_id);
                  res.body.meeting.should.have.property('created_at');
                  res.body.meeting.should.have.property('updated_at');
                  res.body.meeting.should.have.property('supervisor').and.eql({ id: meeting_id, first_name: ("First Name " + meeting_id), last_name: ("Last Name " + meeting_id), profile_picture: null });
                  res.body.meeting.should.have.property('attendees');
                  res.body.meeting.attendees.should.have.lengthOf(2);
                  res.body.meeting.attendees.sort(function(a, b) {
                     return a.id - b.id;
                  });

                  for (i = 0; i < res.body.meeting.attendees.length; i++) {
                     var attendee_id = meeting_id + (4 * (i+1));
                     res.body.meeting.attendees[i].should.have.property('id').and.equal(attendee_id);
                     res.body.meeting.attendees[i].should.have.property('first_name').and.equal("First Name " + attendee_id);
                     res.body.meeting.attendees[i].should.have.property('last_name').and.equal("Last Name " + attendee_id);
                     res.body.meeting.attendees[i].should.have.property('rating').and.equal(4);
                     res.body.meeting.attendees[i].should.have.property('review').and.equal("Good");
                  }

                  should.not.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should get the meeting (Attendee Authentication).', function(done) {
            var meeting_id = 4;

            chai.request(app)
            .get('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  res.body.should.have.property('meeting');
                  res.body.meeting.should.have.property('id').and.equal(meeting_id);
                  res.body.meeting.should.have.property('start_date');
                  res.body.meeting.should.have.property('end_date');
                  res.body.meeting.should.have.property('goals');
                  res.body.meeting.goals.should.have.lengthOf(3);
                  var i;
                  for (i = 0; i < res.body.meeting.goals.length; i++) {
                     res.body.meeting.goals[i].should.have.property('name');
                     res.body.meeting.goals[i].should.have.property('isDone').and.equal(false);
                  }
                  res.body.meeting.should.have.property('location').and.equal("Location " + meeting_id);
                  res.body.meeting.should.have.property('description').and.equal("Description " + meeting_id);
                  res.body.meeting.should.not.have.property('evaluation');
                  res.body.meeting.should.have.property('created_at');
                  res.body.meeting.should.have.property('updated_at');
                  res.body.meeting.should.have.property('supervisor').and.eql({ id: meeting_id, first_name: ("First Name " + meeting_id), last_name: ("Last Name " + meeting_id), profile_picture: null });
                  res.body.meeting.should.have.property('attendees');
                  res.body.meeting.attendees.should.have.lengthOf(2);
                  res.body.meeting.attendees.sort(function(a, b) {
                     return a.id - b.id;
                  });

                  for (i = 0; i < res.body.meeting.attendees.length; i++) {
                     var attendee_id = meeting_id + (4 * (i+1));
                     res.body.meeting.attendees[i].should.have.property('id').and.equal(attendee_id);
                     res.body.meeting.attendees[i].should.have.property('first_name').and.equal("First Name " + attendee_id);
                     res.body.meeting.attendees[i].should.have.property('last_name').and.equal("Last Name " + attendee_id);
                     res.body.meeting.attendees[i].should.not.have.property('rating');
                     res.body.meeting.attendees[i].should.not.have.property('review');
                  }

                  should.not.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });
      }
   });
};
