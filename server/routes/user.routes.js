import express from 'express';
import { signUp, login, logout, current } from '../controllers/user.controllers.js';
import passport from 'passport';
import jwt from 'jsonwebtoken'


const router = express.Router()



router.get('/google', passport.authenticate("google", { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate("google", { failureRedirect: '/login' }),
   (req, res) => {
      const user = req.user;
      const token = jwt.sign(
         { id: user._id },
         process.env.SECRET_KEY,
         { expiresIn: '30d' }
      );

      res.cookie("token", token, {
         maxAge: 30 * 24 * 60 * 60 * 1000,
                       // Optional but safe
      });

      res.redirect(`${process.env.FRONTEND_URL}/trading`);
   }
)

router.post('/signup', signUp)
router.post('/login', login)
router.post('/logout', logout)
router.get('/current', current)


export default router;

