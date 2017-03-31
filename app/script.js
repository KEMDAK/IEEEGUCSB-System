module.exports.errorFormat = function(errors) {
   if (errors) {
      for (var i = 0; i < errors.length; i++) {
         errors[i].type = errors[i].msg;
         delete errors[i].msg;
      }

      return errors;
   }
};

module.exports.generatePassword = function(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    var pass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }
    return pass;
    }
