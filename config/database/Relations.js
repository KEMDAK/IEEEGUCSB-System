var User     = require('../../app/models/User').User;
var Identity = require('../../app/models/Identity').Identity;
var Log      = require('../../app/models/Log').Log;

/* User_Identity relation */
User.hasMany(Identity, { as: 'Identities', foreignKey: { allowNull: false } });
Identity.belongsTo(User, { as: 'User', foreignKey: { allowNull: false } });

/* User_Log relation */
User.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true }  });
Log.belongsTo(User, { as: 'User', foreignKey: { allowNull: true }  });

/* Identity_Log relation */
Identity.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true }  });
Log.belongsTo(Identity, { as: 'Identity', foreignKey: { allowNull: true }  });
