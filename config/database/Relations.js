var User = require('../../app/models/User').User;
var Identity = require('../../app/models/Identity').Identity;

/* User_Identity relation */
User.hasMany(Identity, { as: 'Identities', foreignKey: { allowNull: false } });
Identity.belongsTo(User, { as: 'User', foreignKey: { allowNull: false } });
