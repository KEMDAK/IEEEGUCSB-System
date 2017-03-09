module.exports = function(args) {
    var app, fn, data, models, chai, should;

    describe('POST /api/committee', function() {
        before(function(done) {
            this.timeout(10000);
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

                models.User.bulkCreate(data.unassigned_users).then(function() {
                    models.Identity.bulkCreate(data.identities).then(function() {
                        done();
                    }).catch(function(err) {
                        done(err);
                    });
                }).catch(function(err) {
                    done(err);
                });
            });
        });

        beforeEach(function(done) {
            fn.clearTable('committees', function(err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });

        /***********************
        * Authentication Tests *
        ************************/
        {
            it('Should not allow a visitor to store a committee.', function(done) {
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow a Member to store a committee.', function(done) {
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[7].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(403);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow a High Board to store a committee.', function(done) {
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[3].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(403);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

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
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('Authorization', data.identities[3].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

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
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Windows Phone')
                .set('Authorization', data.identities[3].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(401);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

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
            it('Should not allow the committee to be stored due to missing \'name\' parameter in the body.', function(done) {
                var committee = {
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'name\' parameter in the body.', function(done) {
                var committee = {
                    name: 1,
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to missing \'description\' parameter in the body.', function(done) {
                var committee = {
                    name: "Committee",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'description\' parameter in the body.', function(done) {
                var committee = {
                    name: "Committee",
                    description: 1,
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'members\' parameter in the body. (Invalid type)', function(done) {
                var committee = {
                    name: "Committee",
                    description: 1,
                    members: "Invalid",
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'members\' parameter in the body. (Element invalid type)', function(done) {
                var committee = {
                    name: "Committee",
                    description: 1,
                    members: ["This", "is", "Invalid"],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'members\' parameter in the body. (High Board as part of the members\' list)', function(done) {
                var committee = {
                    name: "Committee",
                    description: 1,
                    members: [4],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'members\' parameter in the body. (Upper Board as part of the members\' list)', function(done) {
                var committee = {
                    name: "Committee",
                    description: 1,
                    members: [2],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        res.body.should.have.property('errors');  // TODO: Test the errors themselves
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'members\' parameter in the body. (Admin as part of the members\' list)', function(done) {
                var committee = {
                    name: "Committee",
                    description: 1,
                    members: [1],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

                            done();
                        }).catch(function(error) {
                            done(error);
                        });
                    } catch(error) {
                        done(error);
                    }
                });
            });

            it('Should not allow the committee to be stored due to invalid \'head_id\' parameter in the body.', function(done) {
                var committee = {
                    name: "Committee",
                    description: 1,
                    members: [8, 9],
                    head_id: "Invalid"
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(400);
                        res.body.should.have.property('status').and.equal('failed');
                        should.exist(err);

                        models.Committee.findAll().then(function(records) {
                            if (records.length > 0) {
                               throw new Error("The committee shouldn\'t be stored.");
                            }

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
            it('Should store the committee in the database (Admin Authentication).', function(done) {
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);

                        models.Committee.findById(1).then(function(record) {
                            record.should.have.property('name').and.equal('Committee');
                            record.should.have.property('description').and.equal('Description');
                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                users[0].should.have.property('id').and.equal(4);
                                users[1].should.have.property('id').and.equal(8);
                                users[2].should.have.property('id').and.equal(9);
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

            it('Should store the committee in the database (Upper Board Authentication).', function(done) {
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9],
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[1].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);

                        models.Committee.findById(1).then(function(record) {
                            record.should.have.property('name').and.equal('Committee');
                            record.should.have.property('description').and.equal('Description');
                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(3);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                users[0].should.have.property('id').and.equal(4);
                                users[1].should.have.property('id').and.equal(8);
                                users[2].should.have.property('id').and.equal(9);
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

            it('Should store the committee in the database even if \'head_id\' parameter is missing from the body.', function(done) {
                var committee = {
                    name: "Committee",
                    description: "Description",
                    members: [8, 9]
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);

                        models.Committee.findById(1).then(function(record) {
                            record.should.have.property('name').and.equal('Committee');
                            record.should.have.property('description').and.equal('Description');
                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(2);
                                users.sort(function(a, b) {
                                    return a.id - b.id;
                                });

                                users[0].should.have.property('id').and.equal(8);
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

            it('Should store the committee in the database even if \'members\' parameter is missing from the body.', function(done) {
                var committee = {
                    name: "Committee",
                    description: "Description",
                    head_id: 4
                };

                chai.request(app)
                .post('/api/committee')
                .set('User_Agent', 'Web')
                .set('Authorization', data.identities[0].token)
                .send(committee)
                .end(function(err, res) {
                    try {
                        res.should.have.status(200);
                        res.body.should.have.property('status').and.equal('succeeded');
                        should.not.exist(err);

                        models.Committee.findById(1).then(function(record) {
                            record.should.have.property('name').and.equal('Committee');
                            record.should.have.property('description').and.equal('Description');
                            record.getUsers().then(function(users) {
                                users.should.have.lengthOf(1);
                                users[0].should.have.property('id').and.equal(4);
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
