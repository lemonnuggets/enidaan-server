const passport = require("passport");
// const _ = require("lodash");
const validator = require("validator");
const User = require("../models/User");

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/login", {
    title: "Login",
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/");
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.redirect("/");
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/signup", {
    title: "Create Account",
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      req.flash("errors", {
        msg: "Account with that email address already exists.",
      });
      return res.redirect("/signup");
    }
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render("account/profile", {
    title: "Account Management",
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/account");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user.email !== req.body.email) user.emailVerified = false;
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.location = req.body.location || "";
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash("errors", {
            msg: "The email address you have entered is already associated with an account.",
          });
          return res.redirect("/account");
        }
        return next(err);
      }
      req.flash("success", { msg: "Profile information has been updated." });
      res.redirect("/account");
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/account");
  }

  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Password has been changed." });
      res.redirect("/account");
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.deleteOne({ _id: req.user.id }, (err) => {
    if (err) {
      return next(err);
    }
    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.redirect("/");
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  const validationErrors = [];
  if (!validator.isHexadecimal(req.params.token))
    validationErrors.push({ msg: "Invalid Token.  Please retry." });
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/forgot");
  }

  User.findOne({ passwordResetToken: req.params.token })
    .where("passwordResetExpires")
    .gt(Date.now())
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", {
          msg: "Password reset token is invalid or has expired.",
        });
        return res.redirect("/forgot");
      }
      res.render("account/reset", {
        title: "Password Reset",
      });
    });
};

/**
 * GET /account/verify/:token
 * Verify email address
 */
exports.getVerifyEmailToken = (req, res, next) => {
  if (req.user.emailVerified) {
    req.flash("info", { msg: "The email address has been verified." });
    return res.redirect("/account");
  }

  const validationErrors = [];
  if (req.params.token && !validator.isHexadecimal(req.params.token))
    validationErrors.push({ msg: "Invalid Token.  Please retry." });
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/account");
  }

  if (req.params.token === req.user.emailVerificationToken) {
    User.findOne({ email: req.user.email })
      .then((user) => {
        if (!user) {
          req.flash("errors", {
            msg: "There was an error in loading your profile.",
          });
          return res.redirect("back");
        }
        user.emailVerificationToken = "";
        user.emailVerified = true;
        user = user.save();
        req.flash("info", {
          msg: "Thank you for verifying your email address.",
        });
        return res.redirect("/account");
      })
      .catch((error) => {
        console.log(
          "Error saving the user profile to the database after email verification",
          error
        );
        req.flash("errors", {
          msg: "There was an error when updating your profile.  Please try again later.",
        });
        return res.redirect("/account");
      });
  } else {
    req.flash("errors", {
      msg: "The verification link was invalid, or is for a different account.",
    });
    return res.redirect("/account");
  }
};
