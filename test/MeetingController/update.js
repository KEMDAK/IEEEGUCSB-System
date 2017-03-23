module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('PUT /api/meeting/:id', function() {
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
         it('Should not allow a visitor to update a meeting.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .send({ location: 'No Location' })
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);

                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow a Member to update a meeting.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .send({ location: 'No Location' })
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);

                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the updating of the meeting non-supervisor (Admin).', function(done) {
            var meeting_id = 2;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ location: 'No Location' })
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);

                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the updating of the meeting non-supervisor (Upper Board).', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .send({ location: 'No Location' })
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);

                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the updating of the meeting non-supervisor (High Board).', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send({ location: 'No Location' })
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);

                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should deny access due to missing User Agent header.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('Authorization', data.identities[0].token)
            .send({ location: 'No Location' })
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should deny access due to invalid User Agent header.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .send({ location: 'No Location' })
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

      /*******************
      * Validation Tests *
      ********************/
      {
         it('Should not update the meeting due to invalid meeting ID in the URL.', function(done) {
            chai.request(app)
            .put('/api/meeting/a')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ location: 'No Location' })
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

         it('Should not allow a High Board to update the meeting attendees from outside his/her committee.', function(done) {
            var meeting_id = 4;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send({ attendees: [9, 10] })
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the meeting to be updated due to invalid \'start_date\' parameter in the body.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ start_date: 'Invalid' })
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the meeting to be updated due to invalid \'end_date\' parameter in the body.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ end_date: 'Invalid' })
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the meeting to be updated due to invalid \'goals\' parameter in the body. (Invalid Type)', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ goals: 'Invalid' })
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the meeting to be updated due to invalid \'goals\' parameter in the body. (Element invalid type)', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ goals: [1, 2, 3] })
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not allow the meeting to be updated due to invalid \'location\' parameter in the body.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ location: 1 })
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not update the meeting if the requester is in the attendees.', function(done) {
            var meeting_id = 1;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ attendees: [1, 2, 3, 4] })
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');
                  should.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Location " + meeting_id);
                     record.should.have.property('description').and.equal("Description " + meeting_id);
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(2);
                        attendees.sort(function(a, b) {
                           return a.id - b.id;
                        });

                        for (i = 0; i < attendees.length; i++) {
                           var attendee_id = meeting_id + (4 * (i+1));
                           attendees[i].should.have.property('id').and.equal(attendee_id);
                        }

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

         it('Should not update a non-existing meeting.', function(done) {
            var meeting_id = 10;
            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send({ location: "Updated Location" })
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
         it('Should update the meeting (Admin Authentication).', function(done) {
            var meeting_id = 1;
            var updatedMeeting = {
               location: "Updated Location",
               description: "Updated Description",
               attendees: [2]
            };

            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(updatedMeeting)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Updated Location");
                     record.should.have.property('description').and.equal("Updated Description");
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(1);
                        attendees[0].should.have.property('id').and.equal(2);
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

         it('Should update the meeting (Upper Board Authentication).', function(done) {
            var meeting_id = 2;
            var updatedMeeting = {
               location: "Updated Location",
               description: "Updated Description",
               attendees: [3]
            };

            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .send(updatedMeeting)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Updated Location");
                     record.should.have.property('description').and.equal("Updated Description");
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(1);
                        attendees[0].should.have.property('id').and.equal(3);
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

         it('Should update the meeting (High Board Authentication).', function(done) {
            var meeting_id = 4;
            var updatedMeeting = {
               location: "Updated Location",
               description: "Updated Description",
               attendees: [8]
            };

            chai.request(app)
            .put('/api/meeting/' + meeting_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(updatedMeeting)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);
                  models.Meeting.findById(meeting_id).then(function(record) {
                     record.should.have.property('id').and.equal(meeting_id);
                     record.should.have.property('start_date');
                     record.should.have.property('end_date');
                     record.should.have.property('goals');
                     record.goals = JSON.parse(record.goals);
                     record.goals.should.have.lengthOf(3);
                     var i;
                     for (i = 0; i < record.goals.length; i++) {
                        record.goals[i].should.have.property('name');
                        record.goals[i].should.have.property('isDone').and.equal(false);
                     }
                     record.should.have.property('location').and.equal("Updated Location");
                     record.should.have.property('description').and.equal("Updated Description");
                     record.should.have.property('evaluation').and.equal(meeting_id);
                     record.should.have.property('supervisor').and.equal(meeting_id);
                     record.getAttendees().then(function(attendees) {
                        attendees.should.have.lengthOf(1);
                        attendees[0].should.have.property('id').and.equal(8);
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
