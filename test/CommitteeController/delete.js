module.exports = function(args) {
    var app, fn, data, models, chai, should;

    describe('DELETE /api/committee/:id', function() {
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

        /***********************
        * Authentication Tests *
        ************************/
        {
            it('Should not allow a visitor to delete a committee.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);
                        models.Committee.findAll().then(function(records) {
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

            it('Should not allow a Member to delete a committee.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[7].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(403);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);
                        models.Committee.findAll().then(function(records) {
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

            it('Should not allow a High Board to delete a committee.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[3].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(403);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);
                        models.Committee.findAll().then(function(records) {
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

            it('Should deny access due to missing User Agent header.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);
                        models.Committee.findAll().then(function(records) {
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

            it('Should deny access due to invalid User Agent header.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('User_Agent', 'Windows Phone')
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);
                        models.Committee.findAll().then(function(records) {
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
        * Validation Tests *
        ********************/
        {
            it('Should not delete the committee due to invalid meeting ID in the URL.', function(done) {
                chai.request(app)
                .delete('/api/committee/*')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');
                        should.exist(err);
                        models.Committee.findAll().then(function(records) {
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

            it('Should not delete a non-existing committee.', function(done) {
                var committee_id = 10;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(404);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);
                        models.Committee.findAll().then(function(records) {
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
            it('Should delete the committee (Admin Authentication).', function(done) {
                var committee_id = 1;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);
                        models.Committee.findAll().then(function(records) {
                            records.should.have.lengthOf(3);
                            models.Committee.findById(committee_id).then(function(record) {
                                if (record) {
                                    throw new Error('The committee should be deleted.');
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

            it('Should delete the committee (Upper Board Authentication).', function(done) {
                var committee_id = 2;
                chai.request(app)
                .delete('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[1].token)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);
                        models.Committee.findAll().then(function(records) {
                            records.should.have.lengthOf(2);
                            models.Committee.findById(committee_id).then(function(record) {
                                if (record) {
                                    throw new Error('The committee should be deleted.');
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
