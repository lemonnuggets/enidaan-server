const passport = require("passport");
const refresh = require("passport-oauth2-refresh");
const { Strategy: LocalStrategy } = require("passport-local");
const moment = require("moment");

const Doctor = require("../models/Doctor");

passport.serializeUser((doctor, done) => {
  done(null, doctor.id);
});

passport.deserializeUser((id, done) => {
  Doctor.findById(id, (err, doctor) => {
    done(err, doctor);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ userNameField: "email" }, (email, password, done) => {
    Doctor.findOne({ email: email.toLowerCase() }, (err, doctor) => {
      if (err) {
        return done(err);
      }
      if (!doctor) {
        return done(null, false, { msg: `Email ${email} not found.` });
      }
      if (!doctor.password) {
        return done(null, false, {
          msg: "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your doctor profile.",
        });
      }
      doctor.comparePassword(password, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(null, doctor);
        }
        return done(null, false, { msg: "Invalid email or password." });
      });
    });
  })
);

/**
 * OAuth Strategy Overview
 *
 * - Doctor is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in doctor.
 * - Doctor is not logged in.
 *   - Check if it's a returning doctor.
 *     - If returning doctor, sign in and we are done.
 *     - Else check if there is an existing account with doctor's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/doctor/login");
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split("/")[2];
  const token = req.doctor.tokens.find((token) => token.kind === provider);
  if (token) {
    // Is there an access token expiration and access token expired?
    // Yes: Is there a refresh token?
    //     Yes: Does it have expiration and if so is it expired?
    //       Yes, Quickbooks - We got nothing, redirect to res.redirect(`/auth/${provider}`);
    //       No, Quickbooks and Google- refresh token and save, and then go to next();
    //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);
    // No: we are good, go to next():
    if (
      token.accessTokenExpires &&
      moment(token.accessTokenExpires).isBefore(moment().subtract(1, "minutes"))
    ) {
      if (token.refreshToken) {
        if (
          token.refreshTokenExpires &&
          moment(token.refreshTokenExpires).isBefore(
            moment().subtract(1, "minutes")
          )
        ) {
          res.redirect(`/auth/${provider}`);
        } else {
          refresh.requestNewAccessToken(
            `${provider}`,
            token.refreshToken,
            (err, accessToken, refreshToken, params) => {
              Doctor.findById(req.doctor.id, (err, doctor) => {
                doctor.tokens.some((tokenObject) => {
                  if (tokenObject.kind === provider) {
                    tokenObject.accessToken = accessToken;
                    if (params.expires_in)
                      tokenObject.accessTokenExpires = moment()
                        .add(params.expires_in, "seconds")
                        .format();
                    return true;
                  }
                  return false;
                });
                req.doctor = doctor;
                doctor.markModified("tokens");
                doctor.save((err) => {
                  if (err) console.log(err);
                  next();
                });
              });
            }
          );
        }
      } else {
        res.redirect(`/auth/${provider}`);
      }
    } else {
      next();
    }
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
