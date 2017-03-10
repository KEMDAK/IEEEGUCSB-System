module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('GET /api/user/:id', function() {
      this.timeout(500);
      
      before(function(done) {
         this.timeout(10000);
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
                        models.Media.bulkCreate(data.profile_pictures).then(function() {
                           models.Task.bulkCreate(data.tasks).then(function() {
                              models.Task.findAll().then(function(tasks) {
                                 var restM = function() {
                                    models.Meeting.bulkCreate(data.meetings).then(function() {
                                       models.Meeting.findAll().then(function(meetings) {

                                          var restH = function() {
                                             models.Honor.bulkCreate(data.honors).then(function() {
                                                models.Honor.findAll().then(function(honors) {
                                                   var recH = function(i) {
                                                      if(i == honors.length){
                                                         done();

                                                         return;
                                                      }

                                                      honors[i].addUsers(data.honors_users[i]).then(function() {
                                                         recH(i + 1);
                                                      }).catch(function(err) {
                                                         done(err);
                                                      });
                                                   };

                                                   recH(0);
                                                }).catch(function(err) {
                                                   done(err);
                                                });
                                             }).catch(function(err) {
                                                done(err);
                                             });
                                          };

                                          var recM = function(i) {
                                             if(i == meetings.length){
                                                restH();

                                                return;
                                             }

                                             meetings[i].addAttendees(data.meeting_user[i], { rating: 4, review: "Good" }).then(function() {
                                                recM(i + 1);
                                             }).catch(function(err) {
                                                done(err);
                                             });
                                          };

                                          recM(0);
                                       }).catch(function(err) {
                                          done(err);
                                       });
                                    }).catch(function(err) {
                                       done(err);
                                    });
                                 };

                                 var recT = function(i) {
                                    if(i == tasks.length){
                                       restM();

                                       return;
                                    }

                                    tasks[i].addAssignedUsers(data.tasks_users[i]).then(function() {
                                       recT(i + 1);
                                    }).catch(function(err) {
                                       done(err);
                                    });
                                 };

                                 recT(0);
                              }).catch(function(err) {
                                 done(err);
                              });
                           }).catch(function(err) {
                              done(err);
                           });
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
            }
         });
      });

      /***********************
      * Authentication Tests *
      ************************/
      {
         it('Should not allow a visitor to show a user.', function(done) {
            chai.request(app)
            .get('/api/user/1')
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

         it('Should deny access due to missing User Agent header.', function(done) {
            chai.request(app)
            .get('/api/user/1')
            .set('Authorization', data.identities[0].token)
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
            chai.request(app)
            .get('/api/user/1')
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
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
         it('Should not show the user due to invalid user ID in the URL.', function(done) {
            chai.request(app)
            .get('/api/user/a')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
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
         it('Should show my detailed profile (Admin Authentication).', function(done) {
            var user_id = 1;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public,
                     private: data.users[user_id - 1].settings.private
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of an Upper Board (Admin Authentication).', function(done) {
            var user_id = 2;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of a High Board (Admin Authentication).', function(done) {
            var user_id = 4;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of a Member (Admin Authentication). (with honors)', function(done) {
            var user_id = 9;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of a Member (Admin Authentication). (without honors)', function(done) {
            var user_id = 13;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show my detailed profile (Upper Board Authentication).', function(done) {
            var user_id = 2;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public,
                     private: data.users[user_id - 1].settings.private
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of an Admin (Upper Board Authentication).', function(done) {
            var user_id = 1;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of an Upper Board (Upper Board Authentication).', function(done) {
            var user_id = 3;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of a High Board (Upper Board Authentication).', function(done) {
            var user_id = 4;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of a Member (Upper Board Authentication). (with honors)', function(done) {
            var user_id = 9;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of a Member (Upper Board Authentication). (without honors)', function(done) {
            var user_id = 13;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show my detailed profile (High Board Authentication).', function(done) {
            var user_id = 4;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public,
                     private: data.users[user_id - 1].settings.private
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of an Admin (High Board Authentication).', function(done) {
            var user_id = 1;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of an Upper Board (High Board Authentication).', function(done) {
            var user_id = 3;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of a High Board (High Board Authentication).', function(done) {
            var user_id = 4;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the detailed profile of a Member in my committee (High Board Authentication).', function(done) {
            var user_id = 8;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of a Member not in my committee (High Board Authentication).', function(done) {
            var user_id = 9;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show my detailed profile (Member Authentication).', function(done) {
            var user_id = 9;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[8].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors', 'phone_number', 'birthdate', 'tasks', 'meetings']);
                  res.body.user.profile_type.should.equal('Detailed');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public,
                     private: data.users[user_id - 1].settings.private
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  /* Detailed profile */
                  res.body.user.phone_number.should.equal(data.users[user_id - 1].phone_number);

                  /* Checking tasks */
                  count = 0;
                  for (var i = 0; i < data.tasks_users.length; i++) {
                     if(data.tasks_users[i].find(user_id)) {
                        count++;
                        var task_id = i + 1;
                        res.body.user.tasks.should.contain({
                           id: task_id,
                           title: "Task " + task_id,
                           priority: 5,
                           deadline: res.body.user.tasks[0].deadline,
                           status: "New",
                           created_at: res.body.user.tasks[0].created_at,
                           updated_at: res.body.user.tasks[0].updated_at
                        });
                     }
                  }
                  res.body.user.tasks.should.have.lengthOf(count);

                  /* Checking meetings */
                  count = 0;
                  for (var i = 0; i < data.meetings_users.length; i++) {
                     if(data.meetings_users[i].find(user_id)) {
                        count++;
                        var meeting_id = i + 1;
                        res.body.user.meetings.should.contain({
                           id: meeting_id,
                           start_date: res.body.user.meetings[0].start_date,
                           end_date: res.body.user.meetings[0].end_date,
                           location: "Location " + meeting_id,
                           created_at: res.body.user.meetings[0].created_at,
                           updated_at: res.body.user.meetings[0].updated_at
                        });
                     }
                  }
                  res.body.user.meetings.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of an Admin (Member Authentication).', function(done) {
            var user_id = 1;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[8].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of an Upper Board (Member Authentication).', function(done) {
            var user_id = 3;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[8].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of a High Board (Member Authentication).', function(done) {
            var user_id = 4;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[8].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of a Member in my committee (Member Authentication).', function(done) {
            var user_id = 8;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[8].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the Basic profile of a Member not in my committee (Member Authentication).', function(done) {
            var user_id = 9;
            chai.request(app)
            .get('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[8].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.user.should.have.all.keys(['profile_type', 'id', 'type', 'first_name', 'last_name', 'email', 'IEEE_membership_ID', 'gender', 'settings', 'committee', 'profile_picture', 'honors']);
                  res.body.user.profile_type.should.equal('Basic');

                  /* Basic profile */
                  res.body.user.id.should.equal(user_id);
                  res.body.user.type.should.equal(data.users[user_id - 1].type);
                  res.body.user.first_name.should.equal(data.users[user_id - 1].first_name);
                  res.body.user.last_name.should.equal(data.users[user_id - 1].last_name);
                  res.body.user.email.should.equal(data.users[user_id - 1].email);
                  res.body.user.IEEE_membership_ID.should.equal(data.users[user_id - 1].IEEE_membership_ID);
                  res.body.user.gender.should.equal(data.users[user_id - 1].gender);
                  JSON.parse(res.body.user.settings).should.eql({
                     public: data.users[user_id - 1].settings.public
                  });

                  /* Checking committee */
                  if(data.users[user_id - 1].committee_id) {
                     res.body.user.committee.should.eql({
                        id: data.users[user_id - 1].committee_id,
                        name: "Committee " + data.users[user_id - 1].committee_id
                     });
                  }
                 
                  /* Cheking media */
                  var url;
                  if (data.users[user_id - 1].gender == 'Male'){
                     defaultURL = '/general/male.jpg';
                  }
                  else {
                     defaultURL = '/general/female.jpg';
                  }

                  res.body.user.profilePicture.should.eql({
                     type: "Image",
                     url: url
                  });

                  /* Cecking honors */
                  var count = 0;
                  for (var i = 0; i < data.honors_users.length; i++) {
                     if(data.honors_users[i].find(user_id)) {
                        count++;
                        var honor_id = i + 1;
                        res.body.user.honors.should.contain({
                           id: honor_id,
                           title: "Honor " + honor_id
                        });  
                     }
                  }
                  res.body.user.honors.should.have.lengthOf(count);

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });
      }
   });
};
