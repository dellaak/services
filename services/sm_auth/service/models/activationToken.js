const mongoose = require("mongoose");
const jwt = require("jwt-simple");
const settings = require("../config/settings.json");

var activationTokenModel;

function init(settings) {
  mongoose.connect(settings.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let schema = mongoose.Schema({
    userId: String,
    activationToken: {
      type: String,
      required: true,
      unique: true,
    },
    expires: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default:"personal"
    },
  });

  activationTokenModel = mongoose.model("activationToken", schema);
}

function createActivationToken(id, username, email, callback) {
  gen_token(username, email, (res) => {
    if (res) {
      let activeToken = new activationTokenModel({
        userId: id,
        activationToken: res.token,
        expires: res.expires,
        type:"personal"
      });
      activeToken.save(function (err, restoken) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, restoken);
        }
      });
    } else {
      callback(err);
    }
  });
}

function removeToken(token, callback) {
  activationTokenModel.findOne(
    { activationToken: token },
    (founderr, found) => {
      if (found) {
        activationTokenModel.remove({ _id: found._id }, function (err, _res) {
          if (err) {
            callback(err);
          } else {
            callback(null, "Token removed");
          }
        });
      } else {
        callback(founderr);
      }
    }
  );
}

function findToken(id, logger, callback) {
  return activationTokenModel.findOne({ userId: id }, function (err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      return callback(null, true);
    } else {
      return callback("no token");
    }
  });
}

//PRIVATE FUNCTIONS
function gen_token(username, email, callback) {
  let expires = expiresIn(settings.token_activation_lifetime);
  let token = jwt.encode(
    {
      username: username,
      email: email,
      exp: expires,
      type:"personal"
    },
    settings.server_secret
  );

  callback({
    token: token,
    expires: expires,
  });
}

function expiresIn(numMinutes) {
  let dateObj = new Date();
  return dateObj.setTime(dateObj.getTime() + numMinutes * 60000);
}

module.exports = {
  init: init,
  createActivationToken: createActivationToken,
  removeToken: removeToken,
  findToken: findToken,
};
