const express = require('express');
// use express.Router() to create mini submodules instead of using express()
// instead of using app.get('/dogs/') ,app.get('/dogs/name') for all the routes
// you can seperate the entire dog urls in dog.js and use app.use('/dogs', dog.js)
const router = express.Router();

// Do work here
// req.query for query params, req.body for form , req.params for path params
router.get('/', (req, res) => {
  // use res.json() to send json
  // res.send('Hey! It works!');
    res.render('hello',{
      name:"Kartik",
      title:"Food is love"});
});

module.exports = router;
