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

  userModel = mongoose.model("users", schema);
}

function removeSocialFromUser(title, username, callback) {
  userModel.findOneAndUpdate(
    { username: username },
    { $pull: { socialsList: { title: title } } },
    function (err, user) {
      if (!err && user) {
        callback(null, "Social Removed from user");
      } else {
        callback(err);
      }
    }
  );
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

function getUser(username, callback) {
  userModel.findOne({ username: username }, function (err, user) {
    if (!err && user) {
      callback(null, user);
    } else {
      callback("No such user");
    }
  });
}

function updateUserSocial(username, social, callback) {
  userModel.findOne({ username: username }, function (err, oldUser) {
    if (err) {
      callback({ status: 500, message: err });
    } else if (!oldUser) {
      callback({ status: 405, message: "No user found" });
    } else {
      oldUser.socialsList.push(social);

      oldUser.save(function (err, _user) {
        if (err) {
          callback({ status: 500, message: err });
        } else {
          callback({
            status: 200,
            message: "User Social successfully Created",
          });
        }
      });
    }
  });
}

function updateSingleSocial(
  username,
  title,
  user,
  url,
  phone,
  socialid,
  logger,
  callback
) {
  userModel.findOne({ username: username }, function (err, oldUser) {
    if (err) {
      callback({ status: 500, message: err });
    } else if (!oldUser) {
      callback({ status: 405, message: "No user found" });
    } else {
      if (url) {
        let newData = oldUser.socialsList.map((el) => {
          if (el.title === title) return Object.assign({}, el, { url: url });
          return el;
        });
        oldUser.socialsList = newData;
        oldUser.save(function (err, _user) {
          if (err) {
            callback({ status: 500, message: err });
          } else {
            callback({
              status: 200,
              message: "Social successfully Updated",
            });
          }
        });
      } else if (user) {
        let newData = oldUser.socialsList.map((el) => {
          if (el.title === title)
            return Object.assign({}, el, { username: user });
          return el;
        });
        oldUser.socialsList = newData;
        oldUser.save(function (err, _user) {
          if (err) {
            callback({ status: 500, message: err });
          } else {
            callback({
              status: 200,
              message: "Social successfully Updated",
            });
          }
        });
      } else if (phone) {
        let newData = oldUser.socialsList.map((el) => {
          if (el.title === title)
            return Object.assign({}, el, { phone: phone });
          return el;
        });
        oldUser.socialsList = newData;
        oldUser.save(function (err, _user) {
          if (err) {
            callback({ status: 500, message: err });
          } else {
            callback({
              status: 200,
              message: "Social successfully Updated",
            });
          }
        });
      } else if (socialid) {
        let newData = oldUser.socialsList.map((el) => {
          if (el.title === title)
            return Object.assign({}, el, { socialid: socialid });
          return el;
        });
        logger.error(JSON.stringify(newData));
        oldUser.socialsList = newData;
        oldUser.save(function (err, _user) {
          if (err) {
            callback({ status: 500, message: err });
          } else {
            callback({
              status: 200,
              message: "Social successfully Updated",
            });
          }
        });
      } else {
        callback({
          status: 500,
          message: "Failed to save",
        });
      }
    }
  });
}

// function subscribe(company, callback) {
//   companyDb.getCompanyId(company, function (err, companyId) {
//     if (!err && companyId) {
//       stripeCustomer.getStripeCustomer(companyId, async function (err, res) {
//         if (!err && res) {
//           const session = await stripe.billingPortal.sessions.create({
//             customer: res.stripeCustomerId,
//             return_url: "http://localhost:4200/home",
//           });

//           callback({ status: 200, message: JSON.stringifys(session.url) });
//         } else {
//           callback(false);
//         }
//       });
//     } else {
//       callback("Failed to connect to stripe");
//     }
//   });
// }

module.exports = {
  init: init,
  getUserId: getUserId,
  removeSocialFromUser: removeSocialFromUser,
  getUser: getUser,
  updateUserSocial: updateUserSocial,
  updateSingleSocial: updateSingleSocial,
};
