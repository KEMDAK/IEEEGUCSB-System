module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('PUT /api/task/:id', function() {
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
         it('Should not allow a visitor to update a task.', function(done) {
            var task_id = 1;

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member to update a task.', function(done) {
            var task_id = 1;

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to missing User Agent header.', function(done) {
            var task_id = 1;

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to invalid User Agent header.', function(done) {
            var task_id = 1;

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow an Admin to update a task while not being its supervisor.', function(done) {
            var task_id = 2;
            var task = {
               title: "Task 2"
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow an Upper Board to update a task while not being its supervisor.', function(done) {
            var task_id = 1;
            var task = {
               title: "Task 1"
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to update a task while not being its supervisor.', function(done) {
            var task_id = 1;
            var task = {
               title: "Task 1"
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
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
         it('Should not allow a High Board to assign a task to an Admin.', function(done) {
            var task_id = 4;
            var task = {
               assigned_to: [1]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to assign a task to an Upper Board.', function(done) {
            var task_id = 4;
            var task = {
               assigned_to: [2]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to assign a task to other High Board.', function(done) {
            var task_id = 4;
            var task = {
               assigned_to: [5]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to assign a task to members not from his/her committee.', function(done) {
            var task_id = 4;
            var task = {
               assigned_to: [9, 12]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the task to be updated due to invalid \'title\' parameter in the body.', function(done) {
            var task_id = 1;
            var task = {
               title: 5,
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assigned_to: [9, 12]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the task to be updated due to invalid \'description\' parameter in the body.', function(done) {
            var task_id = 1;
            var task = {
               title: "Task",
               description: 8,
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assigned_to: [9, 12]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });
         
         it('Should not allow the task to be updated due to invalid \'deadline\' parameter in the body.', function(done) {
            var task_id = 1;
            var task = {
               title: "Task",
               description: "Description",
               deadline: "This is an invalid date.",
               priority: "5",
               assigned_to: [9, 12]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the task to be updated due to invalid \'priority\' parameter in the body.', function(done) {
            var task_id = 1;
            var task = {
               title: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: 7,
               assigned_to: [9, 12]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
                  }).catch(function(err) {
                     done(err);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the task to be updated due to invalid \'status\' parameter in the body.', function(done) {
            var task_id = 1;
            var task = {
               title: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               status: "invalid",
               assigned_to: [9, 12]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if(record.updated_at !== record.created_at){
                        throw new Error("The Task has been updated in the database.");
                     }
                     
                     record.getAssignedUsers().then(function(users) {
                        users.sort(function(a, b) { return a.id - b.id; });
                        for (var i = 0; i < data.tasks_users[task_id - 1].length; i++) {
                           if(data.tasks_users[task_id - 1] !== users[i].id){
                              throw new Error("The Task assigned users has been updated in the database.");
                           }
                        }

                        done();
                     }).catch(function(err) {
                        done(err);
                     });                   
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
         it('Should update the task in the database (Admin Authentication).', function(done) {
            var task_id = 1;
            var task = {
               description: "Description u1",
               assigned_to: [1, 3, 5, 7]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.Task.findById(task_id).then(function(theTask) {
                     if (!theTask) {
                        throw new Error("The task was deleted from the database.");
                     }

                     theTask.title.should.equal((task.title || data.tasks[task_id - 1].title));
                     theTask.description.should.equal((task.description || data.tasks[task_id - 1].description));
                     theTask.priority.should.equal((task.priority || data.tasks[task_id - 1].priority));
                     theTask.status.should.equal((task.status || data.tasks[task_id - 1].status));

                     data.tasks[task_id - 1].title = task.title || data.tasks[task_id - 1].title;
                     data.tasks[task_id - 1].description = task.description || data.tasks[task_id - 1].description;
                     data.tasks[task_id - 1].priority = task.priority || data.tasks[task_id - 1].priority;
                     data.tasks[task_id - 1].status = task.status || data.tasks[task_id - 1].status;

                     theTask.getAssignedUsers().then(function(records) {
                        var assignedUsers = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           assignedUsers.push(records[i].id);
                        }

                        var defaultUsers = task.assigned_to || data.tasks_users[task_id - 1];

                        assignedUsers.should.have.lengthOf(defaultUsers.length);
                        assignedUsers.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < assignedUsers.length && valid; i++) {
                           if (assignedUsers[i] != defaultUsers[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong users were assigned to the task.");
                        }
                        else {
                           data.tasks_users[task_id - 1] = defaultUsers;
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

         it('Should update the task in the database (Upper Board Authentication).', function(done) {
            var task_id = 2;
            var task = {
               description: "Description u1",
               assigned_to: [2, 3, 5, 7]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.Task.findById(task_id).then(function(theTask) {
                     if (!theTask) {
                        throw new Error("The task was deleted from the database.");
                     }

                     theTask.title.should.equal((task.title || data.tasks[task_id - 1].title));
                     theTask.description.should.equal((task.description || data.tasks[task_id - 1].description));
                     theTask.priority.should.equal((task.priority || data.tasks[task_id - 1].priority));
                     theTask.status.should.equal((task.status || data.tasks[task_id - 1].status));

                     data.tasks[task_id - 1].title = task.title || data.tasks[task_id - 1].title;
                     data.tasks[task_id - 1].description = task.description || data.tasks[task_id - 1].description;
                     data.tasks[task_id - 1].priority = task.priority || data.tasks[task_id - 1].priority;
                     data.tasks[task_id - 1].status = task.status || data.tasks[task_id - 1].status;

                     theTask.getAssignedUsers().then(function(records) {
                        var assignedUsers = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           assignedUsers.push(records[i].id);
                        }

                        var defaultUsers = task.assigned_to || data.tasks_users[task_id - 1];

                        assignedUsers.should.have.lengthOf(defaultUsers.length);
                        assignedUsers.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < assignedUsers.length && valid; i++) {
                           if (assignedUsers[i] != defaultUsers[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong users were assigned to the task.");
                        }
                        else {
                           data.tasks_users[task_id - 1] = defaultUsers;
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

         it('Should update the task in the database (High Board Authentication).', function(done) {
            var task_id = 4;
            var task = {
               description: "Description u1",
               assigned_to: [4, 8, 12]
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.Task.findById(task_id).then(function(theTask) {
                     if (!theTask) {
                        throw new Error("The task was deleted from the database.");
                     }

                     theTask.title.should.equal((task.title || data.tasks[task_id - 1].title));
                     theTask.description.should.equal((task.description || data.tasks[task_id - 1].description));
                     theTask.priority.should.equal((task.priority || data.tasks[task_id - 1].priority));
                     theTask.status.should.equal((task.status || data.tasks[task_id - 1].status));

                     data.tasks[task_id - 1].title = task.title || data.tasks[task_id - 1].title;
                     data.tasks[task_id - 1].description = task.description || data.tasks[task_id - 1].description;
                     data.tasks[task_id - 1].priority = task.priority || data.tasks[task_id - 1].priority;
                     data.tasks[task_id - 1].status = task.status || data.tasks[task_id - 1].status;

                     theTask.getAssignedUsers().then(function(records) {
                        var assignedUsers = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           assignedUsers.push(records[i].id);
                        }

                        var defaultUsers = task.assigned_to || data.tasks_users[task_id - 1];

                        assignedUsers.should.have.lengthOf(defaultUsers.length);
                        assignedUsers.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < assignedUsers.length && valid; i++) {
                           if (assignedUsers[i] != defaultUsers[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong users were assigned to the task.");
                        }
                        else {
                           data.tasks_users[task_id - 1] = defaultUsers;
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

         it('Should update the task in the database (without assigned_to).', function(done) {
            var task_id = 4;
            var task = {
               description: "Description 4"
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.Task.findById(task_id).then(function(theTask) {
                     if (!theTask) {
                        throw new Error("The task was deleted from the database.");
                     }

                     theTask.title.should.equal((task.title || data.tasks[task_id - 1].title));
                     theTask.description.should.equal((task.description || data.tasks[task_id - 1].description));
                     theTask.priority.should.equal((task.priority || data.tasks[task_id - 1].priority));
                     theTask.status.should.equal((task.status || data.tasks[task_id - 1].status));

                     data.tasks[task_id - 1].title = task.title || data.tasks[task_id - 1].title;
                     data.tasks[task_id - 1].description = task.description || data.tasks[task_id - 1].description;
                     data.tasks[task_id - 1].priority = task.priority || data.tasks[task_id - 1].priority;
                     data.tasks[task_id - 1].status = task.status || data.tasks[task_id - 1].status;

                     theTask.getAssignedUsers().then(function(records) {
                        var assignedUsers = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           assignedUsers.push(records[i].id);
                        }

                        var defaultUsers = task.assigned_to || data.tasks_users[task_id - 1];

                        assignedUsers.should.have.lengthOf(defaultUsers.length);
                        assignedUsers.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < assignedUsers.length && valid; i++) {
                           if (assignedUsers[i] != defaultUsers[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong users were assigned to the task.");
                        }
                        else {
                           data.tasks_users[task_id - 1] = defaultUsers;
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

         it('Should not update the task in the database if the request body is empty.', function(done) {
            var task_id = 4;
            var task = {
            };

            chai.request(app)
            .put('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');
                  should.not.exist(err);

                  models.Task.findById(task_id).then(function(theTask) {
                     if (!theTask) {
                        throw new Error("The task was deleted from the database.");
                     }

                     theTask.title.should.equal((task.title || data.tasks[task_id - 1].title));
                     theTask.description.should.equal((task.description || data.tasks[task_id - 1].description));
                     theTask.priority.should.equal((task.priority || data.tasks[task_id - 1].priority));
                     theTask.status.should.equal((task.status || data.tasks[task_id - 1].status));

                     data.tasks[task_id - 1].title = task.title || data.tasks[task_id - 1].title;
                     data.tasks[task_id - 1].description = task.description || data.tasks[task_id - 1].description;
                     data.tasks[task_id - 1].priority = task.priority || data.tasks[task_id - 1].priority;
                     data.tasks[task_id - 1].status = task.status || data.tasks[task_id - 1].status;

                     theTask.getAssignedUsers().then(function(records) {
                        var assignedUsers = [];
                        var i;
                        for (i = 0; i < records.length; i++) {
                           assignedUsers.push(records[i].id);
                        }

                        var defaultUsers = task.assigned_to || data.tasks_users[task_id - 1];

                        assignedUsers.should.have.lengthOf(defaultUsers.length);
                        assignedUsers.sort(function(a, b) { return a - b; });

                        var valid = true;
                        for (i = 0; i < assignedUsers.length && valid; i++) {
                           if (assignedUsers[i] != defaultUsers[i]) {
                              valid = false;
                           }
                        }

                        if (valid === false) {
                           throw new Error("The wrong users were assigned to the task.");
                        }
                        else {
                           data.tasks_users[task_id - 1] = defaultUsers;
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
