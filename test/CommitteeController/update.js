module.exports = function(args) {
    var app, fn, data, models, chai, should;

    describe('PUT /api/committee/:id', function() {
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
            it('Should not allow a visitor to update a committee.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .send({ name: "New Committee" })
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow a Member to update a committee.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[7].token)
                .send({ name: "New Committee" })
                .end(function(err, res) {
                    try {
                        res.should.have.status(403);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should deny access due to missing User Agent header.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('Authorization', data.identities[0].token)
                .send({ name: "New Committee" })
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should deny access due to invalid User Agent header.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Windows Phone')
                .set('Authorization', data.identities[0].token)
                .send({ name: "New Committee" })
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

        /*******************
        * Validation Tests *
        ********************/
        {
            it('Should not update the committee due to invalid committee ID in the URL.', function(done) {
                chai.request(app)
                .put('/api/committee/a')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ name: "New Committee" })
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

            it('Should not allow the committee to be updated due to invalid \'name\' parameter in the body.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ name: 1 })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow the committee to be updated due to invalid \'description\' parameter in the body.', function(done) {
                var committee_id = 1;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ description: 1 })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow the committee to be updated due to invalid \'members\' parameter in the body. (Invalid type)', function(done) {
                var committee_id = 2;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ members: "Invalid" })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow the committee to be updated due to invalid \'members\' parameter in the body. (Element invalid type)', function(done) {
                var committee_id = 3;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ members: ["This", "is", "Invalid"] })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow the committee to be updated due to invalid \'members\' parameter in the body. (High Board as part of the members\' list)', function(done) {
                var committee_id = 3;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ members: [5] })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow the committee to be updated due to invalid \'members\' parameter in the body. (Upper Board as part of the members\' list)', function(done) {
                var committee_id = 3;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ members: [2] })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow the committee to be updated due to invalid \'members\' parameter in the body. (Admin as part of the members\' list)', function(done) {
                var committee_id = 3;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[1].token)
                .send({ members: [1] })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not allow the committee to be updated due to invalid \'head_id\' parameter in the body.', function(done) {
                var committee_id = 4;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ head_id: "Invalid" })
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('id').and.equal(committee_id);
                            record.should.have.property('name').and.equal("Committee " + committee_id);
                            record.should.have.property('description').and.equal("Description " + committee_id);

                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                var i;
                                for (i = 0; i < users.length; i++) {
                                    var id = (committee_id+3) + (4*i);
                                    users[i].should.have.property('id').and.equal(id);
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

            it('Should not update a non-existing committee.', function(done) {
                var committee_id = 10;
                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send({ name: "New Name" })
                .end(function(err, res) {
                    try {
                        res.should.have.status(404);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.not.have.property('committee');
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
            it('Should update the committee (Admin Authentication).', function(done) {
                var committee_id = 1;
                var updatedCommittee = {
                    name: "New Name",
                    description: "New Description",
                    members: [9]
                };

                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(updatedCommittee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('name').and.equal('New Name');
                            record.should.have.property('description').and.equal('New Description');
                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(2);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                users[0].should.have.property('id').and.equal(4);
                                users[1].should.have.property('id').and.equal(9);
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

            it('Should update the committee (Upper Board Authentication).', function(done) {
                var committee_id = 1;
                var updatedCommittee = {
                    name: "Newest Name",
                    description: "Newest Description",
                    members: [10]
                };

                chai.request(app)
                .put('/api/committee/' + committee_id)
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[1].token)
                .send(updatedCommittee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);

                        models.Committee.findById(committee_id).then(function(record) {
                            record.should.have.property('name').and.equal('Newest Name');
                            record.should.have.property('description').and.equal('Newest Description');
                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(2);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                users[0].should.have.property('id').and.equal(4);
                                users[1].should.have.property('id').and.equal(10);
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
