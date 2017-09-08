const mongoose = require('mongoose');

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