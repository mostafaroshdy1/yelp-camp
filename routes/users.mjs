import express from 'express';
import passport from 'passport';
import { catchAsync } from '../utils/catchAsync.mjs'
import { User } from '../models/user.mjs'
export { router }
import { storeReturnTo } from '../middleware.mjs'
import * as users from '../controllers/users.mjs' // imports from controllers


const router = express.Router();

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)


router.get('/logout', users.logout);


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/auth/google/callback', storeReturnTo,
    passport.authenticate('google', { failureRedirect: '/login' }), users.login);