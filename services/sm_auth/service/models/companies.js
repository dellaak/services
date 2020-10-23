const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const activationToken = require("./activationTokenCompany");
const mailer = require("../lib/mailerCompany");
const mySettings = require("../config/settings.json");
var companyModel;

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
    legalname: {
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
      default: true,
    },
    following:[],
    followers:[],
    selectedColor: {
      type: String,
      default: null,
    }
  });

  companyModel = mongoose.model("companies", schema);
}

function createCompany(username, email, legalName, password, logger, callback) {
  username = username.trim().toLowerCase();
  password = password.trim();
  legalName = legalName.trim().toLowerCase();
  email = email.trim().toLowerCase();
  companyModel
    .findOne({
      $or: [
        {
          email: email,
        },
        {
          username: username,
        },
        {
          legalname: legalName,
        },
      ],
    })
    .then((user) => {
      if (user) {
        let errors = {};
        if (user.username === username) {
          errors.username = "Username already exists";
          callback(errors);
        } else if (user.email === email) {
          errors.email = "Email already exists";
          callback(errors);
        } else if (user.legalname === legalName) {
          errors.legalname = "Company name already exists.";
          callback(errors);
        }
      } else {
        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);

        let company = new companyModel({
          username,
          email,
          legalname: legalName,
          hashed_password: hashedPassword,
        });
        company.save(function (err, user) {
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

function removeCompany(id, company, callback) {
  companyModel.remove({ _id: id, company: company }, function (err) {
    if (err) {
      callback(err);
    } else {
      callback(null, "Company removed");
    }
  });
}

function getCompany(username, password, callback) {
  var criteria =
    username.indexOf("@") === -1 ? { username: username } : { email: username };
  companyModel.findOne(criteria, function (err, user) {
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

function getLoggedInCompany(username, callback) {
  companyModel.findOne({ username: username }, function (err, user) {
    if (user) {
      callback(null, user);
    } else if (err) {
      callback(err);
    } else {
      callback("No such user");
    }
  });
}

function foundCompany(username, email, logger, callback) {
  return companyModel.findOne({ username: username, email: email }, function (
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
  return foundCompany(username, email, logger, (notfound, found) => {
    if (found) {
      return companyModel.findOneAndUpdate(
        { username: username },
        { activated: true },
        function (err, user) {
          if (!err && user && !user.activated) {
            return removeActivationToken(token, (err, deleted) => {
              if (deleted) {
                return callback(null, "Company Activated");
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

function companyExist(username, email, callback) {
  companyModel.findOne(
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
          errors.username = "Username already exists";
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
  createCompany: createCompany,
  removeCompany: removeCompany,
  getCompany: getCompany,
  getLoggedInCompany: getLoggedInCompany,
  activateAccount: activateAccount,
  companyExist: companyExist,
};
