var User = require('../../app/models/User').User;
var Committe = require('../../app/models/Committe').Committe;

/* Committe_User relation */
Committee.hasMany(User, { as: 'User', foreignKey: { allowNull: true } });
