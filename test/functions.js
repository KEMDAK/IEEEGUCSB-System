module.exports = function(sq) {
   return {
      clearTable: function(table, callback) {
         sq.query('SET FOREIGN_KEY_CHECKS = 0').then(function() {
            return sq.query('truncate table ' + table);
         }).then(function() {
            return sq.query('SET FOREIGN_KEY_CHECKS = 1');
         }).then(function() {
            callback();
         });
      },
      clearAll: function(callback) {
         sq.sync({ force: true }).then(function() {
            callback();
         });
      }
   };
};
