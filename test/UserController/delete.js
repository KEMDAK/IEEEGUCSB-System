module.exports = function(args) {
   var app, fn, data, models, chai, should;
   var fse = require('fs-extra');

   describe('DELETE /api/user/:id', function() {
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

      beforeEach(function() {
         var ids = [1, 8, 4, 3, 9, 7, 2];
         for (var i = 0; i < ids.length; i++) {
            fse.ensureDirSync('./public/images/' + ids[i]);
         }
      });

      after(function() {
         var ids = [1, 8, 4, 3, 9, 7, 2];
         for (var i = 0; i < ids.length; i++) {
            fse.removeSync('./public/images/' + ids[i]);
         }
      });

      /***********************
      * Authentication Tests *
      ************************/
      {
         it('Should not allow a visitor to delete a user.', function(done) {
            var user_id = 7;
            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.true;

                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a Member to delete a user.', function(done) {
            var user_id = 7;
            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[7].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.true;
                     
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a High Board to delete a user.', function(done) {
            var user_id = 7;
            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(403);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.true;
                     
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
            var user_id = 7;
            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.true;
                     
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
            var user_id = 7;
            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Windows Phone')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(401);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.true;
                     
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
         it('Should not delete a user due to invalid user ID in the URL.', function(done) {
            chai.request(app)
            .delete('/api/user/a')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  res.body.should.have.property('errors');  // TODO: Test the errors themselves
                  should.exist(err);
                  models.User.findAll().then(function(records) {
                     records.should.have.lengthOf(15);
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a the deletion of an Admin. (Admin authentication)', function(done) {
            var user_id = 1;
            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.true;
                     
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should not allow a the deletion of an Admin. (Upper Board authentication)', function(done) {
            var user_id = 1;
            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(400);
                  res.body.should.have.property('status').and.equal('failed');
                  should.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.true;
                     
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
         it('Should delete the Member. (Admin authentication)', function(done) {
            var user_id = 8;

            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.not.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.false;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should delete the High Board user. (Admin authentication)', function(done) {
            var user_id = 4;

            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.not.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.false;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should delete the Upper Board user. (Admin authentication)', function(done) {
            var user_id = 3;

            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.not.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.false;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should delete the Member. (Upper Board authentication)', function(done) {
            var user_id = 9;

            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.not.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.false;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should delete the High Board user. (Upper Board authentication)', function(done) {
            var user_id = 7;

            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.not.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.false;
                     done();
                  }).catch(function(error) {
                     done(error);
                  });
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should delete the Upper Board user. (Upper Board authentication)', function(done) {
            var user_id = 2;

            chai.request(app)
            .delete('/api/user/' + user_id)
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.should.have.property('status').and.equal('succeeded');
                  res.body.should.not.have.property('errors');  // TODO: Test the errors themselves
                  should.not.exist(err);
                  models.User.findById(user_id).then(function(record) {
                     should.not.exist(record);
                     (fse.existsSync('./public/images/' + user_id)).should.be.false;
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
