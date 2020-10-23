const mongoose = require("mongoose");

var stripeCustomerModel;

function init(settings) {
  mongoose.connect(settings.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let schema = mongoose.Schema({
    companyId: String,
    stripeCustomerId: String,
  });

  stripeCustomerModel = mongoose.model("stripeCustomer", schema);
}

function createStripeCustomer(companyId, stripeCustomerId, callback) {
  let stripeCustomer = new stripeCustomerModel({
    companyId,
    stripeCustomerId,
  });
  stripeCustomer.save(function (err, _stripeCustomer) {
    if (err) {
      callback(err);
    } else {
      callback(null, stripeCustomer._id);
    }
  });
}

function getStripeCustomer(id, callback) {
  stripeCustomerModel.findOne({ companyId: id }, function (err, customer) {
    if (!err && customer) {
      callback(null, customer);
    } else {
      callback("No such stripe customer");
    }
  });
}

// function updateCompany(id, newName, callback) {
//     companyModel.findOne({_id: id}, function (err, company) {
//         if(err || !company) {
//             callback(err);
//         } else {
//             company.name = newName;

//             company.save(function (err, _company) {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     callback(null, company._id);
//                 }
//             });
//         }
//     });
// }

// function removeCompany(id, callback) {
//     companyModel.remove({_id: id}, function(err) {
//         if(err) {
//             callback(err);
//         } else {
//             callback(null, 'Company removed');
//         }
//     });
// }

// function getCompanyName(id, callback) {
//     companyModel.findOne({_id: id}, function (err, company) {
//         if (!err && company) {
//             callback(null, company.name);
//         } else {
//             callback('No such company');
//         }
//     });
// }

// function getCompanyId(name, callback) {
//     companyModel.findOne({name: name}, function (err, company) {
//         if (!err && company) {
//             callback(null, company._id);
//         } else {
//             callback('No such company');
//         }
//     });
// }

module.exports = {
  init: init,
  createStripeCustomer: createStripeCustomer,
  getStripeCustomer: getStripeCustomer,
  // updateCompany: updateCompany,
  // removeCompany: removeCompany,
  // getCompanyName: getCompanyName,
  // getCompanyId: getCompanyId
};
