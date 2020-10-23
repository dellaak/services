const mongoose = require("mongoose");
const mySettings = require("../config/settings.json");
const bcrypt = require("bcryptjs");
const activationToken = require("./activationToken");
const mailer = require("../lib/mailer");
var userModel;

activationToken.init(mySettings);

function init(settings) {
  mongoose.connect(settings.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let schema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: "",
    },
    hashed_password: String,
    phone: {
      type: String,
    },
    description: {
      type: String,
      default: "",
    },
    socialsList: [],
    highlights: [],
    showPhone: {
      type: Boolean,
      default: false,
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showQrCode: {
      type: Boolean,
      default: false,
    },
    activated: {
      type: Boolean,
      default: false,
    },
    isCompany: {
      type: Boolean,
      default: false,
    },
    following:[],
    followers:[],
    selectedColor: {
      type: String,
      default: null,
    }
  });

  userModel = mongoose.model("users", schema);
}




function createUser(username, email, password, logger, callback) {
  username = username.trim().toLowerCase();
  password = password.trim();
  email = email.trim().toLowerCase();
  userModel
    .findOne({
      $or: [
        {
          email: email,
        },
        {
          username: username,
        },
      ],
    })
    .then((user) => {
      if (user) {
        let errors = {};
        if (user.username === username) {
          errors.username = "User Name already exists";
          callback(errors);
        }
        if (user.email === email) {
          errors.email = "Email already exists";
          callback(errors);
        }
      } else {
        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);

        let user = new userModel({
          username,
          email,
          hashed_password: hashedPassword,
        });
        user.save(function (err, user) {
          if (err) {
            callback(err);
          } else {
            activationToken.createActivationToken(
              user._id,
              user.username,
              user.email,
              (err, res) => {
                if (res) {
                  mailer.mailer(
                    email,
                    res.activationToken,
                    logger,
                    (emailerr, sent) => {
                      if (sent) {
                        callback(null, "Added user");
                      } else {
                        callback(emailerr);
                      }
                    }
                  );
                } else {
                  callback(err);
                }
              }
            );
          }
        });
      }
    });
}

function removeUser(id, company, callback) {
  userModel.remove({ _id: id, company: company }, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null, "User removed");
    }
  });
}

function getUser(username, password, callback) {
  var criteria =
    username.indexOf("@") === -1 ? { username: username } : { email: username };
  userModel.findOne(criteria, function (err, user) {
    if (!err && user) {
      callback(
        null,
        bcrypt.compareSync(password, user.hashed_password) ? user : null
      );
    } else {
      callback("No such user");
    }
  });
}

function getLoggedInUser(username, callback) {
  userModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user);
    } else {
      callback("No such user");
    }
  });
}

function foundUser(username, email, logger, callback) {
  return userModel.findOne({ username: username, email: email }, function (
    err,
    user
  ) {
    if (!err && user) {
      return activationToken.findToken(user._id, logger, function (
        error,
        found
      ) {
        if (found) {
          return callback(null, true);
        } else {
          return callback(error);
        }
      });
    } else {
      callback(err);
    }
  });
}

function activateAccount(username, email, token, logger, callback) {
  return foundUser(username, email, logger, (notfound, found) => {
    if (found) {
      return userModel.findOneAndUpdate(
        { username: username },
        { activated: true },
        function (err, user) {
          if (!err && user && !user.activated) {
            return removeActivationToken(token, (err, deleted) => {
              if (deleted) {
                return callback(null, "User Activated");
              } else {
                return callback(err);
              }
            });
          } else {
            return callback(err);
          }
        }
      );
    } else {
      return callback(notfound);
    }
  });
}

function removeActivationToken(token, callback) {
  activationToken.removeToken(token, (err, res) => {
    if (res) {
      return callback(null, true);
    } else {
      return callback("No token found" + err);
    }
  });
}

function userExist(username, email, callback) {
  userModel.findOne(
    {
      $or: [
        {
          email: email,
        },
        {
          username: username,
        },
      ],
    },
    (err, user) => {
      if (user) {
        let errors = {};
        if (user.username === username) {
          errors.username = "Company Name already exists";
          callback(errors);
        }
        if (user.email === email) {
          errors.email = "Email already exists";
          callback(errors);
        }
      } else if (!err && !user) {
        return callback(null, null, true);
      } else {
        return callback(err);
      }
    }
  );
}


module.exports = {
  init: init,
  createUser: createUser,
  removeUser: removeUser,
  getUser: getUser,
  getLoggedInUser: getLoggedInUser,
  activateAccount: activateAccount,
  userExist: userExist,
};
