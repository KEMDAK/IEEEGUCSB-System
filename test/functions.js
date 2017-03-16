module.exports = function(sq) {
   return {
      clearTable: function(table, callback) {
         sq.query('DELETE FROM ' + table).then(function() {
            return sq.query('ALTER TABLE ' + table + ' AUTO_INCREMENT = 1');
         }).then(function() {
            callback();
         }).catch(function(err) {
            callback(err);
         });
      },
      clearAll: function(callback) {
         sq.sync({ force: true }).then(function() {
            callback();
         }).catch(function(err){
            callback(err);
         });
      }
   };
};
