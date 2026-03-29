import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User, { IUser } from '../models/User'

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL:  '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id })
        if (!user) {
          user = await User.create({
            googleId:    profile.id,
            name:        profile.displayName,
            email:       profile.emails?.[0].value ?? '',
            avatar:      profile.photos?.[0].value ?? '',
            isOnboarded: false,
          })
          console.log(`✅ New user created: ${(user as any).email}`)
        }
        return done(null, user)
      } catch (error) {
        return done(error as Error)
      }
    }
  )
)

passport.serializeUser((user: any, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

export default passport