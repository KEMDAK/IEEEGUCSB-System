var User         = require('../../app/models/User').User;
var Identity     = require('../../app/models/Identity').Identity;
var Log          = require('../../app/models/Log').Log;
var Committee    = require('../../app/models/Committee').Committee;
var Media        = require('../../app/models/Media').Media;
var Task         = require('../../app/models/Task').Task;
var Meeting      = require('../../app/models/Meeting').Meeting;
var Event        = require('../../app/models/Event').Event;
var Honor        = require('../../app/models/Honor').Honor;
var Comment      = require('../../app/models/Comment').Comment;
var Notification = require('../../app/models/Notification').Notification;

/* Identity_User relation */
User.hasMany(Identity, { as: 'Identities', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Identity.belongsTo(User, { as: 'User', foreignKey: { allowNull: false }, onDelete: 'NO ACTION' });

/* Media_User relation */
User.hasOne(Media, { as: 'profilePicture', foreignKey: { allowNull: true }, onDelete: 'CASCADE' });
Media.belongsTo(User, { as: 'User', foreignKey: { allowNull: true }, onDelete: 'NO ACTION' });

/* Task_User relation */
User.hasMany(Task, { as: 'SupervisedTasks', foreignKey: { name: 'supervisor', allowNull: false }, onDelete: 'CASCADE' });
Task.belongsTo(User, { as: 'Supervisor', foreignKey: { name: 'supervisor', allowNull: false }, onDelete: 'NO ACTION' });

/* Task_User relation */
User.belongsToMany(Task, { as: 'Tasks', through: 'task_user', onDelete: 'CASCADE' });
Task.belongsToMany(User, { as: 'AssignedUsers', through: 'task_user', onDelete: 'CASCADE' });

/* Meeting_User relation */
User.hasMany(Meeting, { as: 'SupervisedMeetings', foreignKey: { name: 'supervisor', allowNull: false }, onDelete: 'CASCADE' });
Meeting.belongsTo(User, { as: 'Supervisor', foreignKey: { name: 'supervisor', allowNull: false }, onDelete: 'NO ACTION' });

/* Meeting_User relation */
User.belongsToMany(Meeting, { as: 'Meetings', through: 'meeting_user', onDelete: 'CASCADE' });
Meeting.belongsToMany(User, { as: 'Attendees', through: 'meeting_user', onDelete: 'CASCADE' });

/* Committee_User relation */
Committee.hasMany(User, { as: 'Users', foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
User.belongsTo(Committee, { as: 'Committee', foreignKey: { allowNull: true }, onDelete: 'NO ACTION' });

/* Notification_User relation */
User.belongsToMany(Notification, { as: 'Notifications', through: 'notification_user', onDelete: 'CASCADE' });
Notification.belongsToMany(User, { as: 'AssignedUsers', through: 'notification_user', onDelete: 'CASCADE' });

/* Comment_User relation */
User.hasMany(Comment, { as: 'Comments', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Comment.belongsTo(User, { as: 'User', foreignKey: { allowNull: false }, onDelete: 'NO ACTION' });

/* Event_User relation */
User.belongsToMany(Event, { as: 'SubscribedEvents', through: 'event_user', onDelete: 'CASCADE' });
Event.belongsToMany(User, { as: 'Subscribers', through: 'event_user', onDelete: 'CASCADE' });

/* Honor_User relation */
User.belongsToMany(Honor, { as: 'Honors', through: 'honor_user', onDelete: 'CASCADE' });
Honor.belongsToMany(User, { as: 'Users', through: 'honor_user', onDelete: 'CASCADE' });

/* Log_User relation */
User.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
Log.belongsTo(User, { as: 'User', foreignKey: { allowNull: true }, onDelete: 'NO ACTION' });

/* Identity_Log relation */
Identity.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true }, onDelete: 'SET NULL' });
Log.belongsTo(Identity, { as: 'Identity', foreignKey: { allowNull: true }, onDelete: 'NO ACTION' });

/* Comment_Task relation */
Task.hasMany(Comment, { as: 'Comments', foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Comment.belongsTo(Task, { as: 'Task', foreignKey: { allowNull: false }, onDelete: 'NO ACTION' });

/* Event_Media relation */
Event.hasMany(Media, { as: 'Media', foreignKey: { allowNull: true }, onDelete: 'CASCADE' });
Media.belongsTo(Event, { as: 'Event', foreignKey: { allowNull: true }, onDelete: 'NO ACTION' });
