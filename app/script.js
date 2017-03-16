module.exports.errorFormat = function(errors) {
   if (errors) {
      for (var i = 0; i < errors.length; i++) {
         errors[i].type = errors[i].msg;
         delete errors[i].msg;
      }

      return errors;
   }
};
