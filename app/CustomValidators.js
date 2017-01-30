module.exports = {
   customValidators: {
      /* validator to check if the given value is a phone number */
      isPhoneNumber: function(value) {
         if(!value){
            return false;
         }

         return value.match(/\+?\d+[-.]?\d+[-.]?\d+| /i);
      }
   }
};
