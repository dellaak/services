const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    },
  });

  companyModel = mongoose.model("companies", schema);
}

function updateCompany(
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
  companyModel.findOne({ username: username }, function (err, oldUser) {
    if (err) {
      callback({ status: 500, message: err });
    } else if (!oldUser) {
      callback({ status: 405, message: "No user found" });
    } else {
      socialsList.map((i) => {
        delete i.icon;
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

function updateCompanyName(username, newusername, callback) {
  username = username.trim().toLowerCase();
  newusername = newusername.trim().toLowerCase();

  companyExist(newusername, (exists) => {
    if (exists) {
      callback({ status: 400, message: "User exists" });
    } else {
      companyModel.findOneAndUpdate(
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

function deleteCompany(name, callback) {
  companyModel.findOne({ username: name }, function (_err, user) {
    if (user) {
      companyModel.remove({ _id: user._id }, function (err) {
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

function getCompany(username, callback) {
  companyModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user);
    } else {
      callback("No such user");
    }
  });
}

function addUserFollowToCompany(username, company, callback) {
  companyModel.findOneAndUpdate(
    { username: company.username },
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

function addCompanyFollowToCompany(username, user, callback) {
  companyModel.findOneAndUpdate(
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

function addUserToCompany(username, user, callback) {
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
  companyModel.findOneAndUpdate(
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

function addCompanyToCompany(username, user, callback) {
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

  companyModel.findOneAndUpdate(
    { username: username },
    { $push: { following: userObj } },
    { safe: true, upsert: true, new: true },
    (err, model) => {
      if (!err) {
        callback({ status: 200, message: `Following ${user.username}` });
      } else {
        callback({ status: 503, message: `Couldn't follow` });
      }
    }
  );
}

function unFollowUser(loggedInUser, username, callback) {
  companyModel.findOneAndUpdate(
    { username: username },
    { $pull: { followers: loggedInUser } },
    { safe: true, upsert: true, new: true },
    (err, _model) => {
     if(!err){
      companyModel.findOneAndUpdate(
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
     }else{
      callback({ status: 503, message: `Couldn't follow` });
     }
    }
  );

  
}

function removeFollowUser(loggedInUser, username,callback) {
  companyModel.findOneAndUpdate(
    { username: username},
    { $pull: { followers: loggedInUser } },
    { safe: true, upsert: true, new: true },
    (err, model) => {

      if (!err) {
        callback(null, model);
      } else {
        callback({ status: 503, message: `Couldn't unfollow` });
      }
    }
  );
}

function removeFollowing(loggedInUser, username, callback) {
  companyModel.findOneAndUpdate(
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

function companyExist(username, callback) {
  companyModel.findOne(
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

function updateCompanyPassword(username, newpassword, callback) {
  companyModel.findOne({ username: username }, function (err, user) {
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

module.exports = {
  init: init,
  updateCompany: updateCompany,
  updateCompanyName: updateCompanyName,
  deleteCompany: deleteCompany,
  updateCompanyPassword: updateCompanyPassword,
  companyExist: companyExist,
  getCompany: getCompany,
  addUserFollowToCompany: addUserFollowToCompany,
  addCompanyFollowToCompany: addCompanyFollowToCompany,
  addCompanyToCompany: addCompanyToCompany,
  addUserToCompany: addUserToCompany,
  removeFollowUser: removeFollowUser,
  removeFollowing: removeFollowing,
  unFollowUser: unFollowUser,
};
