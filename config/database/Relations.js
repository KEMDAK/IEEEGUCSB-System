var User = require('../../app/models/User').User;
var Identity = require('../../app/models/Identity').Identity;
var Committe = require('../../app/models/Committe').Committe;

/* Committe_User relation */
Committee.hasMany(User, { as: 'User', foreignKey: { allowNull: true } });
User.belongsTo(Committee, { as: 'Committee', foreignKey: { allowNull: true } });


/* User_Identity relation */
User.hasMany(Identity, { as: 'Identities', foreignKey: { allowNull: false } });
Identity.belongsTo(User, { as: 'User', foreignKey: { allowNull: false } });

