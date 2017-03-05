/**
* This function returns the data needed for testing;
* @return {JSON} The data needed for testing
* @ignore
*/
module.exports = function() {
   var data = {};

   /*****************
   * Creating Users *
   *****************/
   data.users = [];

   var i;
   var c = 1;
   /* Admin */
   for (i = 0; i < 1; i++) {
      var admin = {
         email: 'ex' + c + '@outlook.com',
         password: '1234567',
         type: 'Admin',
         first_name : 'First Name ' + c,
         last_name : 'Last Name ' + c,
         birthdate : '1111-11-11',
         phone_number: '+200000000000',
         gender : 'Male',
         IEEE_membership_ID : null,
         settings: {
            public: {
               background: "The background of the profile"
            },
            private: {
               notifications: {
                  email: {
                     comment: "boolean sent email on comments",
                     lastSent: "timestamp",
                     meetingDay: "boolean sent email on meeting day",
                     taskDeadline: "boolean sent a reminder email before the task deadline",
                     taskAssignment: "boolean sent email on task assignment",
                     meetingAssignment: "boolean sent email on meetings"
                  }
               }
            }
         }
      };

      data.users.push(admin);
      c++;
   }

   /* Upper Board */
   for (i = 0; i < 2; i++) {
      var upper = {
         email: 'ex' + c + '@outlook.com',
         password: '1234567',
         type: 'Upper Board',
         first_name : 'First Name ' + c,
         last_name : 'Last Name ' + c,
         birthdate : '1111-11-11',
         phone_number: '+200000000000',
         gender : 'Male',
         IEEE_membership_ID : null,
         settings: {
            public: {
               background: "The background of the profile"
            },
            private: {
               notifications: {
                  email: {
                     comment: "boolean sent email on comments",
                     lastSent: "timestamp",
                     meetingDay: "boolean sent email on meeting day",
                     taskDeadline: "boolean sent a reminder email before the task deadline",
                     taskAssignment: "boolean sent email on task assignment",
                     meetingAssignment: "boolean sent email on meetings"
                  }
               }
            }
         }
      };

      data.users.push(upper);
      c++;
   }

   /* High Board */
   for (i = 0; i < 4; i++) {
      var high = {
         email: 'ex' + c + '@outlook.com',
         password: '1234567',
         type: 'High Board',
         first_name : 'First Name ' + c,
         last_name : 'Last Name ' + c,
         birthdate : '1111-11-11',
         phone_number: '+200000000000',
         gender : 'Male',
         IEEE_membership_ID : null,
         committee_id: (i+1),
         settings: {
            public: {
               background: "The background of the profile"
            },
            private: {
               notifications: {
                  email: {
                     comment: "boolean sent email on comments",
                     lastSent: "timestamp",
                     meetingDay: "boolean sent email on meeting day",
                     taskDeadline: "boolean sent a reminder email before the task deadline",
                     taskAssignment: "boolean sent email on task assignment",
                     meetingAssignment: "boolean sent email on meetings"
                  }
               }
            }
         }
      };

      data.users.push(high);
      c++;
   }

   /* Member */
   for (i = 0; i < 8; i++) {
      var member = {
         email: 'ex' + c + '@outlook.com',
         password: '1234567',
         type: 'Member',
         first_name : 'First Name ' + c,
         last_name : 'Last Name ' + c,
         birthdate : '1111-11-11',
         phone_number: '+200000000000',
         gender : 'Male',
         IEEE_membership_ID : null,
         committee_id: (i%4) + 1,
         settings: {
            public: {
               background: "The background of the profile"
            },
            private: {
               notifications: {
                  email: {
                     comment: "boolean sent email on comments",
                     lastSent: "timestamp",
                     meetingDay: "boolean sent email on meeting day",
                     taskDeadline: "boolean sent a reminder email before the task deadline",
                     taskAssignment: "boolean sent email on task assignment",
                     meetingAssignment: "boolean sent email on meetings"
                  }
               }
            }
         }
      };

      data.users.push(member);
      c++;
   }


   /*********************
   * Creating Committee *
   *********************/
   data.committees = [];
   for (i = 0; i < 4; i++) {
      var committee = {
         name: "Committee " + (i+1),
         description: "Description " + (i+1)
      };

      data.committees.push(committee);
   }


   /*******************
   * Creating Tokens *
   *******************/
   data.identities = [];
   for (i = 0; i < 15; i++) {
      var jwt = require('jsonwebtoken');

      var now = new Date();
      var exp_date = new Date();
      exp_date.setDate(exp_date.getDate() + 1);

      /* generating a login token */
      var payload = {
          type: 'login-token',
          userAgent: 'Web',
          userId: (i+1),
          exp: exp_date.getTime()
      };

      var token = jwt.sign(payload, process.env.JWTSECRET);

      var identity = {
          token: token,
          token_exp_date: exp_date,
          user_agent: 'Web',
          last_logged_in: now,
          user_id: (i+1)
      };

      data.identities.push(identity);
   }

   /*****************
   * Creating Tasks *
   ******************/
   data.tasks = [];
   data.tasks_users = [];
   for (var i = 1; i <= 4; i++) {
      var task = {
         title: "Task " + i,
         description: "Description " + i,
         deadline: "2017-3-25 08:00:00",
         priority: 5,
         status: "New",
         evaluation: 3,
         supervisor: i
      };

      data.tasks.push(task);
   }

   data.tasks_users[0].push([3, 6, 9]);
   data.tasks_users[1].push([4, 7, 10]);
   data.tasks_users[2].push([]);
   data.tasks_users[3].push([8]);

   /********************
   * Creating Comments *
   *********************/
   data.comments = [];
   for (var i = 0; i < 8; i++) {
      var comment = {
         content: "Content " + (i + 1),
         user_id: (i + 1),
         task_id: (i % 2) +  1
      };

      data.comments.push(comment);
   }

   return data;
};
