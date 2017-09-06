const express = require('express');
// use express.Router() to create mini submodules instead of using express()
// instead of using app.get('/dogs/') ,app.get('/dogs/name') for all the routes
// you can seperate the entire dog urls in dog.js and use app.use('/dogs', dog.js)
const router = express.Router();
const storeController = require('../controllers/storeController');
// import only  catch errors function from errorHandlers
// object-destructuring
const { catchErrors } = require('../handlers/errorHandlers')


// wrap async functions in catch errors function as they don't have an explicit try catch block
// using function composition
router.get('/',catchErrors(storeController.getStores));
router.get('/stores',catchErrors(storeController.getStores));
router.get('/add',storeController.addStore);
// first the file goes to multer to handle uploaded data , 
// then the image is resized and then data stored in db
router.post('/add',storeController.upload,
                    catchErrors(storeController.resize),
                    catchErrors(storeController.createStore));
router.post('/add/:id',storeController.upload,
                    catchErrors(storeController.resize),
                    catchErrors(storeController.updateStore));
router.get('/stores/:id/edit',catchErrors(storeController.editStore));

router.get('/stores/:slug',catchErrors(storeController.getStoreBySlug));

module.exports = router;
