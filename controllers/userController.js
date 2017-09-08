const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');


exports.loginForm = (req,res)=>{
    res.render('login',{title:'Login'})
};

exports.registerForm = (req,res)=>{
    res.render('register',{title:'Register'});
};

exports.validateRegister = (req,res,next)=>{
    // using express-validator , checking for script tags etc . 
    // express validator imprted and added in app.js , thus the methods are directly exposed in req
    // https://github.com/ctavan/express-validator can be deprecated , TODO:: update according to new API
    req.sanitizeBody('name');
    req.checkBody('name','You must provide a name !').notEmpty(); // check if the name is empty || not
    req.checkBody('email','Email is not valid').notEmpty().isEmail();
    // normalize email makes all emails in single format xyz@gmail.com and xyz@googlemail.com are same gmail address
    req.sanitizeBody('email').normalizeEmail({
        remove_dots:false,
        remove_extension:false,
        gmail_remove_subaddress:false
    });
    req.checkBody('password','Password cannot be empty').notEmpty();
    req.checkBody('password-confirm','Confirm Password cannot be empty').notEmpty();
    // check if password equals
    req.checkBody('password-confirm','Oops ! the passwords do not match').equals(req.body.password);
    // in case any validation fails get all the errors
    const errors = req.validationErrors();
    if(errors){
        // add the errors in flash
        req.flash('error',errors.map( (err)=>err.msg ));
        // re-render the register page passing the req.body to populate the fields 
        // passing flashes as this is the same req 
        res.render('register',{ title:'Register',body:req.body,flashes:req.flash() });
        return;
    }

    next();
};

exports.register = async (req,res,next)=>{
    const user = new User({ email:req.body.email, name:req.body.name });
    // not calling save instead calling .register ( passport function) it will hash the password and save it
    // passport local returns a callback instead of a promise , using promisify to return a promise
    // User.register is the method which we want to bind to User 
    const registerPromise = promisify(User.register,User);
    // passing the user object created and password to register
    await registerPromise(user, req.body.password);
    // pass to login
    next();
};
