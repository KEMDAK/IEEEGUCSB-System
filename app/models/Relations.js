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
User.hasMany(Identity, { as: 'Identities', foreignKey: { allowNull: false } });
Identity.belongsTo(User, { as: 'User', foreignKey: { allowNull: false } });

/* Media_User relation */
User.hasMany(Media, { as: 'Media', foreignKey: { allowNull: true } });
Media.belongsTo(User, { as: 'User', foreignKey: { allowNull: true } });

/* Task_User relation */
User.hasMany(Task, { as: 'SupervisedTasks', foreignKey: { name: 'supervisor', allowNull: true } });
Task.belongsTo(User, { as: 'Supervisor', foreignKey: { name: 'supervisor', allowNull: true } });

/* Task_User relation */
User.belongsToMany(Task, { as: 'Tasks', through: 'task_user' });
Task.belongsToMany(User, { as: 'AssignedUsers', through: 'task_user' });

/* Meeting_User relation */
User.hasMany(Meeting, { as: 'SupervisedMeetings', foreignKey: { name: 'supervisor', allowNull: true } });
Meeting.belongsTo(User, { as: 'Supervisor', foreignKey: { name: 'supervisor', allowNull: true } });

/* Meeting_User relation */
User.belongsToMany(Meeting, { as: 'Meetings', through: 'meeting_user' });
Meeting.belongsToMany(User, { as: 'Attendees', through: 'meeting_user' });

/* Committee_User relation */
User.belongsTo(Committee, { as: 'Committee', foreignKey: { allowNull: true } });
Committee.hasMany(User,   { as: 'Users', foreignKey: { allowNull: true } });

/* Notification_User relation */
User.belongsToMany(Notification, { as: 'Notifications', through: 'notification_user' });
Notification.belongsToMany(User, { as: 'AssignedUsers', through: 'notification_user' });

/* Comment_User relation */
User.hasMany(Comment, { as: 'Comments', foreignKey: { allowNull: false } });
Comment.belongsTo(User, { as: 'User', foreignKey: { allowNull: false } });

/* Event_User relation */
User.belongsToMany(Event, { as: 'SubscribedEvents', through: 'event_user' });
Event.belongsToMany(User, { as: 'Subscribers', through: 'event_user' });

/* Honor_User relation */
User.belongsToMany(Honor, { as: 'Honors', through: 'honor_user' });
Honor.belongsToMany(User, { as: 'Users', through: 'honor_user' });

/* Log_User relation */
User.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true } });
Log.belongsTo(User, { as: 'User', foreignKey: { allowNull: true } });

/* Identity_Log relation */
Identity.hasMany(Log, { as: 'Logs', foreignKey: { allowNull: true } });
Log.belongsTo(Identity, { as: 'Identity', foreignKey: { allowNull: true } });

/* Comment_Task relation */
Task.hasMany(Comment, { as: 'Comments', foreignKey: { allowNull: false } });
Comment.belongsTo(Task, { as: 'Task', foreignKey: { allowNull: false } });

/* Event_Media relation */
Event.hasMany(Media, { as: 'Media', foreignKey: { allowNull: true } });
Media.belongsTo(Event, { as: 'Event', foreignKey: { allowNull: true } });
