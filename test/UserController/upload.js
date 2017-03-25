module.exports = function(args) {
   var app, fn, data, models, chai, should;
   var fs = require('fs');
   var fse = require('fs-extra');

   describe('PUT /api/user/upload/upload', function() {
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
            .put('/api/user/upload')
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
            .put('/api/user/upload')
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
      }

      /*******************
      * Validation Tests *
      ********************/
      {
         it('Should not allow the user to be updated due to invalid profile picture (size greater than 2 MB).', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user/upload')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
            .attach('picture', fs.readFileSync('./test/UserController/grass.jpg'), 'grass.jpg')
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  (fse.existsSync('./public/images/' + user_id)).should.be.false;
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

         it('Should not allow the user to be updated due to invalid profile picture (invalid type).', function(done) {
            var user_id = 1;

            chai.request(app)
            .put('/api/user/upload')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
            .attach('picture', fs.readFileSync('./test/UserController/gif.gif'), 'gif.gif')
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  (fse.existsSync('./public/images/' + user_id)).should.be.false;
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
         it('Should update the user\'s profile picture in the database.', function(done) {
            var user_id = 5;

            chai.request(app)
            .put('/api/user/upload')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
            .attach('picture', fs.readFileSync('./test/UserController/profile_picture.png'), 'profile_picture.png')
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);
                  (fse.existsSync('./public/images/' + user_id)).should.be.true;

                  models.User.findById(user_id, { include: [{ model: models.Media, as: 'profilePicture' }] }).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     if(!theUser.profilePicture) {
                        throw new Error("The user doesn't have a profile picture.");
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

                     /* Checking media */
                     theUser.profilePicture = theUser.profilePicture.toJSON();
                     delete theUser.profilePicture.created_at;
                     delete theUser.profilePicture.updated_at;
                     delete theUser.profilePicture.user_id;
                     delete theUser.profilePicture.event_id;
                     delete theUser.profilePicture.id;
                     theUser.profilePicture.should.eql({
                        type: "Image",
                        url: 'http://' + proccess.env.DOMAIN + ':' + proccess.env.PORT + '/' + user_id + '/' + 'Image.png'
                     });
                     (fse.existsSync('./public/images/' + user_id + '/Image.png')).should.be.true;

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should update the user\'s profile picture in the database.', function(done) {
            var user_id = 5;

            chai.request(app)
            .put('/api/user/upload')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[user_id - 1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);
                  (fse.existsSync('./public/images/' + user_id)).should.be.true;

                  models.User.findById(user_id, { include: [{ model: models.Media, as: 'profilePicture' }] }).then(function(theUser) {
                     if (!theUser) {
                        throw new Error("The user was deleted from the database.");
                     }

                     if(!theUser.profilePicture) {
                        throw new Error("The user doesn't have a profile picture.");
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

                     /* Checking media */
                     var defaultURL;
                     if (theUser.gender === "Male"){
                        defaultURL = '/general/male.jpg';
                     }
                     else {
                        defaultURL = '/general/female.jpg';
                     }

                     theUser.profilePicture = theUser.profilePicture.toJSON();
                     delete theUser.profilePicture.created_at;
                     delete theUser.profilePicture.updated_at;
                     delete theUser.profilePicture.user_id;
                     delete theUser.profilePicture.event_id;
                     delete theUser.profilePicture.id;
                     theUser.profilePicture.should.eql({
                        type: "Image",
                        url: defaultURL
                     });
                     (fse.existsSync('./public/images/' + user_id + '/Image.png')).should.be.false;

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
