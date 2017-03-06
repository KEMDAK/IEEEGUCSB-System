module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('DELETE /api/task/:id', function() {
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
         it('Should not allow a visitor to delete the task.', function(done) {
            var task_id = 1;
            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     record.should.be.ok;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member to delete the task.', function(done) {
            var task_id = 1;
            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     record.should.be.ok;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the deletion of the task by non-supervisor (Admin).', function(done) {
            var task_id = 2;
            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     record.should.be.ok;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the deletion of the task by non-supervisor (Upper Board).', function(done) {
            var task_id = 1;
            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     record.should.be.ok;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow the deletion of the task by non-supervisor (High Board).', function(done) {
            var task_id = 1;
            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     record.should.be.ok;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to missing User Agent header.', function(done) {
            var task_id = 1;
            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     record.should.be.ok;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should deny access due to invalid User Agent header.', function(done) {
            var task_id = 1;
            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     record.should.be.ok;
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

      /*******************
      * Validation Tests *
      ********************/
      {
         it('Should not delete the task due to invalid task ID in the URL.', function(done) {
            chai.request(app)
            .delete('/api/task/a')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.Task.findAll().then(function(records) {
                     records.should.have.lengthOf(4);
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

      /*******************
      * Acceptance Tests *
      ********************/
      {
         it('Should delete the task.', function(done) {
            var task_id = 4;

            chai.request(app)
            .delete('/api/task/' + task_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.Task.findById(task_id).then(function(record) {
                     if (record) {
                        throw new Error("The task should be deleted.");
                     }

                     models.Task.findById(task_id).then(function(record) {
                        record.should.not.be.ok;
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
