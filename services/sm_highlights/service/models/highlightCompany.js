const mongoose = require("mongoose");
const companyDb = require("./companies");

var highlightsModelCompany;

function init(settings) {
  mongoose.connect(settings.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let schema = mongoose.Schema({
    user: { type: String, required: true },
    text: {
      type: String,
      required: true,
    },
    social: {
      type: Object,
      default: null,
    },
    url: {
      type: Object,
      default: null,
    },
    date: {
      type: String,
      default: null,
    },
  });

  highlightsModelCompany = mongoose.model("highlightsCompany", schema);
}

function store(user, text, social, url, date, callback) {
  if (text) {
    let newHighlight = new highlightsModelCompany({
      text: text,
      social: social,
      url: url,
      date: date,
    });

    companyDb.updateCompanyHighlight(user, newHighlight, (err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res);
      }
    });
  }
}


function deleteAll(username, callback) {
  if (username) {
    companyDb.deleteAllHighlights(username,(err, res) => {
      if (err) {
        callback(err);
      } else {
        callback(res);
      }
    });
  }else {
    callback({ status: 400, message: "Missing username" });
  }
}


function remove(id, username,callback) {
  companyDb.removeHighlightFromCompany(id, username,(err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(res);
    }
  });
}



module.exports = {
  init: init,
  store: store,
  remove: remove,
  deleteAll:deleteAll
};
