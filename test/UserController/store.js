module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('POST /api/user', function() {

      this.timeout(1000);
          
      before(function(done) {
         this.timeout(40000);

         app = args.app;
         fn = args.fn;
         data = args.data;
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

      beforeEach(function(done) {
         args.sq.query('DELETE FROM users WHERE id > 15').then(function() {
            return args.sq.query('ALTER TABLE users AUTO_INCREMENT = 16');
         }).then(function() {
            done();
         }).catch(function(err) {
            done(err);
         });
      });

      /***********************
      * Authentication Tests *
      ************************/
      {
         it('Should not allow a visitor to add a user.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member to add a user.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to add a user.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
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
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
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
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
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
         it('Should not allow the user to be added due to missing \'type\' parameter in the body.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to invalid \'type\' parameter in the body. (type = Admin)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Admin",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to missing \'email\' parameter in the body.', function(done) {
            var user = {
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to invalid \'email\' parameter in the body. (invalid mail format)', function(done) {
            var user = {
               email: "invalid mail",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to invalid \'email\' parameter in the body. (invalid mail data type)', function(done) {
            var user = {
               email: 2,
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to missing \'first_name\' parameter in the body.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
         
         it('Should not allow the user to be added due to invalid \'first_name\' parameter in the body. (invalid first_name data type)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: 3,
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to missing \'last_name\' parameter in the body.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
         
         it('Should not allow the user to be added due to invalid \'last_name\' parameter in the body. (invalid last_name data type)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: 5,
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to missing \'birthdate\' parameter in the body.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
         
         it('Should not allow the user to be added due to invalid \'birthdate\' parameter in the body. (invalid birthdate format)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "05-03-1995",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
         
         it('Should not allow the user to be added due to invalid \'birthdate\' parameter in the body. (invalid birthdate data type)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: 4,
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to missing \'phone_number\' parameter in the body.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
         
         it('Should not allow the user to be added due to invalid \'phone_number\' parameter in the body. (invalid phone_number format)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "01025465d46654",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
         
         it('Should not allow the user to be added due to invalid \'phone_number\' parameter in the body. (invalid phone_number data type)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: 3,
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to missing \'gender\' parameter in the body.', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to invalid \'gender\' parameter in the body. (gender = invalid)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "invalid",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
                        done();
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the user to be added due to invalid \'IEEE_membership_ID\' parameter in the body. (invalid IEEE_membership_ID data type)', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "invalid",
               IEEE_membership_ID: 5
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findById(16).then(function(record) {
                     if(record)
                        throw new Error("The User has been added to the database.");
                     else
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
         it('Should add the user in the database (Admin Authentication).', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('error');
                  should.not.exist(err);

                  models.User.findById(16, { include: [{ model: models.Media, as: 'profilePicture' }] }).then(function(record) {
                     if (!record) {
                        throw new Error("The user wasn\'t added in the database.");
                     }

                     record.email.should.equal(user.email);
                     record.type.should.equal(user.type);
                     record.first_name.should.equal(user.first_name);
                     record.last_name.should.equal(user.last_name);
                     record.phone_number.should.equal(user.phone_number);
                     record.gender.should.equal(user.gender);
                     JSON.parse(record.settings).should.eql({
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
                     should.equal(record.committee_id, null);
                     should.equal(record.reset_token, null);
                     should.equal(record.IEEE_membership_ID, null);

                     /* Cheking media */
                     var defaultURL;
                     if (user.gender === "Male"){
                        defaultURL = '/general/male.jpg';
                     }
                     else {
                        defaultURL = '/general/female.jpg';
                     }

                     record.profilePicture = record.profilePicture.toJSON();
                     delete record.profilePicture.created_at;
                     delete record.profilePicture.updated_at;
                     delete record.profilePicture.user_id;
                     delete record.profilePicture.event_id;
                     delete record.profilePicture.id;
                     record.profilePicture.should.eql({
                        type: "Image",
                        url: defaultURL
                     });

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should add the user in the database (Upper Board Authentication).', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Female",
               IEEE_membership_ID: null
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('error');
                  should.not.exist(err);

                  models.User.findById(16, { include: [{ model: models.Media, as: 'profilePicture' }] }).then(function(record) {
                     if (!record) {
                        throw new Error("The user wasn\'t added in the database.");
                     }
  
                     record.email.should.equal(user.email);
                     record.type.should.equal(user.type);
                     record.first_name.should.equal(user.first_name);
                     record.last_name.should.equal(user.last_name);
                     record.phone_number.should.equal(user.phone_number);
                     record.gender.should.equal(user.gender);
                     JSON.parse(record.settings).should.eql({
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
                     should.equal(record.committee_id, null);
                     should.equal(record.reset_token, null);
                     should.equal(record.IEEE_membership_ID, null);

                     /* Cheking media */
                     var defaultURL;
                     if (user.gender === "Male"){
                        defaultURL = '/general/male.jpg';
                     }
                     else {
                        defaultURL = '/general/female.jpg';
                     }
                     record.profilePicture = record.profilePicture.toJSON();
                     delete record.profilePicture.created_at;
                     delete record.profilePicture.updated_at;
                     delete record.profilePicture.user_id;
                     delete record.profilePicture.event_id;
                     delete record.profilePicture.id;
                     record.profilePicture.should.eql({
                        type: "Image",
                        url: defaultURL
                     });

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should add the user in the database (without IEEE_membership_ID).', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Male"
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[2].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('error');
                  should.not.exist(err);

                  models.User.findById(16, { include: [{ model: models.Media, as: 'profilePicture' }] }).then(function(record) {
                     if (!record) {
                        throw new Error("The user wasn\'t added in the database.");
                     }

                     record.email.should.equal(user.email);
                     record.type.should.equal(user.type);
                     record.first_name.should.equal(user.first_name);
                     record.last_name.should.equal(user.last_name);
                     record.phone_number.should.equal(user.phone_number);
                     record.gender.should.equal(user.gender);
                     JSON.parse(record.settings).should.eql({
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
                     should.equal(record.committee_id, null);
                     should.equal(record.reset_token, null);
                     should.equal(record.IEEE_membership_ID, null);

                     /* Cheking media */
                     var defaultURL;
                     if (user.gender === "Male"){
                        defaultURL = '/general/male.jpg';
                     }
                     else {
                        defaultURL = '/general/female.jpg';
                     }

                     record.profilePicture = record.profilePicture.toJSON();
                     delete record.profilePicture.created_at;
                     delete record.profilePicture.updated_at;
                     delete record.profilePicture.user_id;
                     delete record.profilePicture.event_id;
                     delete record.profilePicture.id;
                     record.profilePicture.should.eql({
                        type: "Image",
                        url: defaultURL
                     });

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should add the user in the database (without saving the password).', function(done) {
            var user = {
               email: "ex16@outlook.com",
               type: "Member",
               first_name: "First Name 16",
               last_name: "Last Name 16",
               birthdate: "1111-11-11",
               phone_number: "+200000000000",
               gender: "Female",
               password: "123456"
            };

            chai.request(app)
            .post('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[2].token)
            .send(user)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('error');
                  should.not.exist(err);

                  models.User.findById(16, { include: [{ model: models.Media, as: 'profilePicture' }] }).then(function(record) {
                     if (!record) {
                        throw new Error("The user wasn\'t added in the database.");
                     }

                     record.email.should.equal(user.email);
                     record.type.should.equal(user.type);
                     record.first_name.should.equal(user.first_name);
                     record.last_name.should.equal(user.last_name);
                     record.phone_number.should.equal(user.phone_number);
                     record.gender.should.equal(user.gender);
                     JSON.parse(record.settings).should.eql({
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
                     should.equal(record.committee_id, null);
                     should.equal(record.reset_token, null);
                     should.equal(record.IEEE_membership_ID, null);

                     /* Cheking media */
                     var defaultURL;
                     if (user.gender === "Male"){
                        defaultURL = '/general/male.jpg';
                     }
                     else {
                        defaultURL = '/general/female.jpg';
                     }

                     record.profilePicture = record.profilePicture.toJSON();
                     delete record.profilePicture.created_at;
                     delete record.profilePicture.updated_at;
                     delete record.profilePicture.user_id;
                     delete record.profilePicture.event_id;
                     delete record.profilePicture.id;
                     record.profilePicture.should.eql({
                        type: "Image",
                        url: defaultURL
                     });

                     /* Checking the password */
                     if(record.validPassword('123456')){
                        throw new Error("The user was saved with the provided password!!!");
                     }

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
