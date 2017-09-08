const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// this file defines the strategy and the params paspport uses to authenticate
// The createStrategy is responsible to setup passport-local 
passport.use(User.createStrategy());
// serializeUser determines, which data of the user object should be stored in the session
passport.serializeUser(User.serializeUser());
// In deserializeUser that key is matched with the in memory array / database or any data resource.
// The fetched object is attached to the request object as req.user
// https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
passport.deserializeUser(User.deserializeUser());