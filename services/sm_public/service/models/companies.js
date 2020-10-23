const mongoose = require("mongoose");

var companyModel;

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
    following: [],
    followers: [],
    selectedColor: {
      type: String,
      default: null,
    }
  });

  companyModel = mongoose.model("companies", schema);
}

function getCompanyInfo(username, logger, callback) {
  let userData = {};
  try {
    companyModel.findOne({ username: username }, function (err, user) {
      let errors = {};
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
          logger.error(JSON.stringify(err));
          return callback(err);
        } else if (!user.activated) {
          errors.notactive = "User not activated";
          return callback(errors);
        } else if (user) {
          return callback(null, user);
        }
      } else {
        if (!user) {
          callback(null, null);
        }
      }
    });
  } catch (error) {
    logger.error(JSON.stringify(error));
  }
}

function getCompanyId(username, callback) {
  companyModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user._id);
    } else {
      callback("No such user");
    }
  });
}

module.exports = {
  init: init,
  getCompanyId: getCompanyId,
  getCompanyInfo: getCompanyInfo,
};
