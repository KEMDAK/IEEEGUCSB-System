module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('PUT /api/user', function() {
      this.timeout(1000);

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
         it('Should deny access due to missing User Agent header.', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user')
            .set('Authorization', data.identities[user_id - 1].token)
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
            .put('/api/user')
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[user_id - 1].token)
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

         it('Should not allow the user to be updated due to wrong \'old_password\' parameter in the body.', function(done) {
            var user_id = 1;

            var user = {
               old_password: "12345"
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
            .send(user)
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
         it('Should not allow the user to be updated due to missing \'old_password\' parameter in the body.', function(done) {
            var user_id = 1;

            var user = {
               phone_number: "01122046466"
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

         it('Should not allow the user to be updated due to invalid \'phone_number\' parameter in the body (invalid value).', function(done) {
            var user_id = 1;

            var user = {
               old_password: "1234567",
               phone_number: "invalid phone"
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

         it('Should not allow the user to be updated due to invalid \'phone_number\' parameter in the body (invalid datatype).', function(done) {
            var user_id = 1;
            var user = {
               old_password: "1234567",
               phone_number: 45
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

         it('Should not allow the user to be updated due to invalid \'IEEE_membership_ID\' parameter in the body (invalid datatype).', function(done) {
            var user_id = 1;
            var user = {
               old_password: "1234567",
               IEEE_membership_ID: true
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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
         it('Should update the user\'s password in the database.', function(done) {
            var user_id = 5;
            var user = {
               old_password: "1234567",
               new_password: "123456"
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

                     theUser.phone_number.should.equal((user.phone_number || data.users[user_id - 1].phone_number));
                     if(theUser.IEEE_membership_ID){
                        theUser.IEEE_membership_ID.should.equal((user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID));
                     }

                     data.users[user_id - 1].phone_number = user.phone_number || data.users[user_id - 1].phone_number;
                     data.users[user_id - 1].IEEE_membership_ID = user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID;

                     theUser.type.should.equal(data.users[user_id - 1].type);
                     theUser.email.should.equal(data.users[user_id - 1].email);
                     theUser.committee_id.should.equal(data.users[user_id - 1].committee_id);
                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
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

                     /* validating password */
                     if(!theUser.validPassword((user.new_password || data.users[user_id - 1].password))){
                        throw new Error("The user's password is incorrect.");
                     }

                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s phone_number in the database.', function(done) {
            var user_id = 5;
            var user = {
               old_password: "123456",
               phone_number: '01122064666'
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

                     theUser.phone_number.should.equal((user.phone_number || data.users[user_id - 1].phone_number));
                     if(theUser.IEEE_membership_ID){
                        theUser.IEEE_membership_ID.should.equal((user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID));
                     }

                     data.users[user_id - 1].phone_number = user.phone_number || data.users[user_id - 1].phone_number;
                     data.users[user_id - 1].IEEE_membership_ID = user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID;
                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     theUser.type.should.equal(data.users[user_id - 1].type);
                     theUser.email.should.equal(data.users[user_id - 1].email);
                     theUser.committee_id.should.equal(data.users[user_id - 1].committee_id);
                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
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

                     /* validating password */
                     if(!theUser.validPassword((user.new_password || data.users[user_id - 1].password))){
                        throw new Error("The user's password is incorrect.");
                     }

                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s IEEE_membership_ID in the database.', function(done) {
            var user_id = 5;
            var user = {
               old_password: "123456",
               IEEE_membership_ID: '016'
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

                     theUser.phone_number.should.equal((user.phone_number || data.users[user_id - 1].phone_number));
                     if(theUser.IEEE_membership_ID){
                        theUser.IEEE_membership_ID.should.equal((user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID));
                     }

                     data.users[user_id - 1].phone_number = user.phone_number || data.users[user_id - 1].phone_number;
                     data.users[user_id - 1].IEEE_membership_ID = user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID;
                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;
                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     theUser.type.should.equal(data.users[user_id - 1].type);
                     theUser.email.should.equal(data.users[user_id - 1].email);
                     theUser.committee_id.should.equal(data.users[user_id - 1].committee_id);
                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
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

                     /* validating password */
                     if(!theUser.validPassword((user.new_password || data.users[user_id - 1].password))){
                        throw new Error("The user's password is incorrect.");
                     }

                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user in the database.', function(done) {
            var user_id = 5;

            var user = {
               old_password: "123456",
               new_password: "1234567",
               phone_number: "0121345649",
               IEEE_membership_ID: "987"
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

                     theUser.phone_number.should.equal((user.phone_number || data.users[user_id - 1].phone_number));
                     if(theUser.IEEE_membership_ID){
                        theUser.IEEE_membership_ID.should.equal((user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID));
                     }

                     data.users[user_id - 1].phone_number = user.phone_number || data.users[user_id - 1].phone_number;
                     data.users[user_id - 1].IEEE_membership_ID = user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID;
                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     theUser.type.should.equal(data.users[user_id - 1].type);
                     theUser.email.should.equal(data.users[user_id - 1].email);
                     theUser.committee_id.should.equal(data.users[user_id - 1].committee_id);
                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
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

                     /* validating password */
                     if(!theUser.validPassword((user.new_password || data.users[user_id - 1].password))){
                        throw new Error("The user's password is incorrect.");
                     }

                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not update the user in the database duo to empty body.', function(done) {
            var user_id = 5;

            var user = {
               old_password: "1234567"
            };

            chai.request(app)
            .put('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
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

                     theUser.phone_number.should.equal((user.phone_number || data.users[user_id - 1].phone_number));
                     if(theUser.IEEE_membership_ID){
                        theUser.IEEE_membership_ID.should.equal((user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID));
                     }

                     data.users[user_id - 1].phone_number = user.phone_number || data.users[user_id - 1].phone_number;
                     data.users[user_id - 1].IEEE_membership_ID = user.IEEE_membership_ID || data.users[user_id - 1].IEEE_membership_ID;
                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

                     theUser.type.should.equal(data.users[user_id - 1].type);
                     theUser.email.should.equal(data.users[user_id - 1].email);
                     theUser.committee_id.should.equal(data.users[user_id - 1].committee_id);
                     theUser.first_name.should.equal(data.users[user_id - 1].first_name);
                     theUser.last_name.should.equal(data.users[user_id - 1].last_name);
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

                     /* validating password */
                     if(!theUser.validPassword((user.new_password || data.users[user_id - 1].password))){
                        throw new Error("The user's password is incorrect.");
                     }

                     data.users[user_id - 1].password = user.new_password || data.users[user_id - 1].password;

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
