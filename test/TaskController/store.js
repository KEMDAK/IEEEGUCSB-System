module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('POST /api/task', function() {
      this.timeout(1000);
      
      before(function(done) {
         this.timeout(10000);
         app = args.app;
         fn = args.fn;
         data = args.data;
         models = args.models;
         chai = args.chai;
         should = chai.should();

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

      after(function(done) {
         this.timeout(10000);
         fn.clearAll(function(err) {
            if(err)
               done(err);
            else
               done();
         });
      });

      /***********************
      * Authentication Tests *
      ************************/
      {
         it('Should not allow a visitor to add a task.', function(done) {
            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow a Member to add a task.', function(done) {
            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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
            chai.request(app)
            .post('/api/task')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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
            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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
         it('Should not allow a High Board to add a task to an Admin.', function(done) {
            var task = {
               title: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assignedTo: [1]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow a High Board to add a task to an Upper Board.', function(done) {
            var task = {
               title: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assignedTo: [2]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow a High Board to add a task to other High Board.', function(done) {
            var task = {
               title: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assignedTo: [5]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow a High Board to add a task to members not from his/her committee.', function(done) {
            var task = {
               title: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow the task to be added due to missing \'title\' parameter in the body.', function(done) {
            var task = {
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow the task to be added due to invalid \'title\' parameter in the body.', function(done) {
            var task = {
               title: 5,
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow the task to be added due to invalid \'description\' parameter in the body.', function(done) {
            var task = {
               title: "Task",
               description: 8,
               deadline: "2017-2-25 08:00:00",
               priority: "5",
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow the task to be added due to missing \'deadline\' parameter in the body.', function(done) {
            var task = {
               title: "Task",
               description: "Description",
               priority: "5",
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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
         
         it('Should not allow the task to be added due to invalid \'deadline\' parameter in the body.', function(done) {
            var task = {
               title: "Task",
               description: "Description",
               deadline: "This is an invalid date.",
               priority: "5",
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow the task to be added due to missing \'priority\' parameter in the body.', function(done) {
            var task = {
               task: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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

         it('Should not allow the task to be added due to invalid \'priority\' parameter in the body.', function(done) {
            var task = {
               task: "Task",
               description: "Description",
               deadline: "2017-2-25 08:00:00",
               priority: 7,
               assignedTo: [9, 12]
            };

            chai.request(app)
            .post('/api/task')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .send(task)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.count().then(function(count) {
                     if(count !== 0)
                        throw new Error("The Task has been added to the database.");
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
         it('Should add the task in the database (Admin Authentication).', function(done) {
            fn.clearTable('tasks', function(err) {
               if (err) {
                  done(err);
               }

               var task = {
                  title: "Task",
                  description: "Description",
                  deadline: "2017-2-25 08:00:00",
                  priority: "5",
                  assignedTo: [2, 3, 4, 5, 6]
               };

               chai.request(app)
               .post('/api/task')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(task)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Task.findById(1).then(function(theTask) {
                        if (!theTask) {
                           throw new Error("The task wasn\'t added in the database.");
                        }

                        if(theTask.status != 'New') {
                           throw new Error("The status of the task is not New.");
                        }

                        theTask.getAssignedUsers().then(function(records) {
                           if (!records) {
                              throw new Error("There were no assigned users for the task.");
                           }

                           var assignedUsers = [];
                           var i;
                           for (i = 0; i < records.length; i++) {
                              assignedUsers.push(records[i].id);
                           }

                           assignedUsers.should.have.lengthOf(task.assignedUsers.length);
                           assignedUsers.sort(function(a, b) { return a - b; });

                           var valid = true;
                           for (i = 0; i < assignedUsers.length && valid; i++) {
                              if (assignedUsers[i] != task.assignedUsers[i]) {
                                 valid = false;
                              }
                           }

                           if (valid === false) {
                              throw new Error("The wrong users were assigned to the task.");
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
         });

         it('Should add the task in the database (Upper Board Authentication).', function(done) {
            fn.clearTable('tasks', function(err) {
               if (err) {
                  done(err);
               }

               var task = {
                  title: "Task",
                  description: "Description",
                  deadline: "2017-2-25 08:00:00",
                  priority: "5",
                  assignedTo: [1, 3, 4, 5, 6]
               };

               chai.request(app)
               .post('/api/task')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[1].token)
               .send(task)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Task.findById(1).then(function(theTask) {
                        if (!theTask) {
                           throw new Error("The task wasn\'t added in the database.");
                        }

                        if(theTask.status != 'New') {
                           throw new Error("The status of the task is not New.");
                        }

                        theTask.getAssignedUsers().then(function(records) {
                           if (!records) {
                              throw new Error("There were no assigned users for the task.");
                           }

                           var assignedUsers = [];
                           var i;
                           for (i = 0; i < records.length; i++) {
                              assignedUsers.push(records[i].id);
                           }

                           assignedUsers.should.have.lengthOf(task.assignedUsers.length);
                           assignedUsers.sort(function(a, b) { return a - b; });

                           var valid = true;
                           for (i = 0; i < assignedUsers.length && valid; i++) {
                              if (assignedUsers[i] != task.assignedUsers[i]) {
                                 valid = false;
                              }
                           }

                           if (valid === false) {
                              throw new Error("The wrong users were assigned to the task.");
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
         });

         it('Should add the task in the database (High Board Authentication).', function(done) {
            fn.clearTable('tasks', function(err) {
               if (err) {
                  done(err);
               }

               var task = {
                  title: "Task",
                  description: "Description",
                  deadline: "2017-2-25 08:00:00",
                  priority: "5",
                  assignedTo: [8, 12]
               };

               chai.request(app)
               .post('/api/task')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[3].token)
               .send(task)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Task.findById(1).then(function(theTask) {
                        if (!theTask) {
                           throw new Error("The task wasn\'t added in the database.");
                        }

                        if(theTask.status != 'New') {
                           throw new Error("The status of the task is not New.");
                        }

                        theTask.getAssignedUsers().then(function(records) {
                           if (!records) {
                              throw new Error("There were no assigned users for the task.");
                           }

                           var assignedUsers = [];
                           var i;
                           for (i = 0; i < records.length; i++) {
                              assignedUsers.push(records[i].id);
                           }

                           assignedUsers.should.have.lengthOf(task.assignedUsers.length);
                           assignedUsers.sort(function(a, b) { return a - b; });

                           var valid = true;
                           for (i = 0; i < assignedUsers.length && valid; i++) {
                              if (assignedUsers[i] != task.assignedUsers[i]) {
                                 valid = false;
                              }
                           }

                           if (valid === false) {
                              throw new Error("The wrong users were assigned to the task.");
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
         });

         it('Should add the task in the database (without description).', function(done) {
            fn.clearTable('tasks', function(err) {
               if (err) {
                  done(err);
               }

               var task = {
                  title: "Task",
                  deadline: "2017-2-25 08:00:00",
                  priority: "5",
                  assignedTo: [2, 3, 4, 5, 6]
               };

               chai.request(app)
               .post('/api/task')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(task)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Task.findById(1).then(function(theTask) {
                        if (!theTask) {
                           throw new Error("The task wasn\'t added in the database.");
                        }

                        if(theTask.status != 'New') {
                           throw new Error("The status of the task is not New.");
                        }

                        if(theTask.description) {
                           throw new Error("The task was added with a description in the database.");
                        }

                        theTask.getAssignedUsers().then(function(records) {
                           if (!records) {
                              throw new Error("There were no assigned users for the task.");
                           }

                           var assignedUsers = [];
                           var i;
                           for (i = 0; i < records.length; i++) {
                              assignedUsers.push(records[i].id);
                           }

                           assignedUsers.should.have.lengthOf(task.assignedUsers.length);
                           assignedUsers.sort(function(a, b) { return a - b; });

                           var valid = true;
                           for (i = 0; i < assignedUsers.length && valid; i++) {
                              if (assignedUsers[i] != task.assignedUsers[i]) {
                                 valid = false;
                              }
                           }

                           if (valid === false) {
                              throw new Error("The wrong users were assigned to the task.");
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
         });

         it('Should add the task in the database (without assigned users).', function(done) {
            fn.clearTable('tasks', function(err) {
               if (err) {
                  done(err);
               }

               var task = {
                  title: "Task",
                  description: "Description",
                  deadline: "2017-2-25 08:00:00",
                  priority: "5"
               };

               chai.request(app)
               .post('/api/task')
               .set('User_Agent', 'Web')
               .set('Authorization', data.identities[0].token)
               .send(task)
               .end(function(err, res) {
                  try {
                     res.should.have.status(200);
                     res.body.should.have.property('status').and.equal('succeeded');
                     res.body.should.not.have.property('errors');
                     should.not.exist(err);

                     models.Task.findById(1).then(function(theTask) {
                        if (!theTask) {
                           throw new Error("The task wasn\'t added in the database.");
                        }

                        if(theTask.status != 'New') {
                           throw new Error("The status of the task is not New.");
                        }

                        theTask.getAssignedUsers().then(function(records) {
                           if (!records) {
                              done();
                           }
                           else{
                              throw new Error("The wrong users were assigned to the task.");
                           }
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
         });
      }
   });
};
