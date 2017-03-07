module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('POST /api/meeting/:id/rate', function() {
       before(function(done) {
          this.timeout(10000);
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
                            meetings[i].addAttendees(data.meeting_user[i]);
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
           it('Should not allow a visitor to make a rating.', function(done) {
              var meeting_id = 1;
              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
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

           it('Should not allow a Member to make a rating.', function(done) {
              var meeting_id = 1;
              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
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

           it('Should not allow a non-supervisor to make a rating (Admin).', function(done) {
              var meeting_id = 2;
              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
              .set('User_Agent', 'Web')
              .set('Authorization', data.identities[0].token)
              .end(function(err, res) {
                 try {
                    res.should.have.status(403);
                    res.body.should.have.property('status').and.equal('failed');
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);
                        var i;
                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow a non-supervisor to make a rating (Upper Board).', function(done) {
              var meeting_id = 1;
              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
              .set('User_Agent', 'Web')
              .set('Authorization', data.identities[1].token)
              .end(function(err, res) {
                 try {
                    res.should.have.status(403);
                    res.body.should.have.property('status').and.equal('failed');
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);
                        var i;
                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow a non-supervisor to make a rating (High Board).', function(done) {
              var meeting_id = 1;
              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
              .set('User_Agent', 'Web')
              .set('Authorization', data.identities[3].token)
              .end(function(err, res) {
                 try {
                    res.should.have.status(403);
                    res.body.should.have.property('status').and.equal('failed');
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);
                        var i;
                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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
           it('Should not allow the rating to be added due to missing \'evaluation\' parameter in the body.', function(done) {
              var meeting_id = 1;
              var obj = {
                  goals: [true, true, true],
                  attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
              };

              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
              .set('User_Agent', 'Web')
              .set('Authorization', data.identities[0].token)
              .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the rating to be added due to invalid \'evaluation\' parameter in the body. (Invalid type)', function(done) {
              var meeting_id = 1;
              var obj = {
                  evaluation: "invalid",
                  goals: [true, true, true],
                  attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
              };

              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
              .set('User_Agent', 'Web')
              .set('Authorization', data.identities[0].token)
              .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the rating to be added due to invalid \'evaluation\' parameter in the body. (Out of range)', function(done) {
              var meeting_id = 1;
              var obj = {
                  evaluation: 10,
                  goals: [true, true, true],
                  attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
              };

              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
              .set('User_Agent', 'Web')
              .set('Authorization', data.identities[0].token)
              .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the rating to be added due to missing \'goals\' parameter in the body.', function(done) {
              var meeting_id = 1;
              var obj = {
                  evaluation: 5,
                  attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
              };

              chai.request(app)
              .post('/api/meeting/' + meeting_id + '/rate')
              .set('User_Agent', 'Web')
              .set('Authorization', data.identities[0].token)
              .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the rating to be added due to invalid \'goals\' parameter in the body. (Invalid type)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: "Invalid",
                   attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the meeting to be updated due to invalid \'goals\' parameter in the body. (Elements invalid type)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: ["This", "is", "invalid"],
                   attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the meeting to be updated due to invalid \'goals\' parameter in the body. (Wrong number of elements)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true],
                   attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the meeting to be updated due to invalid \'attendees\' parameter in the body. (Invalid type)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: 1
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the meeting to be updated due to invalid \'attendees\' parameter in the body. (Elements invalid type)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: ["Invalid", "Type"]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the meeting to be updated due to invalid \'attendees\' parameter in the body. (Wrong number of elements)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ rating: 5, review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the meeting to be updated due to invalid \'attendees\' parameter in the body. (Missing rating attribute)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ review: "Good" }, { review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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

           it('Should not allow the meeting to be updated due to invalid \'attendees\' parameter in the body. (Missing review when rating is < 4)', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ rating: 1 }, { rating: 1 }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(400);
                    res.body.should.have.property('status').and.equal('failed');
                    res.body.should.have.property('errors');  // TODO: Test the errors themselves
                    should.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(meeting_id);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(false);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(null);
                              attendees[i].meeting_user.should.have.property('review').and.equal(null);
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
       * Acceptance Tests *
       ********************/
       {
           it('Should add rating to the meeting (Admin Authentication).', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(200);
                    res.body.should.have.property('status').and.equal('succeeded');
                    res.body.should.not.have.property('errors');
                    should.not.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(5);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(true);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(5);
                              attendees[i].meeting_user.should.have.property('review').and.equal("Good");
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

           it('Should add rating to the meeting (Upper Board Authentication).', function(done) {
               var meeting_id = 2;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[1].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(200);
                    res.body.should.have.property('status').and.equal('succeeded');
                    res.body.should.not.have.property('errors');
                    should.not.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(5);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(true);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(5);
                              attendees[i].meeting_user.should.have.property('review').and.equal("Good");
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

           it('Should add rating to the meeting (High Board Authentication).', function(done) {
               var meeting_id = 4;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ rating: 5, review: "Good" }, { rating: 5, review: "Good" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[3].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(200);
                    res.body.should.have.property('status').and.equal('succeeded');
                    res.body.should.not.have.property('errors');
                    should.not.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(5);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(true);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(5);
                              attendees[i].meeting_user.should.have.property('review').and.equal("Good");
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

           it('Should add rating to the meeting if rating is >= 4 and review is missing.', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ rating: 5 }, { rating: 5 }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(200);
                    res.body.should.have.property('status').and.equal('succeeded');
                    res.body.should.not.have.property('errors');
                    should.not.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(5);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(true);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(5);
                              attendees[i].meeting_user.should.have.property('review').and.equal("Good");
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

           it('Should add rating to the meeting if rating is < 4 and review is not missing.', function(done) {
               var meeting_id = 1;
               var obj = {
                   evaluation: 5,
                   goals: [true, true, true],
                   attendees: [{ rating: 1, review: "Bad" }, { rating: 1, review: "Bad" }]
               };

               chai.request(app)
               .post('/api/meeting/' + meeting_id + '/rate')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(obj)
              .end(function(err, res) {
                 try {
                    res.should.have.status(200);
                    res.body.should.have.property('status').and.equal('succeeded');
                    res.body.should.not.have.property('errors');
                    should.not.exist(err);
                    models.Meeting.findById(meeting_id).then(function(record) {
                        record.should.have.property('evaluation').and.equal(5);
                        record.should.have.property('goals');
                        record.goals = JSON.parse(record.goals);
                        record.goals.should.have.lengthOf(3);

                        for (i = 0; i < record.goals.length; i++) {
                           record.goals[i].should.have.property('name');
                           record.goals[i].should.have.property('isDone').and.equal(true);
                        }

                        record.getAttendees().then(function(attendees) {
                           for (i = 0; i < attendees.length; i++) {
                              attendees[i].meeting_user.should.have.property('rating').and.equal(5);
                              attendees[i].meeting_user.should.have.property('review').and.equal("Good");
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
