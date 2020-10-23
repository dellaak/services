const mongoose = require("mongoose");
const companyDb = require("./companies");

var SocialsCompanyModel;

function init(settings) {
  mongoose.connect(settings.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let schema = mongoose.Schema({
    user: { type: String, required: true },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      default: null,
    },
    position: {
      type: Number,
      default: null,
    },
  });

  SocialsCompanyModel = mongoose.model("socialsCompany", schema);
}

function store(user, title, url, username,phone,socialid,  callback) {
  socialsExists(user, title,  function (exists) {
    if (exists) {
      callback({ status: 405, message: "Social already exists" });
    } else {
      if (url) {
        let newSocial = new SocialsCompanyModel({
          title: title,
          url: url,
        });

     
        companyDb.updateUserSocial(user,newSocial,(err,res)=>{
          if(err){
            callback(err)
          }else{
            callback(res)
          }
        })
      } else if(username){
        let newSocial = new SocialsCompanyModel({
          title: title,
          username: username,
        });

        companyDb.updateUserSocial(user,newSocial,(err,res)=>{
          if(err){
            callback(err)
          }else{
            callback(res)
          }
        })
      }else if(phone){
        let newSocial = new SocialsCompanyModel({
          title: title,
          phone: phone,
        });

        companyDb.updateUserSocial(user,newSocial,(err,res)=>{
          if(err){
            callback(err)
          }else{
            callback(res)
          }
        })
      }else if(socialid){
        let newSocial = new SocialsCompanyModel({
          title: title,
          socialid: socialid,
        });

        companyDb.updateUserSocial(user,newSocial,(err,res)=>{
          if(err){
            callback(err)
          }else{
            callback(res)
          }
        })
      }
    }
  });
}

function remove(title, username, callback) {
  companyDb.removeSocialFromUser(title, username, (err, res) => {
    if (err) {
      callback({ status: 500, message: "Problem deleting from user" + err });
    } else {
      callback({ status: 200, message: "Social successfully removed" });
    }
  });
}


function socialsExists(user, title,  callback) {
  companyDb.getUserId(user, (err, userObj) => {
    SocialsCompanyModel.findOne(
      {
        username: userObj.username,
        title: title,
      },
      function (err, entry) {
        if (!err && entry) {
          callback(true);
        } else {
    
          callback(false);
        }
      }
    );
  });
}

module.exports = {
  init: init,
  store: store,
  remove: remove
};
