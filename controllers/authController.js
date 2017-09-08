const passport = require('passport');

// login is our middleware using passport's authenticate middleware (thus not having req,res)
// the strategy is local (username ,pass)
exports.login = passport.authenticate('local',{
    failureRedirect:'/login',// in case authentication fails redirect to login
    failureFlash:'Failed to Login',
    successRedirect:'/',
    successFlash:'You have logged in'
});

exports.logout = (req,res)=>{
    req.logout();
    req.flash('success','You ar now logged out');
    res.redirect('/');
};
// checks with passport if the user is logged in
exports.isLoggedIn = (req,res,next)=>{
    // check user is authenticatd
    // isAuthenticated is a method put by passport during login
    // returns true if user is logged in
    if(req.isAuthenticated()){
        next(); // logged in 
    }
    req.flash('error','Oops you must be logged in !');
    res.redirect('/login');
};