/**
*  @mixin Task
*  @property {String}  title       The task's title 
*  @property {String}  description The task's description
*  @property {Date}    deadline    The task's deadline  
*  @property {INTEGER} priority    The task's priority
*  @property {BOOLEAN} status      The task's status ('Done','Undone')
*  @property {INTEGER} evaluation  The task's evaluation
*/

/**
* This Function define the model of the task Object
* @param  {sequelize} connection the instance of the sequelize Object
* @ignore
*/
module.exports.defineTask = function(sequelize) {
     var Sequelize = require("sequelize");  

     module.exports.Task = sequelize.define('task', {
          title: {
               type: Sequelize.STRING(45),
               allowNull: false
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          deadline: {
               type: Sequelize.DATE,
               allowNull: false
          },
          priority: {
               type: Sequelize.INTEGER,
               allowNull: false
          },
          status: {
               type: Sequelize.ENUM('DONE', 'UNDONE'),
               allowNull: false
          },
          evaluation: {
               type: Sequelize.INTEGER,
               allowNull: true
          }
        
     },
     {
          paranoid: true,
          underscored: true,
          underscoredAll: true,
          instanceMethods:
          /** @lends Task.prototype */
          {
             
               /**
               * This function checks if the task is done.
               * @return {Boolean} true if the task is done.
               */
               isDone: function() {
                    return this.status === 'Done';
               },
    
              
          }
     });
};
