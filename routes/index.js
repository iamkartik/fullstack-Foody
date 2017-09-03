const express = require('express');
// use express.Router() to create mini submodules instead of using express()
// instead of using app.get('/dogs/') ,app.get('/dogs/name') for all the routes
// you can seperate the entire dog urls in dog.js and use app.use('/dogs', dog.js)
const router = express.Router();
const storeController = require('../controllers/storeController');

const { catchErrors } = require('../handlers/errorHandlers')

router.get('/',storeController.homePage);
router.get('/add',storeController.addStore);
router.post('/add',catchErrors(storeController.createStore));

module.exports = router;
