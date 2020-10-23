const settings = require("../config/settings");
const usersDb = require("../models/users");
const companyDb = require("../models/companies");

usersDb.init(settings);
companyDb.init(settings);

function update(
  username,
  phone,
  socialsList,
  description,
  showPhone,
  showEmail,
  selectedColor,
  isCompany,
  logger,
  callback
) {
  if (!!username) {
    if (isCompany) {
      companyDb.updateCompany(
        username,
        phone,
        socialsList,
        description,
        showPhone,
        showEmail,
        selectedColor,
        logger,
        callback
      );
    } else {
      usersDb.updateUser(
        username,
        phone,
        socialsList,
        description,
        showPhone,
        showEmail,
        selectedColor,
        logger,
        callback
      );
    }
  } else {
    callback({ status: 405, message: "No user found" });
  }
}

function usernameUpdate(username, newusername, isCompany, logger, callback) {
  if (isCompany) {
    usersDb.userExists(newusername, (res) => {
      if (res) {
        return callback({ status: 400, message: "Username exists" });
      } else {
        if (username) {
          companyDb.updateCompanyName(username, newusername, callback);
        } else {
          callback({ status: 405, message: "No user found" });
        }
      }
    });
  } else {
    companyDb.companyExist(newusername, (res) => {
      if (res) {
        return callback({ status: 400, message: "Username exists" });
      } else {
        if (username) {
          usersDb.updateUsername(username, newusername, callback);
        } else {
          callback({ status: 405, message: "No user found" });
        }
      }
    });
  }
}

function passwordUpdate(username, newpassword, isCompany, logger, callback) {
  if (username && newpassword) {
    if (isCompany) {
      companyDb.updateCompanyPassword(username, newpassword, callback);
    } else {
      usersDb.updateUserPassword(username, newpassword, callback);
    }
  } else {
    callback({ status: 405, message: "No user found" });
  }
}

function deleteUser(username, isCompany, logger, callback) {
  if (username) {
    if (isCompany) {
      companyDb.deleteCompany(username, callback);
    } else {
      usersDb.deleteUser(username, callback);
    }
  } else {
    callback({ status: 405, message: "No user found" });
  }
}

function followUser(
  loggedInUser,
  username,
  isUserCompany,
  isCompany,
  logger,
  callback
) {
  if (isUserCompany && !isCompany) {
    companyDb.getCompany(username, (err, company) => {
      if (!err && company) {
        companyDb.addUserFollowToCompany(loggedInUser, company, (err, res) => {
          if (err) {
            callback(err);
          } else {
            usersDb.addCompanyToUser(loggedInUser, res, callback);
          }
        });
      }
    });
  } else if (!isUserCompany && !isCompany) {
    usersDb.getUser(username, (err, user) => {
      if (!err && user) {
        usersDb.addUserFollowToUser(loggedInUser, user, (err, res) => {
          if (err) {
            callback(err);
          } else {
            usersDb.addUserToUser(loggedInUser, res, callback);
          }
        });
      }
    });
  } else if (isUserCompany && isCompany) {
    companyDb.getCompany(username, (err, company) => {
      if (!err && company) {
        companyDb.addCompanyFollowToCompany(
          loggedInUser,
          company,
          (err, res) => {
            if (err) {
              callback(err);
            } else {
              companyDb.addCompanyToCompany(loggedInUser, res, callback);
            }
          }
        );
      }
    });
  } else if (!isUserCompany && isCompany) {
    usersDb.getUser(username, (err, user) => {
      if (!err && user) {
        usersDb.addCompanyFollowToUser(loggedInUser, user, (err, res) => {
          if (err) {
            callback(err);
          } else {
            companyDb.addUserToCompany(loggedInUser, res, callback);
          }
        });
      }
    });
  } else {
    callback({ status: 405, message: "No user found" });
  }
}

function unFollowUser(
  loggedInUser,
  username,
  isUserCompany,
  isCompany,
  logger,
  callback
) {
  if (!isCompany && isUserCompany) {
    companyDb.removeFollowUser(loggedInUser, username, (err, _res) => {
      if (!err) {
        usersDb.removeFollowing(loggedInUser, username, callback);
      } else {
        callback({ status: 503, message: `Couldn't unfollow` });
      }
    });
  } else if (isCompany && !isUserCompany) {
    usersDb.removeFollowUser(loggedInUser, username, (err, _res) => {
      if (!err) {
        companyDb.removeFollowing(loggedInUser, username, callback);
      } else {
        callback({ status: 503, message: `Couldn't unfollow` });
      }
    });
  } else if (!isCompany && !isUserCompany) {
    usersDb.unFollowUser(loggedInUser, username, callback);
  } else if (isCompany && isUserCompany) {
    companyDb.unFollowUser(loggedInUser, username,callback);
  }
}

module.exports = {
  update: update,
  usernameUpdate: usernameUpdate,
  passwordUpdate: passwordUpdate,
  deleteUser: deleteUser,
  followUser: followUser,
  unFollowUser: unFollowUser,
};
