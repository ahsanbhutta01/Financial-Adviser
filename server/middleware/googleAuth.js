import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'
import User from '../models/user.model.js'
dotenv.config()


passport.use(new GoogleStrategy({
   clientID:process.env.GOOGLE_CLIENT_ID,
   clientSecret:process.env.GOOGLE_CLIENT_SECRET,
   callbackURL:process.env.CALLBACK_URL
},

async function(accessToken, refreshToken, profile, cb){
   try {
      const email = profile.emails[0].value.toLowerCase()
      let user = await User.findOne({email})

      if(!user){
         user = await new User({
            name:profile.displayName,
            email: email
         })
         await user.save()
      }

      return cb(null, user)
   } catch (error) {
      console.error(error.message)
      return cb(error, null)
   }
}
))

passport.serializeUser((user, done)=>{
   return done(null, user._id)
})

passport.deserializeUser(async (id, done)=>{
   const user = await User.findById(id)
   done(null, user)

})