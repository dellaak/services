const mongoose = require("mongoose");
const userDb = require("./users");

var highlightsModel;

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

  highlightsModel = mongoose.model("highlights", schema);
}

function store(user, text, social, url, date, callback) {
  if (text) {
    let newHighlight = new highlightsModel({
      text: text,
      social: social,
      url: url,
      date: date,
    });

    userDb.updateUserHighlight(user, newHighlight, (err, res) => {
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
    userDb.deleteAllHighlights(username, (err, res) => {
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

function remove(id, username,logger,  callback) {
  userDb.removeHighlightFromUser(id, username, logger, (err, res) => {
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
