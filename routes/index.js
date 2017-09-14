const express = require('express');
// use express.Router() to create mini submodules instead of using express()
// instead of using app.get('/dogs/') ,app.get('/dogs/name') for all the routes
// you can seperate the entire dog urls in dog.js and use app.use('/dogs', dog.js)
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
// import only  catch errors function from errorHandlers
// object-destructuring
const { catchErrors } = require('../handlers/errorHandlers')


// wrap async functions in catch errors function as they don't have an explicit try catch block
// using function composition
router.get('/',catchErrors(storeController.getStores));
router.get('/stores',catchErrors(storeController.getStores));
// adding a new one with pagination
router.get('/stores/page/:page',catchErrors(storeController.getStores));
// showing the add page to the user in ase they are already logged in
router.get('/add',authController.isLoggedIn,
                    storeController.addStore);
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

router.get('/tags',catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag',catchErrors(storeController.getStoresByTag));

router.get('/login',userController.loginForm);
router.post('/login',authController.login);
router.get('/logout',authController.logout);

router.get('/register',userController.registerForm);
// validate the data -> add the user in db -> login the user 
router.post('/register',userController.validateRegister,
                        catchErrors(userController.register),
                        authController.login);

router.get('/account',authController.isLoggedIn,
                        userController.account);
router.post('/account',catchErrors(userController.updateAccount));

router.post('/account/forgot',catchErrors(authController.forgot));

router.get('/account/reset/:token',catchErrors(authController.reset));

router.post('/account/reset/:token',authController.confirmedPasswords,
                                        catchErrors(authController.update));

router.get('/map',storeController.map);                                        
router.get('/hearts',authController.isLoggedIn,
                        catchErrors(storeController.heartedStores));

router.post('/reviews/:id',authController.isLoggedIn,
                            catchErrors(reviewController.addReview)); 

router.get('/top',catchErrors(storeController.topStores));                                                   

// API Endpoints
router.get('/api/search',catchErrors(storeController.searchStores));
router.get('/api/stores/near',catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart',catchErrors(storeController.heartStore));

module.exports = router;
