var User = require('../app/models/User').user;
var Identity = require('../app/models/Identity').identity;

/* User_Identity relation */
User.hasMany(Identity, { as: 'Identities', foreignKey: { allowNull: false } });
Identity.belongsTo(User, { as: 'User', foreignKey: { allowNull: false } });
