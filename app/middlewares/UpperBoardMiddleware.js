/**
* This is a middleware that validates that the user is an upper board member
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once the validation succeed
* @ignore
*/
module.exports = function(req, res, next)
{
   if(req.user.type === 'Upper Board')
   {
      next();
   }
   else
   {
      res.status(403).json(
         {
            status:'failed',
            message: 'Access denied'
         });
   }
};
