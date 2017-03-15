module.exports = function(args) {
    var app, fn, data, models, chai, should;

    describe('GET /api/committee/:id', function() {
        this.timeout(500);
        before(function(done) {
            this.timeout(20000);
            app = args.app;
            fn = args.fn;
            data = args.data;
            models = args.models;
            chai = args.chai;
            should = chai.should();

            fn.clearAll(function(err) {
                if (err) {
                    done(err);
                    return;
                }

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
        });

        /*******************
        * Validation Tests *
        ********************/
        {
            it('Should not get the committee due to invalid committee ID in the URL.', function(done) {
                chai.request(app)
                .get('/api/committee/a')
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        res.body.should.not.have.property('committee');
                        should.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not get a non-existing committee.', function(done) {
                var committee_id = 10;
                chai.request(app)
                .get('/api/committee/' + committee_id)
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(404);
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
        * Acceptance Tests *
        ********************/
        {
            it('Should get the committee (Admin Authentication).', function(done) {
                var committee_id = 1;
                chai.request(app)
                .get('/api/committee/' + committee_id)
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committee');
                        res.body.committee.should.have.property('name').and.equal('Committee ' + committee_id);
                        res.body.committee.should.have.property('description').and.equal('Description ' + committee_id);
                        res.body.committee.should.have.property('members');
                        res.body.committee.members.should.have.lengthOf(3);
                        res.body.committee.members.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committee.members.length; i++) {
                            var member_id = (committee_id+3) + (4*i);
                            res.body.committee.members[i].should.have.property('id').and.equal(member_id);
                            res.body.committee.members[i].should.have.property('first_name').and.equal("First Name " + member_id);
                            res.body.committee.members[i].should.have.property('last_name').and.equal("Last Name " + member_id);
                            res.body.committee.members[i].should.have.property('profile_picture').and.equal(null);
                        }

                        res.body.committee.should.have.property('created_at');
                        res.body.committee.should.have.property('updated_at');
                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get the committee (Upper Board Authentication).', function(done) {
                var committee_id = 3;
                chai.request(app)
                .get('/api/committee/' + committee_id)
                .set('Authorization', data.identities[1].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committee');
                        res.body.committee.should.have.property('name').and.equal('Committee ' + committee_id);
                        res.body.committee.should.have.property('description').and.equal('Description ' + committee_id);
                        res.body.committee.should.have.property('members');
                        res.body.committee.members.should.have.lengthOf(3);
                        res.body.committee.members.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committee.members.length; i++) {
                            var member_id = (committee_id+3) + (4*i);
                            res.body.committee.members[i].should.have.property('id').and.equal(member_id);
                            res.body.committee.members[i].should.have.property('first_name').and.equal("First Name " + member_id);
                            res.body.committee.members[i].should.have.property('last_name').and.equal("Last Name " + member_id);
                            res.body.committee.members[i].should.have.property('profile_picture').and.equal(null);
                        }

                        res.body.committee.should.have.property('created_at');
                        res.body.committee.should.have.property('updated_at');
                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get the committee (High Board Authentication).', function(done) {
                var committee_id = 2;
                chai.request(app)
                .get('/api/committee/' + committee_id)
                .set('Authorization', data.identities[4].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committee');
                        res.body.committee.should.have.property('name').and.equal('Committee ' + committee_id);
                        res.body.committee.should.have.property('description').and.equal('Description ' + committee_id);
                        res.body.committee.should.have.property('members');
                        res.body.committee.members.should.have.lengthOf(3);
                        res.body.committee.members.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committee.members.length; i++) {
                            var member_id = (committee_id+3) + (4*i);
                            res.body.committee.members[i].should.have.property('id').and.equal(member_id);
                            res.body.committee.members[i].should.have.property('first_name').and.equal("First Name " + member_id);
                            res.body.committee.members[i].should.have.property('last_name').and.equal("Last Name " + member_id);
                            res.body.committee.members[i].should.have.property('profile_picture').and.equal(null);
                        }

                        res.body.committee.should.have.property('created_at');
                        res.body.committee.should.have.property('updated_at');
                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get the committee (Member Authentication).', function(done) {
                var committee_id = 4;
                chai.request(app)
                .get('/api/committee/' + committee_id)
                .set('Authorization', data.identities[7].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committee');
                        res.body.committee.should.have.property('name').and.equal('Committee ' + committee_id);
                        res.body.committee.should.have.property('description').and.equal('Description ' + committee_id);
                        res.body.committee.should.have.property('members');
                        res.body.committee.members.should.have.lengthOf(3);
                        res.body.committee.members.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committee.members.length; i++) {
                            var member_id = (committee_id+3) + (4*i);
                            res.body.committee.members[i].should.have.property('id').and.equal(member_id);
                            res.body.committee.members[i].should.have.property('first_name').and.equal("First Name " + member_id);
                            res.body.committee.members[i].should.have.property('last_name').and.equal("Last Name " + member_id);
                            res.body.committee.members[i].should.have.property('profile_picture').and.equal(null);
                        }

                        res.body.committee.should.have.property('created_at');
                        res.body.committee.should.have.property('updated_at');
                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get the committee (Visitor Authentication).', function(done) {
                var committee_id = 1;
                chai.request(app)
                .get('/api/committee/' + committee_id)
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committee');
                        res.body.committee.should.have.property('name').and.equal('Committee ' + committee_id);
                        res.body.committee.should.have.property('description').and.equal('Description ' + committee_id);
                        res.body.committee.should.have.property('members');
                        res.body.committee.members.should.have.lengthOf(3);
                        res.body.committee.members.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committee.members.length; i++) {
                            var member_id = (committee_id+3) + (4*i);
                            res.body.committee.members[i].should.have.property('id').and.equal(member_id);
                            res.body.committee.members[i].should.have.property('first_name').and.equal("First Name " + member_id);
                            res.body.committee.members[i].should.have.property('last_name').and.equal("Last Name " + member_id);
                            res.body.committee.members[i].should.have.property('profile_picture').and.equal(null);
                        }

                        res.body.committee.should.have.property('created_at');
                        res.body.committee.should.have.property('updated_at');
                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });
        }
    });
};
