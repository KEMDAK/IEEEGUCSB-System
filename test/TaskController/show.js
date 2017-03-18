module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('GET /api/task/:id', function() {
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
            if(err)
               done(err);
            else {
               models.Committee.bulkCreate(data.committees).then(function() {
                  models.User.bulkCreate(data.users).then(function() {
                     models.Identity.bulkCreate(data.identities).then(function() {
                        models.Task.bulkCreate(data.tasks).then(function() {
                           models.Comment.bulkCreate(data.comments).then(function() {
                              models.Task.findAll().then(function(tasks) {
                                 var rec = function(i) {
                                    if(i == tasks.length){
                                       done();

                                       return;
                                    }

                                    tasks[i].addAssignedUsers(data.tasks_users[i]).then(function() {
                                       rec(i + 1);
                                    }).catch(function(err) {
                                       done(err);
                                    });
                                 };

                                 rec(0);
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
         it('Should not allow a visitor to show a task.', function(done) {
            chai.request(app)
            .get('/api/task/1')
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
            .get('/api/task/1')
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
            .get('/api/task/1')
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

         it('Should not allow a High Board to show a task while not being a supervisor nor the assignee.', function(done) {
            chai.request(app)
            .get('/api/task/1')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member to show a task that is not assigned to one in his/her committee.', function(done) {
            chai.request(app)
            .get('/api/task/4')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[9].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
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
      * Validation Tests *
      ********************/
      {
         it('Should not show the task due to invalid task ID in the URL.', function(done) {
            chai.request(app)
            .get('/api/task/a')
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
         it('Should show the task while being the supervisor (Admin Authentication).', function(done) {
            var task_id = 1;
            chai.request(app)
            .get('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.all.keys(['status', 'task']);
                  res.body.status.should.equal("succeeded");
                  res.body.task.should.have.all.keys(['id', 'title', 'description', 'deadline', 'priority', 'status', 'evaluation', 'comments', 'assigned_to', 'created_at', 'updated_at', 'supervisor']);
                  res.body.task.id.should.equal(task_id);
                  res.body.task.title.should.equal("Task " + task_id);
                  res.body.task.description.should.equal("Description " + task_id);
                  res.body.task.priority.should.equal(5);
                  res.body.task.status.should.equal("New");
                  res.body.task.evaluation.should.equal(3);
                  res.body.task.comments.should.be.an('array');
                  res.body.task.comments.should.have.lengthOf(2);
                  res.body.task.comments.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.comments.length; i++) {
                     res.body.task.comments[i].should.have.all.keys(['id', 'content', 'user', 'created_at', 'updated_at']);
                     res.body.task.comments[i].user.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);

                     var comment_id = res.body.task.id + ((i % 2 === 0)? 0 : 4);
                     res.body.task.comments[i].id.should.equal(comment_id);
                     res.body.task.comments[i].content.should.equal("Content " + comment_id);
                     res.body.task.comments[i].user.should.eql({
                        id: comment_id,
                        first_name: "First Name " + comment_id,
                        last_name: "Last Name " + comment_id,
                        profile_picture: null
                     });
                  }

                  res.body.task.assigned_to.should.be.an('array');
                  res.body.task.assigned_to.should.have.lengthOf(data.tasks_users[task_id - 1].length);
                  res.body.task.assigned_to.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.assigned_to.length; i++) {
                     res.body.task.assigned_to[i].should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                     res.body.task.assigned_to[i].should.eql({
                        id: data.tasks_users[task_id - 1].id,
                        first_name: "First Name " + data.tasks_users[task_id - 1].id,
                        last_name: "Last Name " + data.tasks_users[task_id - 1].id,
                        profile_picture: null
                     });
                  }

                  res.body.task.supervisor.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                  res.body.task.supervisor.should.eql({
                     id: task_id,
                     first_name: "First Name " + task_id,
                     last_name: "Last Name " + task_id,
                     profile_picture: null
                  });

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the task while not being a supervisor nor the assignee (Admin Authentication).', function(done) {
            var task_id = 4;
            chai.request(app)
            .get('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.all.keys(['status', 'task']);
                  res.body.status.should.equal("succeeded");
                  res.body.task.should.have.all.keys(['id', 'title', 'description', 'deadline', 'priority', 'status', 'evaluation', 'comments', 'assigned_to', 'created_at', 'updated_at', 'supervisor']);
                  res.body.task.id.should.equal(task_id);
                  res.body.task.title.should.equal("Task " + task_id);
                  res.body.task.description.should.equal("Description " + task_id);
                  res.body.task.priority.should.equal(5);
                  res.body.task.status.should.equal("New");
                  res.body.task.evaluation.should.equal(3);
                  res.body.task.comments.should.be.an('array');
                  res.body.task.comments.should.have.lengthOf(2);
                  res.body.task.comments.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.comments.length; i++) {
                     res.body.task.comments[i].should.have.all.keys(['id', 'content', 'user', 'created_at', 'updated_at']);
                     res.body.task.comments[i].user.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);

                     var comment_id = res.body.task.id + ((i % 2 === 0)? 0 : 4);
                     res.body.task.comments[i].id.should.equal(comment_id);
                     res.body.task.comments[i].content.should.equal("Content " + comment_id);
                     res.body.task.comments[i].user.should.eql({
                        id: comment_id,
                        first_name: "First Name " + comment_id,
                        last_name: "Last Name " + comment_id,
                        profile_picture: null
                     });
                  }

                  res.body.task.assigned_to.should.be.an('array');
                  res.body.task.assigned_to.should.have.lengthOf(data.tasks_users[task_id - 1].length);
                  res.body.task.assigned_to.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.assigned_to.length; i++) {
                     res.body.task.assigned_to[i].should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                     res.body.task.assigned_to[i].should.eql({
                        id: data.tasks_users[task_id - 1].id,
                        first_name: "First Name " + data.tasks_users[task_id - 1].id,
                        last_name: "Last Name " + data.tasks_users[task_id - 1].id,
                        profile_picture: null
                     });
                  }

                  res.body.task.supervisor.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                  res.body.task.supervisor.should.eql({
                     id: task_id,
                     first_name: "First Name " + task_id,
                     last_name: "Last Name " + task_id,
                     profile_picture: null
                  });

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the task while being the supervisor (Upper Board Authentication).', function(done) {
            var task_id = 2;
            chai.request(app)
            .get('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.all.keys(['status', 'task']);
                  res.body.status.should.equal("succeeded");
                  res.body.task.should.have.all.keys(['id', 'title', 'description', 'deadline', 'priority', 'status', 'evaluation', 'comments', 'assigned_to', 'created_at', 'updated_at', 'supervisor']);
                  res.body.task.id.should.equal(task_id);
                  res.body.task.title.should.equal("Task " + task_id);
                  res.body.task.description.should.equal("Description " + task_id);
                  res.body.task.priority.should.equal(5);
                  res.body.task.status.should.equal("New");
                  res.body.task.evaluation.should.equal(3);
                  res.body.task.comments.should.be.an('array');
                  res.body.task.comments.should.have.lengthOf(2);
                  res.body.task.comments.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.comments.length; i++) {
                     res.body.task.comments[i].should.have.all.keys(['id', 'content', 'user', 'created_at', 'updated_at']);
                     res.body.task.comments[i].user.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);

                     var comment_id = res.body.task.id + ((i % 2 === 0)? 0 : 4);
                     res.body.task.comments[i].id.should.equal(comment_id);
                     res.body.task.comments[i].content.should.equal("Content " + comment_id);
                     res.body.task.comments[i].user.should.eql({
                        id: comment_id,
                        first_name: "First Name " + comment_id,
                        last_name: "Last Name " + comment_id,
                        profile_picture: null
                     });
                  }

                  res.body.task.assigned_to.should.be.an('array');
                  res.body.task.assigned_to.should.have.lengthOf(data.tasks_users[task_id - 1].length);
                  res.body.task.assigned_to.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.assigned_to.length; i++) {
                     res.body.task.assigned_to[i].should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                     res.body.task.assigned_to[i].should.eql({
                        id: data.tasks_users[task_id - 1].id,
                        first_name: "First Name " + data.tasks_users[task_id - 1].id,
                        last_name: "Last Name " + data.tasks_users[task_id - 1].id,
                        profile_picture: null
                     });
                  }

                  res.body.task.supervisor.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                  res.body.task.supervisor.should.eql({
                     id: task_id,
                     first_name: "First Name " + task_id,
                     last_name: "Last Name " + task_id,
                     profile_picture: null
                  });

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the task while not being a supervisor nor the assignee (Upper Board Authentication).', function(done) {
            var task_id = 4;
            chai.request(app)
            .get('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.all.keys(['status', 'task']);
                  res.body.status.should.equal("succeeded");
                  res.body.task.should.have.all.keys(['id', 'title', 'description', 'deadline', 'priority', 'status', 'evaluation', 'comments', 'assigned_to', 'created_at', 'updated_at', 'supervisor']);
                  res.body.task.id.should.equal(task_id);
                  res.body.task.title.should.equal("Task " + task_id);
                  res.body.task.description.should.equal("Description " + task_id);
                  res.body.task.priority.should.equal(5);
                  res.body.task.status.should.equal("New");
                  res.body.task.evaluation.should.equal(3);
                  res.body.task.comments.should.be.an('array');
                  res.body.task.comments.should.have.lengthOf(2);
                  res.body.task.comments.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.comments.length; i++) {
                     res.body.task.comments[i].should.have.all.keys(['id', 'content', 'user', 'created_at', 'updated_at']);
                     res.body.task.comments[i].user.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);

                     var comment_id = res.body.task.id + ((i % 2 === 0)? 0 : 4);
                     res.body.task.comments[i].id.should.equal(comment_id);
                     res.body.task.comments[i].content.should.equal("Content " + comment_id);
                     res.body.task.comments[i].user.should.eql({
                        id: comment_id,
                        first_name: "First Name " + comment_id,
                        last_name: "Last Name " + comment_id,
                        profile_picture: null
                     });
                  }

                  res.body.task.assigned_to.should.be.an('array');
                  res.body.task.assigned_to.should.have.lengthOf(data.tasks_users[task_id - 1].length);
                  res.body.task.assigned_to.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.assigned_to.length; i++) {
                     res.body.task.assigned_to[i].should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                     res.body.task.assigned_to[i].should.eql({
                        id: data.tasks_users[task_id - 1].id,
                        first_name: "First Name " + data.tasks_users[task_id - 1].id,
                        last_name: "Last Name " + data.tasks_users[task_id - 1].id,
                        profile_picture: null
                     });
                  }

                  res.body.task.supervisor.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                  res.body.task.supervisor.should.eql({
                     id: task_id,
                     first_name: "First Name " + task_id,
                     last_name: "Last Name " + task_id,
                     profile_picture: null
                  });

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the task while being the supervisor (High Board Authentication).', function(done) {
            var task_id = 4;
            chai.request(app)
            .get('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.all.keys(['status', 'task']);
                  res.body.status.should.equal("succeeded");
                  res.body.task.should.have.all.keys(['id', 'title', 'description', 'deadline', 'priority', 'status', 'evaluation', 'comments', 'assigned_to', 'created_at', 'updated_at', 'supervisor']);
                  res.body.task.id.should.equal(task_id);
                  res.body.task.title.should.equal("Task " + task_id);
                  res.body.task.description.should.equal("Description " + task_id);
                  res.body.task.priority.should.equal(5);
                  res.body.task.status.should.equal("New");
                  res.body.task.evaluation.should.equal(3);
                  res.body.task.comments.should.be.an('array');
                  res.body.task.comments.should.have.lengthOf(2);
                  res.body.task.comments.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.comments.length; i++) {
                     res.body.task.comments[i].should.have.all.keys(['id', 'content', 'user', 'created_at', 'updated_at']);
                     res.body.task.comments[i].user.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);

                     var comment_id = res.body.task.id + ((i % 2 === 0)? 0 : 4);
                     res.body.task.comments[i].id.should.equal(comment_id);
                     res.body.task.comments[i].content.should.equal("Content " + comment_id);
                     res.body.task.comments[i].user.should.eql({
                        id: comment_id,
                        first_name: "First Name " + comment_id,
                        last_name: "Last Name " + comment_id,
                        profile_picture: null
                     });
                  }

                  res.body.task.assigned_to.should.be.an('array');
                  res.body.task.assigned_to.should.have.lengthOf(data.tasks_users[task_id - 1].length);
                  res.body.task.assigned_to.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.assigned_to.length; i++) {
                     res.body.task.assigned_to[i].should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                     res.body.task.assigned_to[i].should.eql({
                        id: data.tasks_users[task_id - 1].id,
                        first_name: "First Name " + data.tasks_users[task_id - 1].id,
                        last_name: "Last Name " + data.tasks_users[task_id - 1].id,
                        profile_picture: null
                     });
                  }

                  res.body.task.supervisor.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                  res.body.task.supervisor.should.eql({
                     id: task_id,
                     first_name: "First Name " + task_id,
                     last_name: "Last Name " + task_id,
                     profile_picture: null
                  });

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the task while being assigned to it (Member Authentication).', function(done) {
            var task_id = 4;
            chai.request(app)
            .get('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.all.keys(['status', 'task']);
                  res.body.status.should.equal("succeeded");
                  res.body.task.should.have.all.keys(['id', 'title', 'description', 'deadline', 'priority', 'status', 'evaluation', 'comments', 'assigned_to', 'created_at', 'updated_at', 'supervisor']);
                  res.body.task.id.should.equal(task_id);
                  res.body.task.title.should.equal("Task " + task_id);
                  res.body.task.description.should.equal("Description " + task_id);
                  res.body.task.priority.should.equal(5);
                  res.body.task.status.should.equal("New");
                  res.body.task.evaluation.should.equal(3);
                  res.body.task.comments.should.be.an('array');
                  res.body.task.comments.should.have.lengthOf(2);
                  res.body.task.comments.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.comments.length; i++) {
                     res.body.task.comments[i].should.have.all.keys(['id', 'content', 'user', 'created_at', 'updated_at']);
                     res.body.task.comments[i].user.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);

                     var comment_id = res.body.task.id + ((i % 2 === 0)? 0 : 4);
                     res.body.task.comments[i].id.should.equal(comment_id);
                     res.body.task.comments[i].content.should.equal("Content " + comment_id);
                     res.body.task.comments[i].user.should.eql({
                        id: comment_id,
                        first_name: "First Name " + comment_id,
                        last_name: "Last Name " + comment_id,
                        profile_picture: null
                     });
                  }

                  res.body.task.assigned_to.should.be.an('array');
                  res.body.task.assigned_to.should.have.lengthOf(data.tasks_users[task_id - 1].length);
                  res.body.task.assigned_to.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.assigned_to.length; i++) {
                     res.body.task.assigned_to[i].should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                     res.body.task.assigned_to[i].should.eql({
                        id: data.tasks_users[task_id - 1].id,
                        first_name: "First Name " + data.tasks_users[task_id - 1].id,
                        last_name: "Last Name " + data.tasks_users[task_id - 1].id,
                        profile_picture: null
                     });
                  }

                  res.body.task.supervisor.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                  res.body.task.supervisor.should.eql({
                     id: task_id,
                     first_name: "First Name " + task_id,
                     last_name: "Last Name " + task_id,
                     profile_picture: null
                  });

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the task while being assigned to a member in his/her committee (Member Authentication).', function(done) {
            var task_id = 4;
            chai.request(app)
            .get('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[11].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.all.keys(['status', 'task']);
                  res.body.status.should.equal("succeeded");
                  res.body.task.should.have.all.keys(['id', 'title', 'description', 'deadline', 'priority', 'status', 'evaluation', 'comments', 'assigned_to', 'created_at', 'updated_at', 'supervisor']);
                  res.body.task.id.should.equal(task_id);
                  res.body.task.title.should.equal("Task " + task_id);
                  res.body.task.description.should.equal("Description " + task_id);
                  res.body.task.priority.should.equal(5);
                  res.body.task.status.should.equal("New");
                  res.body.task.evaluation.should.equal(3);
                  res.body.task.comments.should.be.an('array');
                  res.body.task.comments.should.have.lengthOf(2);
                  res.body.task.comments.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.comments.length; i++) {
                     res.body.task.comments[i].should.have.all.keys(['id', 'content', 'user', 'created_at', 'updated_at']);
                     res.body.task.comments[i].user.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);

                     var comment_id = res.body.task.id + ((i % 2 === 0)? 0 : 4);
                     res.body.task.comments[i].id.should.equal(comment_id);
                     res.body.task.comments[i].content.should.equal("Content " + comment_id);
                     res.body.task.comments[i].user.should.eql({
                        id: comment_id,
                        first_name: "First Name " + comment_id,
                        last_name: "Last Name " + comment_id,
                        profile_picture: null
                     });
                  }

                  res.body.task.assigned_to.should.be.an('array');
                  res.body.task.assigned_to.should.have.lengthOf(data.tasks_users[task_id - 1].length);
                  res.body.task.assigned_to.sort(function(a, b){ return a.id - b.id; });
                  for (var i = 0; i < res.body.task.assigned_to.length; i++) {
                     res.body.task.assigned_to[i].should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                     res.body.task.assigned_to[i].should.eql({
                        id: data.tasks_users[task_id - 1].id,
                        first_name: "First Name " + data.tasks_users[task_id - 1].id,
                        last_name: "Last Name " + data.tasks_users[task_id - 1].id,
                        profile_picture: null
                     });
                  }

                  res.body.task.supervisor.should.have.all.keys(['id', 'first_name', 'last_name', 'profile_picture']);
                  res.body.task.supervisor.should.eql({
                     id: task_id,
                     first_name: "First Name " + task_id,
                     last_name: "Last Name " + task_id,
                     profile_picture: null
                  });

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });
      }
   });
};
