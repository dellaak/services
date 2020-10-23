const settings = require("../config/settings");
const socialsDb = require("../models/socials");
const socialsCompanyDb = require("../models/socialsCompany");
const usersDb = require("../models/users");
const companyDb = require("../models/companies");

socialsDb.init(settings);
socialsCompanyDb.init(settings);
usersDb.init(settings);
companyDb.init(settings);

function add(username, title, url, socialname,phone,socialid, iscompany,  callback) {
  if (!!username) {
    if (iscompany) {
      socialsCompanyDb.store(
        username, title, url, socialname,phone,socialid,
        callback
      );
    } else {
      socialsDb.store(username, title, url, socialname,phone,socialid,  callback);
    }
  } else {
    callback({ status: 405, message: "Something went wrong" });
  }
}

function remove(id, username, iscompany, callback) {
  id = id.toString();
  if (!!id) {
    if (iscompany) {
      socialsCompanyDb.remove(id, username,  callback)
    } else {
      socialsDb.remove(id, username,  callback);
    }
  } else {
    callback({ status: 405, message: "No such social" });
  }
}

function update(username, title, user, url,phone,socialid, iscompany,  logger,callback) {
  if (!!username) {
    if (iscompany) {
      companyDb.updateSingleSocial(
        username,
        title,
        user,
        url,
        phone,
        socialid,
        callback
      );
    } else {
      usersDb.updateSingleSocial(username, title, user, url,phone,socialid, logger, callback);
    }
  } else {
    callback({ status: 405, message: "No such user" });
  }
}


module.exports = {
  add: add,
  remove: remove,
  update: update,
};
