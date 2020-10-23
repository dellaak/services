const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    following: [],
    followers: [],
    selectedColor: {
      type: String,
      default: null,
    },
  });

  userModel = mongoose.model("users", schema);
}

function updateUser(
  username,
  phone,
  socialsList,
  description,
  showPhone,
  showEmail,
  selectedColor,
  logger,
  callback
) {
  userModel.findOne({ username: username }, function (err, oldUser) {
    if (err) {
      logger.error(err);
      callback({ status: 500, message: err });
    } else if (!oldUser) {
      callback({ status: 405, message: "No user found" });
    } else {
      socialsList.map((i) => {
        delete i.icon;
        delete i.notExternal;
      });

      oldUser.socialsList = socialsList.sort(function (a, b) {
        return a.position - b.position;
      });
      oldUser.phone = phone;
      oldUser.description = description;
      oldUser.showPhone = showPhone;
      oldUser.showEmail = showEmail;
      oldUser.selectedColor = selectedColor;

      oldUser.save(function (err, _user) {
        if (err) {
          logger.error(err);
          callback({ status: 500, message: err });
        } else {
          callback({ status: 200, message: "User successfully updated" });
        }
      });
    }
  });
}

function userExists(username, callback) {
  userModel.findOne(
    {
      username: username,
    },
    function (err, entry) {
      if (!err && entry) {
        callback(true);
      } else {
        callback(false);
      }
    }
  );
}

function updateUsername(username, newusername, callback) {
  username = username.trim().toLowerCase();
  newusername = newusername.trim().toLowerCase();

  userExists(newusername, (exists) => {
    if (exists) {
      callback({ status: 400, message: "User exists" });
    } else {
      userModel.findOneAndUpdate(
        { username: username },
        { username: newusername },
        function (err, user) {
          if (err) {
            callback({ status: 200, message: "Failed to get user" });
          }
          callback({ status: 200, message: "Username updated" });
        }
      );
    }
  });
}

function updateUserPassword(username, newpassword, callback) {
  userModel.findOne({ username: username }, function (err, user) {
    if (err || !user) {
      callback(err);
    } else {
      let salt = bcrypt.genSaltSync(10);
      if (newpassword.length > 0) {
        user.hashed_password = bcrypt.hashSync(newpassword, salt);
      }

      user.save(function (err, _user) {
        if (err) {
          callback({ status: 400, message: "Failed to save password" + err });
        } else {
          callback({ status: 200, message: "User password updated" });
        }
      });
    }
  });
}

function deleteUser(name, callback) {
  userModel.findOne({ username: name }, function (_err, user) {
    if (user) {
      userModel.remove({ _id: user._id }, function (err) {
        if (!err) {
          callback({ status: 200, message: "User Removed" });
        } else {
          callback({ status: 503, message: err });
        }
      });
    } else {
      callback(_err);
    }
  });
}

function addCompanyToUser(username, user, callback) {
  let userObj={
    highlights:[],
    username:'',
    selectedColor:''
  }
  if(user){
    userObj.highlights = user.highlights
    userObj.username = user.username
    userObj.selectedColor = user.selectedColor
  }

  userModel.findOneAndUpdate(
    { username: username },
    { $push: { following: userObj } },
    { safe: true, upsert: true, new: true },
    (err, _model) => {
      if (!err) {
        callback({ status: 200, message: `Following ${user.username}` });
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function addUserFollowToUser(username, user, callback) {
  userModel.findOneAndUpdate(
    { username: user.username },
    { $push: { followers: username } },
    { safe: true, upsert: true, new: true },
    (err, _model) => {
      if (!err) {
        callback(null, user);
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function addUserToUser(username, user, callback) {
  let userObj={
    highlights:[],
    username:'',
    selectedColor:''
  }
  if(user){
    userObj.highlights = user.highlights
    userObj.username = user.username
    userObj.selectedColor = user.selectedColor
  }
  userModel.findOneAndUpdate(
    { username: username },
    { $push: { following: userObj } },
    { safe: true, upsert: true, new: true },
    (err, _model) => {
      if (!err) {
        callback({ status: 200, message: `Following ${user.username}` });
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function addCompanyFollowToUser(username, user, callback) {
  userModel.findOneAndUpdate(
    { username: user.username },
    { $push: { followers: username } },
    { safe: true, upsert: true, new: true },
    (err, model) => {
      if (!err) {
        callback(null, model);
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function unFollowUser(loggedInUser, username, callback) {
  userModel.findOneAndUpdate(
    { username: username },
    { $pull: { followers: loggedInUser } },
    { safe: true, upsert: true, new: true },
    (err, _model) => {
      //PASS
    }
  );

  userModel.findOneAndUpdate(
    { username: loggedInUser },
    { $pull: { following: { username: username } } },
    { safe: true, upsert: true, new: true },
    (err, _model) => {
      if (!err) {
        callback({ status: 200, message: `Unfollowing ${username}` });
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function removeFollowing(loggedInUser, username, callback) {
  userModel.findOneAndUpdate(
    { username: loggedInUser },
    { $pull: { following: { username: username } } },
    { safe: true, upsert: true, new: true },
    (err, _model) => {
      if (!err) {
        callback({ status: 200, message: `Unfollowing ${username}` });
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function removeFollowUser(loggedInUser, username, callback) {
  userModel.findOneAndUpdate(
    { username: username },
    { $pull: { followers: loggedInUser } },
    { safe: true, upsert: true, new: true },
    (err, model) => {
      if (!err) {
        callback(null, model);
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function getUser(username, callback) {
  userModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user);
    } else {
      callback("No such user");
    }
  });
}

module.exports = {
  init: init,
  updateUser: updateUser,
  userExists: userExists,
  deleteUser: deleteUser,
  updateUsername: updateUsername,
  updateUserPassword: updateUserPassword,
  getUser: getUser,
  addCompanyToUser: addCompanyToUser,
  addUserFollowToUser: addUserFollowToUser,
  addUserToUser: addUserToUser,
  addCompanyFollowToUser: addCompanyFollowToUser,
  removeFollowing: removeFollowing,
  removeFollowUser: removeFollowUser,
  unFollowUser: unFollowUser,
};
