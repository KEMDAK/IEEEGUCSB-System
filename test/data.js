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


   /******************
   * Creating Tokens *
   ******************/
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

   /****************************
   * Creating Profile Pictures *
   ****************************/
   data.profile_pictures = [];
   for (var i = 0; i < 15; i++) {
      var profile_picture = {
         type: "Image",
         url: "url " + (i + 1),
         user_id: (i + 1)
      };

      data.profile_pictures.push(profile_picture);
   }

   /*****************
   * Creating Tasks *
   ******************/
   data.tasks = [];
   data.tasks_users = [];
   for (i = 1; i <= 4; i++) {
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

   data.tasks_users.push([3, 6, 9]);
   data.tasks_users.push([4, 7, 10]);
   data.tasks_users.push([]);
   data.tasks_users.push([8]);

   /********************
   * Creating Comments *
   *********************/
   data.comments = [];
   for (i = 0; i < 8; i++) {
      var comment = {
         content: "Content " + (i + 1),
         user_id: (i + 1),
         task_id: (i % 2) +  1
      };

      data.comments.push(comment);
   }

   /*********************
   * Creating Meetings *
   *********************/
   data.meetings = [];
   for (i = 0; i < 5; i++) {
      var meeting = {
         start_date: "2017-2-25 08:00:00",
         end_date: "2017-2-25 10:00:00",
         goals: [
         {
            name: "Goal 1",
            isDone: false
         },
         {
            name: "Goal 2",
            isDone: false
         },
         {
            name: "Goal 3",
            isDone: false
         }
         ],
         location: "Location " + (i+1),
         description: "Description " + (i+1),
         supervisor: (i+1),
         evaluation: (i+1)
      };

      data.meetings.push(meeting);
   }

   data.meeting_user = [];
   for (i = 0; i < 5; i++) {
      var obj = {
         meeting_id: (i+1),
         user_id: (i+1) + 4
      };

      data.meeting_user.push([i+1+4, i+1+8]);
   }

   /*****************************
    * Creating unassigned users *
    *****************************/
    data.unassigned_users = [];
    c = 1;
    /* Admin */
    for (i = 0; i < 1; i++) {
       var unassigned_admin = {
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

       data.unassigned_users.push(unassigned_admin);
       c++;
    }

    /* Upper Board */
    for (i = 0; i < 2; i++) {
       var unassigned_upper = {
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

       data.unassigned_users.push(unassigned_upper);
       c++;
    }

    /* High Board */
    for (i = 0; i < 4; i++) {
       var unassigned_high = {
          email: 'ex' + c + '@outlook.com',
          password: '1234567',
          type: 'High Board',
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

       data.unassigned_users.push(unassigned_high);
       c++;
    }

    /* Member */
    for (i = 0; i < 8; i++) {
       var unassigned_member = {
          email: 'ex' + c + '@outlook.com',
          password: '1234567',
          type: 'Member',
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

       data.unassigned_users.push(unassigned_member);
       c++;
    }


   return data;
};
