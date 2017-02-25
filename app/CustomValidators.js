module.exports = {
   customValidators: {
      /* validator to check if the given value is a phone number */
      isPhoneNumber: function(value) {
         if(!value){
            return false;
         }

         return value.match(/^\+?\d+-?\d+-?\d+$/i) === null ? false : true;
      },
      /* validator to check if the given value is an array */
      isArray: function(value, length) {
         if(!length && length != 0)
            return Array.isArray(value);
         else
            return Array.isArray(value) && value.length == length;
      }
   }
};
