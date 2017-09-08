const passport = require('passport');

// login is our middleware using passport's authenticate middleware (thus not having req,res)
// the strategy is local (username ,pass)
exports.login = passport.authenticate('local',{
    failureRedirect:'/login',// in case authentication fails redirect to login
    failureFlash:'Failed to Login',
    successRedirect:'/',
    successFlash:'You have logged in'
});