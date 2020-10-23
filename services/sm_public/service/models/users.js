const mongoose = require("mongoose");
var userModel;

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
      default: null,
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

  userModel = mongoose.model("users", schema);
}

function getUserInfo(username,  callback) {
  let userData = {};
 return userModel.findOne({ username: username }, function (err, user) {

    let errors = {}
    if (!err && user) {
      userData.username = user.username;
      userData.description = user.description;
      userData.email = user.email;
      userData.type = user.type;
      userData.phone = user.phone;
      userData.socialsList = user.socialsList;
      userData.highlights = user.highlights;
      userData.showPhone = user.showPhone;
      userData.showEmail = user.showEmail;
      userData.showQrCode = user.showQrCode;
      userData.activated = user.activated;
      userData.isCompany = user.isCompany;
      userData.followers = user.followers;
      userData.following = user.following;
      userData.selectedColor = user.selectedColor;
      if (err) {
        callback(err);
      } else if (!user.activated) {
        errors.notactive = "User not activated"
        callback(errors);
      } else {
        callback(null,userData);
      }
    } else {
     
      errors.nouser = "No user found"
      callback({errors});
    }
  });
}

function getUserId(username, callback) {
  userModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user._id);
    } else {
      callback("No such user");
    }
  });
}

module.exports = {
  init: init,
  getUserInfo: getUserInfo,
  getUserId: getUserId,
};
