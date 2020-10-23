const settings = require("../config/settings");
const highlightsDb = require("../models/highlight");
const highlightsCompanyDb = require("../models/highlightCompany");
const usersDb = require("../models/users");
const companyDb = require("../models/companies");

highlightsDb.init(settings);
highlightsCompanyDb.init(settings);
usersDb.init(settings);
companyDb.init(settings);

function add(username, text, social, url, date, iscompany, logger,callback) {
  if (!!username) {
    if (iscompany) {
      highlightsCompanyDb.store(
        username,
        text, social, url, date,
        
        callback
      );
    } else {
      highlightsDb.store(username, text, social, url, date,  callback);
    }
  } else {
    callback({ status: 405, message: "Something went wrong" });
  }
}

function remove(username,id, iscompany,logger, callback) {
  logger.error(iscompany)
  id = id.toString()
  if (!!id) {
    if (iscompany) {
      logger.error('innec')
      highlightsCompanyDb.remove(id, username,  callback)
    } else {
      logger.error('inneu')
      highlightsDb.remove(id, username,  logger, callback);
    }
  } else {
    callback({ status: 405, message: "No such highlight" });
  }
}


function removeAll(username, iscompany, logger,callback) {
  if (!!username) {
    if (iscompany) {
      highlightsCompanyDb.deleteAll(
        username,
        callback
      );
    } else {
      highlightsDb.deleteAll(username, callback);
    }
  } else {
    callback({ status: 405, message: "Something went wrong" });
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
  removeAll:removeAll
};
