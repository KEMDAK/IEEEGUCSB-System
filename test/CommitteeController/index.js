module.exports = function(args) {
    var app, fn, data, models, chai, should;

    describe('GET /api/committee', function() {
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
        * Acceptance Tests *
        ********************/
        {
            it('Should get all committees (Admin Authentication).', function(done) {
                chai.request(app)
                .get('/api/committee')
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committees');
                        res.body.committees.should.have.lengthOf(4);
                        res.body.committees.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committees.length; i++) {
                            var committee_id = i + 1;
                            res.body.committees[i].should.have.property('id').and.equal(committee_id);
                            res.body.committees[i].should.have.property('name').and.equal('Committee ' + committee_id);
                            res.body.committees[i].should.have.property('description').and.equal('Description ' + committee_id);
                        }

                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get all committees (Upper Board Authentication).', function(done) {
                chai.request(app)
                .get('/api/committee')
                .set('Authorization', data.identities[1].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committees');
                        res.body.committees.should.have.lengthOf(4);
                        res.body.committees.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committees.length; i++) {
                            var committee_id = i + 1;
                            res.body.committees[i].should.have.property('id').and.equal(committee_id);
                            res.body.committees[i].should.have.property('name').and.equal('Committee ' + committee_id);
                            res.body.committees[i].should.have.property('description').and.equal('Description ' + committee_id);
                        }

                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get all committees (High Board Authentication).', function(done) {
                chai.request(app)
                .get('/api/committee')
                .set('Authorization', data.identities[3].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committees');
                        res.body.committees.should.have.lengthOf(4);
                        res.body.committees.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committees.length; i++) {
                            var committee_id = i + 1;
                            res.body.committees[i].should.have.property('id').and.equal(committee_id);
                            res.body.committees[i].should.have.property('name').and.equal('Committee ' + committee_id);
                            res.body.committees[i].should.have.property('description').and.equal('Description ' + committee_id);
                        }

                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get all committees (Member Authentication).', function(done) {
                chai.request(app)
                .get('/api/committee')
                .set('Authorization', data.identities[7].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committees');
                        res.body.committees.should.have.lengthOf(4);
                        res.body.committees.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committees.length; i++) {
                            var committee_id = i + 1;
                            res.body.committees[i].should.have.property('id').and.equal(committee_id);
                            res.body.committees[i].should.have.property('name').and.equal('Committee ' + committee_id);
                            res.body.committees[i].should.have.property('description').and.equal('Description ' + committee_id);
                        }

                        should.not.exist(err);
                        done();
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should get all committees (Visitor Authentication).', function(done) {
                chai.request(app)
                .get('/api/committee')
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        res.body.should.not.have.property('errors');
                        res.body.should.have.property('committees');
                        res.body.committees.should.have.lengthOf(4);
                        res.body.committees.sort(function(a, b) {
                            return a.id - b.id;
                        });

                        var i;
                        for (i = 0; i < res.body.committees.length; i++) {
                            var committee_id = i + 1;
                            res.body.committees[i].should.have.property('id').and.equal(committee_id);
                            res.body.committees[i].should.have.property('name').and.equal('Committee ' + committee_id);
                            res.body.committees[i].should.have.property('description').and.equal('Description ' + committee_id);
                        }

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
