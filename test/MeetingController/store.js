module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('POST /api/meeting', function() {

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
         });
      });

      beforeEach(function(done) {
         fn.clearTable('meetings', function(err) {
            if (err) {
               done(err);
            }
            else {
               done();
            }
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

                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });

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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
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
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not add the meeting if the requester is in the attendees.', function(done) {
            var meeting = {
               start_date: "2017-2-25 08:00:00",
               end_date: "2017-2-25 10:00:00",
               goals: ["Goal 1", "Goal 2", "Goal 3"],
               location: "Location",
               description: "Description",
               attendees: [1, 2, 3, 4, 5, 6]
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
                  res.body.should.have.property('errors');
                  should.exist(err);
                  models.Meeting.findAll().then(function(records) {
                     if (records.length > 0) {
                        throw new Error("The meeting shouldn\'t be added.");
                     }

                     done();
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
         it('Should add the meeting in the database (Admin Authentication).', function(done) {
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
                     if (!theMeeting) {
                        throw new Error("The meeting wasn\'t added in the database.");
                     }

                     theMeeting.getAttendees().then(function(records) {
                        if (!records) {
                           throw new Error("There were no attendees for the meeting.");
                        }

                        var attendees = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           attendees.push(records[i].id);
                        }

                        attendees.should.have.lengthOf(meeting.attendees.length);
                        attendees.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < attendees.length && valid; i++) {
                           if (attendees[i] != meeting.attendees[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong attendees were assigned to the meeting.");
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

         it('Should add the meeting in the database (Upper Board Authentication).', function(done) {
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
                     if (!theMeeting) {
                        throw new Error("The meeting wasn\'t added in the database.");
                     }

                     theMeeting.getAttendees().then(function(records) {
                        if (!records) {
                           throw new Error("There were no attendees for the meeting.");
                        }

                        var attendees = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           attendees.push(records[i].id);
                        }

                        attendees.should.have.lengthOf(meeting.attendees.length);
                        attendees.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < attendees.length && valid; i++) {
                           if (attendees[i] != meeting.attendees[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong attendees were assigned to the meeting.");
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

         it('Should add the meeting in the database (High Board Authentication).', function(done) {
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
                     if (!theMeeting) {
                        throw new Error("The meeting wasn\'t added in the database.");
                     }

                     theMeeting.getAttendees().then(function(records) {
                        if (!records) {
                           throw new Error("There were no attendees for the meeting.");
                        }

                        var attendees = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           attendees.push(records[i].id);
                        }

                        attendees.should.have.lengthOf(meeting.attendees.length);
                        attendees.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < attendees.length && valid; i++) {
                           if (attendees[i] != meeting.attendees[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong attendees were assigned to the meeting.");
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
   });
};
