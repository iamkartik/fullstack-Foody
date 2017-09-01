const express = require('express');
// use express.Router() to create mini submodules instead of using express()
// instead of using app.get('/dogs/') ,app.get('/dogs/name') for all the routes
// you can seperate the entire dog urls in dog.js and use app.use('/dogs', dog.js)
const router = express.Router();
const storeController = require('../controllers/storeController');

// Do work here
// req.query for query params, req.body for form , req.params for path params

// for every req that comes to / , it goes to custom middleware - myMiddleware
// after that the next function it get's passed to is homePage
// the two functions represent the order of execution
// middleware after req and before response
router.get('/',storeController.myMiddleware,storeController.myMiddleware2,storeController.homePage);

module.exports = router;
