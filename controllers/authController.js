const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

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
    req.flash('success','You are now logged out');
    res.redirect('/');
};
// checks with passport if the user is logged in
exports.isLoggedIn = (req,res,next)=>{
    // check user is authenticatd
    // isAuthenticated is a method put by passport during login
    // returns true if user is logged in
    if(req.isAuthenticated()){
        next(); // logged in 
        return;
    }
    req.flash('error','Oops you must be logged in !');
    res.redirect('/login');
};

exports.forgot = async (req,res)=>{
    // see if user exists
    const user = await User.findOne({ email:req.body.email });
    if(!user){
        req.flash('error','A password reset has been sent to email provided');
        res.redirect('/login');
    }
    
    // set reset token and expiry on account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000 ;// 1 hour from now
    await user.save();
    // send email with token
    // creating the reset link
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    // send email to the user with the link
    // user contains email , filename is the html rendering file 
    await mail.send({
        user,
        subject:'Password Reset',
        resetURL,
        filename:'password-reset'
    });
    req.flash('success',`You have been emailed a password reset link.`);
    
    // redirect to login
    res.redirect('/login');
};

exports.reset = async (req,res) =>{
    // check if token is valid and not expired
    const user = await User.findOne({ 
                        resetPasswordToken:req.params.token,
                        // check if expires is greater than current time,else the token is considered expired
                        resetPasswordExpires:{ $gt:Date.now() } 
                });
    // if the token is invalid/expired , send them back to login page
    if(!user){
        req.flash('error','The password reset token is invalid or has expired. Please try again.')
        res.redirect('/login');
    }            
    // else render the reset page
    res.render('reset',{title:'Reset Password'});
};

// if passwords match or not
exports.confirmedPasswords = (req,res,next)=>{
    if(req.body.password === req.body['password-confirm']){
        next();
        return;// stop further execution
    }

    req.flash('error','The passwords do not match');
    res.redirect('back');
};

exports.update = async (req,res)=>{
    // again check if user token is valid/ expired
    const user = await User.findOne({ 
                        resetPasswordToken:req.params.token,
                        // check if expires is greater than current time,else the token is considered expired
                        resetPasswordExpires:{ $gt:Date.now() } 
                });
    if(!user){
        req.flash('error','The password reset token has expired. Please try again.')
        res.redirect('/login');
    }            

    // passport provides a method setPassword to save a password , has to be called on user 
    // it is callback based to promisify before using
    const setPassword = promisify(user.setPassword,user);
    await setPassword(req.body.password);
    // remove the fields from user object , setting undefined removes them
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // update the db
    const updatedUser = await user.save();
    // passport automatically logs in th user in case user is provided
    // This function is primarily used when users sign up, during which req.login() can be invoked
    // to automatically log in the newly registered user.http://passportjs.org/docs/login
    await req.login(updatedUser);
    
    req.flash('success','Your password has been updated');
    res.redirect('/');
};