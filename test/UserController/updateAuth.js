module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('PUT /api/user/:id', function() {
      this.timeout(500);

      before(function(done) {
         this.timeout(40000);

         app = args.app;
         fn = args.fn;
         data = JSON.parse(JSON.stringify(args.data));
         models = args.models;
         chai = args.chai;
         should = chai.should();

         fn.clearAll(function(err) {
            if(err)
            done(err);
            else {
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
            }
         });
      });

      /***********************
      * Authentication Tests *
      ************************/
      {
         it('Should not allow a visitor to update a user.', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member to update a user.', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to update a user.', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to missing User Agent header.', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to invalid User Agent header.', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the update of an Admin (Admin Authentication).', function(done) {
            var user_id = 1;
            var user = {
               email: "test@test.com"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the update of an Admin (Upper Board Authentication).', function(done) {
            var user_id = 1;
            var user = {
               email: "test@test.com"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the update of an Upper Board (Upper Board Authentication).', function(done) {
            var user_id = 2;
            var user = {
               email: "test@test.com"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
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
         it('Should not allow update of a user to an Admin I (Admin Authentication).', function(done) {
            var user_id = 2;
            var user = {
               type: "Admin"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow update of a user to an Admin II (Admin Authentication).', function(done) {
            var user_id = 5;
            var user = {
               type: "Admin"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow update of a user to an Admin III (Admin Authentication).', function(done) {
            var user_id = 8;
            var user = {
               type: "Admin"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow update of a user to an Admin I (Upper Board Authentication).', function(done) {
            var user_id = 2;
            var user = {
               type: "Admin"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow update of a user to an Admin II (Upper Board Authentication).', function(done) {
            var user_id = 5;
            var user = {
               type: "Admin"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow update of a user to an Admin III (Upper Board Authentication).', function(done) {
            var user_id = 8;
            var user = {
               type: "Admin"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be updated due to invalid \'type\' parameter in the body (invalid value).', function(done) {
            var user_id = 2;
            var user = {
               type: "Admin"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be updated due to invalid \'type\' parameter in the body (invalid datatype).', function(done) {
            var user_id = 2;
            var user = {
               type: 2
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be updated due to invalid \'email\' parameter in the body (invalid value).', function(done) {
            var user_id = 2;
            var user = {
               email: "invalid mail"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be updated due to invalid \'email\' parameter in the body (invalid datatype).', function(done) {
            var user_id = 2;
            var user = {
               email: 3
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be updated due to invalid \'committee_id\' parameter in the body (invalid value).', function(done) {
            var user_id = 2;
            var user = {
               committee_id: 5
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be updated due to invalid \'committee_id\' parameter in the body (invalid datatype).', function(done) {
            var user_id = 2;
            var user = {
               committee_id: true
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     if(record.updated_at.getTime() !== record.created_at.getTime()){
                        throw new Error("The User has been updated in the database.");
                     }

                     done();
                  }).catch(function(err) {
                     done(err);
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
         it('Should update the user\'s type in the database (Admin Authentication).', function(done) {
            var user_id = 9;
            var user = {
               type: 'High Board'
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.User.findById(user_id).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     theUser.type.should.equal((user.type || data.users[user_id - 1].type));
                     theUser.email.should.equal((user.email || data.users[user_id - 1].email));
                     theUser.committee_id.should.equal((user.committee_id || data.users[user_id - 1].committee_id));

                     data.users[user_id - 1].type = user.type || data.users[user_id - 1].type;
                     data.users[user_id - 1].email = user.email || data.users[user_id - 1].email;
                     data.users[user_id - 1].committee_id = user.committee_id || data.users[user_id - 1].committee_id;

                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
                     theUser.phone_number.should.equal(data.users[user_id - 1].phone_number);
                     theUser.gender.should.equal(data.users[user_id - 1].gender);
                     JSON.parse(theUser.settings).should.eql({
                        public: {
                           background: "The background of the profile"
                        },
                        private: {
                           notifications: {
                              email: {
                                 comment: "boolean sent email on comments",
                                 lastSent: "timestamp",
                                 meetingDay: "boolean sent email on meeting day",
                                 taskDeadline: "boolean sent a reminder email before the task deadline",
                                 taskAssignment: "boolean sent email on task assignment",
                                 meetingAssignment: "boolean sent email on meetings"
                              }
                           }
                        }
                     });
                     should.equal(theUser.reset_token, null);
                     should.equal(theUser.IEEE_membership_ID, null);

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s type in the database (Upper Board Authentication).', function(done) {
            var user_id = 9;
            var user = {
               type: 'Upper Board'
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[2].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.User.findById(user_id).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     theUser.type.should.equal((user.type || data.users[user_id - 1].type));
                     theUser.email.should.equal((user.email || data.users[user_id - 1].email));
                     theUser.committee_id.should.equal((user.committee_id || data.users[user_id - 1].committee_id));

                     data.users[user_id - 1].type = user.type || data.users[user_id - 1].type;
                     data.users[user_id - 1].email = user.email || data.users[user_id - 1].email;
                     data.users[user_id - 1].committee_id = user.committee_id || data.users[user_id - 1].committee_id;

                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
                     theUser.phone_number.should.equal(data.users[user_id - 1].phone_number);
                     theUser.gender.should.equal(data.users[user_id - 1].gender);
                     JSON.parse(theUser.settings).should.eql({
                        public: {
                           background: "The background of the profile"
                        },
                        private: {
                           notifications: {
                              email: {
                                 comment: "boolean sent email on comments",
                                 lastSent: "timestamp",
                                 meetingDay: "boolean sent email on meeting day",
                                 taskDeadline: "boolean sent a reminder email before the task deadline",
                                 taskAssignment: "boolean sent email on task assignment",
                                 meetingAssignment: "boolean sent email on meetings"
                              }
                           }
                        }
                     });
                     should.equal(theUser.reset_token, null);
                     should.equal(theUser.IEEE_membership_ID, null);

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s email in the database (Admin Authentication).', function(done) {
            var user_id = 9;
            var user = {
               email: "test@test.com"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.User.findById(user_id).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     theUser.type.should.equal((user.type || data.users[user_id - 1].type));
                     theUser.email.should.equal((user.email || data.users[user_id - 1].email));
                     theUser.committee_id.should.equal((user.committee_id || data.users[user_id - 1].committee_id));

                     data.users[user_id - 1].type = user.type || data.users[user_id - 1].type;
                     data.users[user_id - 1].email = user.email || data.users[user_id - 1].email;
                     data.users[user_id - 1].committee_id = user.committee_id || data.users[user_id - 1].committee_id;

                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
                     theUser.phone_number.should.equal(data.users[user_id - 1].phone_number);
                     theUser.gender.should.equal(data.users[user_id - 1].gender);
                     JSON.parse(theUser.settings).should.eql({
                        public: {
                           background: "The background of the profile"
                        },
                        private: {
                           notifications: {
                              email: {
                                 comment: "boolean sent email on comments",
                                 lastSent: "timestamp",
                                 meetingDay: "boolean sent email on meeting day",
                                 taskDeadline: "boolean sent a reminder email before the task deadline",
                                 taskAssignment: "boolean sent email on task assignment",
                                 meetingAssignment: "boolean sent email on meetings"
                              }
                           }
                        }
                     });
                     should.equal(theUser.reset_token, null);
                     should.equal(theUser.IEEE_membership_ID, null);

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s email in the database (Upper Board Authentication).', function(done) {
            var user_id = 9;
            var user = {
               email: "test3@test.com"
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[2].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.User.findById(user_id).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     theUser.type.should.equal((user.type || data.users[user_id - 1].type));
                     theUser.email.should.equal((user.email || data.users[user_id - 1].email));
                     theUser.committee_id.should.equal((user.committee_id || data.users[user_id - 1].committee_id));

                     data.users[user_id - 1].type = user.type || data.users[user_id - 1].type;
                     data.users[user_id - 1].email = user.email || data.users[user_id - 1].email;
                     data.users[user_id - 1].committee_id = user.committee_id || data.users[user_id - 1].committee_id;

                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
                     theUser.phone_number.should.equal(data.users[user_id - 1].phone_number);
                     theUser.gender.should.equal(data.users[user_id - 1].gender);
                     JSON.parse(theUser.settings).should.eql({
                        public: {
                           background: "The background of the profile"
                        },
                        private: {
                           notifications: {
                              email: {
                                 comment: "boolean sent email on comments",
                                 lastSent: "timestamp",
                                 meetingDay: "boolean sent email on meeting day",
                                 taskDeadline: "boolean sent a reminder email before the task deadline",
                                 taskAssignment: "boolean sent email on task assignment",
                                 meetingAssignment: "boolean sent email on meetings"
                              }
                           }
                        }
                     });
                     should.equal(theUser.reset_token, null);
                     should.equal(theUser.IEEE_membership_ID, null);

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s committee_id in the database (Admin Authentication).', function(done) {
            var user_id = 10;
            var user = {
               committee_id: 1
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.User.findById(user_id).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     theUser.type.should.equal((user.type || data.users[user_id - 1].type));
                     theUser.email.should.equal((user.email || data.users[user_id - 1].email));
                     theUser.committee_id.should.equal((user.committee_id || data.users[user_id - 1].committee_id));

                     data.users[user_id - 1].type = user.type || data.users[user_id - 1].type;
                     data.users[user_id - 1].email = user.email || data.users[user_id - 1].email;
                     data.users[user_id - 1].committee_id = user.committee_id || data.users[user_id - 1].committee_id;

                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
                     theUser.phone_number.should.equal(data.users[user_id - 1].phone_number);
                     theUser.gender.should.equal(data.users[user_id - 1].gender);
                     JSON.parse(theUser.settings).should.eql({
                        public: {
                           background: "The background of the profile"
                        },
                        private: {
                           notifications: {
                              email: {
                                 comment: "boolean sent email on comments",
                                 lastSent: "timestamp",
                                 meetingDay: "boolean sent email on meeting day",
                                 taskDeadline: "boolean sent a reminder email before the task deadline",
                                 taskAssignment: "boolean sent email on task assignment",
                                 meetingAssignment: "boolean sent email on meetings"
                              }
                           }
                        }
                     });
                     should.equal(theUser.reset_token, null);
                     should.equal(theUser.IEEE_membership_ID, null);

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s committee_id in the database (Upper Board Authentication).', function(done) {
            var user_id = 10;
            var user = {
               committee_id: 2
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[2].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.User.findById(user_id).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     theUser.type.should.equal((user.type || data.users[user_id - 1].type));
                     theUser.email.should.equal((user.email || data.users[user_id - 1].email));
                     theUser.committee_id.should.equal((user.committee_id || data.users[user_id - 1].committee_id));

                     data.users[user_id - 1].type = user.type || data.users[user_id - 1].type;
                     data.users[user_id - 1].email = user.email || data.users[user_id - 1].email;
                     data.users[user_id - 1].committee_id = user.committee_id || data.users[user_id - 1].committee_id;

                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
                     theUser.phone_number.should.equal(data.users[user_id - 1].phone_number);
                     theUser.gender.should.equal(data.users[user_id - 1].gender);
                     JSON.parse(theUser.settings).should.eql({
                        public: {
                           background: "The background of the profile"
                        },
                        private: {
                           notifications: {
                              email: {
                                 comment: "boolean sent email on comments",
                                 lastSent: "timestamp",
                                 meetingDay: "boolean sent email on meeting day",
                                 taskDeadline: "boolean sent a reminder email before the task deadline",
                                 taskAssignment: "boolean sent email on task assignment",
                                 meetingAssignment: "boolean sent email on meetings"
                              }
                           }
                        }
                     });
                     should.equal(theUser.reset_token, null);
                     should.equal(theUser.IEEE_membership_ID, null);

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user in the database (Admin Authentication).', function(done) {
            var user_id = 6;
            var user = {
               type: "Upper Board",
               email: "test1231@test.com",
               committee_id: 1
            };

            chai.request(app)
            .put('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.User.findById(user_id).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     theUser.type.should.equal((user.type || data.users[user_id - 1].type));
                     theUser.email.should.equal((user.email || data.users[user_id - 1].email));
                     theUser.committee_id.should.equal((user.committee_id || data.users[user_id - 1].committee_id));

                     data.users[user_id - 1].type = user.type || data.users[user_id - 1].type;
                     data.users[user_id - 1].email = user.email || data.users[user_id - 1].email;
                     data.users[user_id - 1].committee_id = user.committee_id || data.users[user_id - 1].committee_id;

                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
                     theUser.phone_number.should.equal(data.users[user_id - 1].phone_number);
                     theUser.gender.should.equal(data.users[user_id - 1].gender);
                     JSON.parse(theUser.settings).should.eql({
                        public: {
                           background: "The background of the profile"
                        },
                        private: {
                           notifications: {
                              email: {
                                 comment: "boolean sent email on comments",
                                 lastSent: "timestamp",
                                 meetingDay: "boolean sent email on meeting day",
                                 taskDeadline: "boolean sent a reminder email before the task deadline",
                                 taskAssignment: "boolean sent email on task assignment",
                                 meetingAssignment: "boolean sent email on meetings"
                              }
                           }
                        }
                     });
                     should.equal(theUser.reset_token, null);
                     should.equal(theUser.IEEE_membership_ID, null);

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
   });
};
