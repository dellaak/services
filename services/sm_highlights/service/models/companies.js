const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId; 
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
    activated: {
      type: Boolean,
      default: false,
    },
    following:[],
    followers:[],
  });

  companyModel = mongoose.model("companies", schema);
}

function removeHighlightFromCompany(id, username, callback) {
  id = new ObjectId(id) ;
  companyModel.findOneAndUpdate(
    { username: username },
    { $pull: { highlights: { _id: id } } },
    function (err, user) {
      if (!err && user) {
        callback({
          status: 200,
          message: "User Highlight successfully deleted",
        });
      } else {
        callback({
          status: 400,
          message: "Failed to delete Highlight",
        });
      }
    }
  );
}

function deleteAllHighlights(username, callback) {
  companyModel.findOne({ username: username }, function (err, oldUser) {
    if (err) {
      callback({ status: 500, message: err });
    } else if (!oldUser) {
      callback({ status: 405, message: "No user found" });
    } else {
      oldUser.highlights = [];

      oldUser.save(function (err, _user) {
        if (err) {
          callback({ status: 500, message: err });
        } else {
          callback({
            status: 200,
            message: "User Highlights successfully deleted",
          });
        }
      });
    }
  });
}

function getUserId(username, callback) {
  companyModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user._id);
    } else {
      callback("No such user");
    }
  });
}

function getUser(username, callback) {
  companyModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user);
    } else {
      callback("No such user");
    }
  });
}

function updateCompanyHighlight(username, highlight, callback) {
  companyModel.findOne({ username: username }, function (err, oldUser) {
    if (err) {
      callback({ status: 500, message: err });
    } else if (!oldUser) {
      callback({ status: 405, message: "No user found" });
    } else {
      oldUser.highlights.unshift(highlight);

      oldUser.save(function (err, _user) {
        if (err) {
          callback({ status: 500, message: err });
        } else {
          callback({
            status: 200,
            message: "User Highlight successfully Created",
          });
        }
      });
    }
  });
}

module.exports = {
  init: init,
  getUserId: getUserId,
  removeHighlightFromCompany: removeHighlightFromCompany,
  getUser: getUser,
  updateCompanyHighlight: updateCompanyHighlight,
  deleteAllHighlights:deleteAllHighlights
};
