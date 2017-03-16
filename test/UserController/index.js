module.exports = function(args) {
   var app, fn, data, models, chai, should;

   describe('GET /api/user', function() {
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
                        models.Media.bulkCreate(data.profile_pictures).then(function() {
                           done();
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

      /*******************
      * Acceptance Tests *
      ********************/
      {
         it('Should show the list of users (Admin Authentication).', function(done) {
            chai.request(app)
            .get('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[0].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.users.sort(function(a, b) { return a.id - b.id; });
                  for (var i = 0; i < res.body.users.length; i++) {
                     var user = {
                        id: (i + 1),
                        first_name: data.users[i].first_name,
                        last_name: data.users[i].last_name,
                        profile_picture: {
                           type: "Image",
                           url: "url " + (i + 1)
                        }
                     };

                     if(i > 2){
                        user.committee = {
                           id: data.users[i].committee_id,
                           name: "Committee " + (((i - 3) % 4) + 1)
                        };
                     }

                     res.body.users[i].should.eql(user);
                  }

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the list of users (Upper Board Authentication).', function(done) {
            chai.request(app)
            .get('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[1].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.users.sort(function(a, b) { return a.id - b.id; });
                  for (var i = 0; i < res.body.users.length; i++) {
                     var user = {
                        id: (i + 1),
                        first_name: data.users[i].first_name,
                        last_name: data.users[i].last_name,
                        profile_picture: {
                           type: "Image",
                           url: "url " + (i + 1)
                        }
                     };

                     if(i > 2){
                        user.committee = {
                           id: data.users[i].committee_id,
                           name: "Committee " + (((i - 3) % 4) + 1)
                        };
                     }

                     res.body.users[i].should.eql(user);
                  }

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the list of users (High Board Authentication).', function(done) {
            chai.request(app)
            .get('/api/user')
            .set('User_Agent', 'Web')
            .set('Authorization', data.identities[3].token)
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.users.sort(function(a, b) { return a.id - b.id; });
                  for (var i = 0; i < res.body.users.length; i++) {
                     var user = {
                        id: (i + 1),
                        first_name: data.users[i].first_name,
                        last_name: data.users[i].last_name,
                        profile_picture: {
                           type: "Image",
                           url: "url " + (i + 1)
                        }
                     };

                     if(i > 2){
                        user.committee = {
                           id: data.users[i].committee_id,
                           name: "Committee " + (((i - 3) % 4) + 1)
                        };
                     }

                     res.body.users[i].should.eql(user);
                  }

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });

         it('Should show the list of users (visitor).', function(done) {
            chai.request(app)
            .get('/api/user')
            .end(function(err, res) {
               try {
                  res.should.have.status(200);
                  res.body.users.sort(function(a, b) { return a.id - b.id; });
                  for (var i = 0; i < res.body.users.length; i++) {
                     var user = {
                        id: (i + 1),
                        first_name: data.users[i].first_name,
                        last_name: data.users[i].last_name,
                        profile_picture: {
                           type: "Image",
                           url: "url " + (i + 1)
                        }
                     };

                     if(i > 2){
                        user.committee = {
                           id: data.users[i].committee_id,
                           name: "Committee " + (((i - 3) % 4) + 1)
                        };
                     }

                     res.body.users[i].should.eql(user);
                  }

                  done();
               } catch(error) {
                  done(error);
               }
            });
         });
      }
   });
};
