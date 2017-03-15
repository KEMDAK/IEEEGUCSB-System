module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('DELETE /api/meeting/:id', function() {
      this.timeout(500);
      
      before(function(done) {
         this.timeout(40000);

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
         it('Should not allow a visitor to delete the meeting.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member to delete the meeting.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the deletion of the meeting by non-supervisor (Admin).', function(done) {
            var meeting_id = 2;
            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the deletion of the meeting by non-supervisor (Upper Board).', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the deletion of the meeting by non-supervisor (High Board).', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to missing User Agent header.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to invalid User Agent header.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
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
         it('Should not delete the meeting due to invalid meeting ID in the URL.', function(done) {
            chai.request(app)
            .delete('/api/meeting/a')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     records.should.have.lengthOf(5);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
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
         it('Should delete the meeting.', function(done) {
            var meeting_id = 5;

            chai.request(app)
            .delete('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[4].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     if (record) {
                        throw new Error("The meeting should be deleted.");
                     }

                     models.Meeting.findAll().then(function(records) {
                        records.should.have.lengthOf(4);
                        done();
                     }).catch(function(error) {
                        done(error);
                     });
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
      }

   });

};
