const settings = require("../config/settings");
const usersDb = require("../models/users");
const companyDb = require("../models/companies");

companyDb.init(settings);
usersDb.init(settings);

function getUserInfo(username, logger,callback) {
  if (username) {
    companyDb.getCompanyInfo(username, logger,(err, company) => {
      if (err) {
        callback({ status: 404, message: err });
      } else if (err && err.notactive) {
        callback({ status: 404, message: "Company not activated" });
      } else if (company && company.activated) {
        callback({ status: 200, message: company });
      }else {
        usersDb.getUserInfo(username, (usererr, user) => {
        
          if (usererr) {
            callback({ status: 404, message: err });
          } else if (usererr && usererr.notactive) {
            callback({ status: 404, message: "User not activated" });
          } else if (user && user.activated) {
            callback({ status: 200, message: user });
          } else if (usererr && usererr.nouser) {
            callback({ status: 404, message: usererr.nouser });
          }
        });
      }
    });
  } else {
    callback({ status: 404, message: [] });
  }
}

module.exports = {
  getUserInfo: getUserInfo,
};
