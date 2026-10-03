const express = require('express');
const router = express.Router();
const {register,login,logout,checkAuth} = require('../Controllers/authController');
const { isLoggedIn } = require('../Middlewares/authMiddleware.js');

router.post('/register', register);

router.post('/login',login);
 
router.post('/logout', logout);

router.get('/check', isLoggedIn, checkAuth);


module.exports = router;