const jwt = require("jwt-simple");
const settings = require("../config/settings");
const usersDb = require("../models/users");
const companyDb = require("../models/companies");

usersDb.init(settings);
companyDb.init(settings);

const auth = {
  signup: function (username, email, password, logger, callback) {
    if (!username || !email || !password) {
      callback({
        status: 401,
        message: "Invalid credentials",
      });
    } else {
      companyDb.companyExist(username, email, (usererr, _res, create) => {
        if (usererr) {
          if (usererr.username) {
            callback({
              status: 401,
              message: usererr.username,
            });
          } else if (usererr.email) {
            callback({
              status: 401,
              message: usererr.email,
            });
          }
        } else if (create) {
          usersDb.createUser(username, email, password, logger, function (
            err,
            status_msg
          ) {
            if (err || !status_msg) {
              if (err.username) {
                callback({
                  status: 400,
                  message: "Username already exists",
                });
              } else if (err.email) {
                callback({
                  status: 400,
                  message: "Email already exists",
                });
              }
            } else {
              callback({
                status: 200,
                message: status_msg,
              });
            }
          });
        } else {
          callback({
            status: 400,
            message: "Couldn't create user",
          });
        }
      });
    }
  },
  signupCompany: function (
    username,
    email,
    legalname,
    password,
    logger,
    callback
  ) {
    if (!username || !email || !password || !legalname) {
      callback({
        status: 401,
        message: "Invalid credentials",
      });
    } else {
      usersDb.userExist(username, email, (usererr, _res, create) => {
        if (usererr) {
          if (usererr.username) {
            return callback({
              status: 401,
              message: usererr.username,
            });
          } else if (usererr.email) {
            return callback({
              status: 401,
              message: usererr.email,
            });
          }
        } else if (create) {
          companyDb.createCompany(
            username,
            email,
            legalname,
            password,
            logger,
            function (err, status_msg) {
              if (err || !status_msg) {
                if (err.username) {
                  callback({
                    status: 400,
                    message: "Username already exists",
                  });
                } else if (err.email) {
                  callback({
                    status: 400,
                    message: "Email already exists",
                  });
                } else if (err.legalname) {
                  callback({
                    status: 400,
                    message: "Company already exists",
                  });
                }
              } else {
                callback({
                  status: 200,
                  message: status_msg,
                });
              }
            }
          );
        } else {
          callback({
            status: 400,
            message: "Couldn't create user",
          });
        }
      });
    }
  },

  login: function (username, password, logger, callback) {
    if (!username || !password) {
      callback({
        status: 401,
        message: "Invalid credentials",
      });
    } else {
      // Fire a query to the DB and check if the credentials are valid
      auth.validate(username, password, logger, function (err, user) {
        if (err || !user) {
          callback({
            status: 401,
            message: "Invalid credentials",
          });
        } else if (!user.activated) {
          callback({
            status: 401,
            message: "User not active",
          });
        } else {
          // Authorization succeeded, we will generate a token
          // and dispatch it to the client
          callback({
            status: 200,
            message: gen_token(user.username, user.isCompany),
          });
        }
        return;
      });
    }
  },

  update_user: function (headers, id, name, email, password, callback) {
    let token = headers["Authorization"] || headers["authorization"];
    try {
      let decoded_token = jwt.decode(token, settings.server_secret);

      usersDb.isAdmin(
        decoded_token.username,
        decoded_token.company,
        (isAdmin) => {
          if (isAdmin) {
            usersDb.updateUser(
              id,
              name,
              email,
              password,
              decoded_token.company,
              function (err, user) {
                if (err || !user) {
                  callback({
                    status: 500,
                    message: "Failed updating user: " + err,
                  });
                } else {
                  callback({
                    status: 200,
                    message: "User successfully updated",
                  });
                }
              }
            );
          } else {
            callback({
              status: 401,
              message: "Only admins can perform this call",
            });
          }
        }
      );
    } catch (err) {
      callback({
        status: 500,
        message: "" + err,
      });
    }
  },

  remove_user: function (headers, id, callback) {
    let token = headers["Authorization"] || headers["authorization"];
    try {
      let decoded_token = jwt.decode(token, settings.server_secret);

      usersDb.isAdmin(
        decoded_token.username,
        decoded_token.company,
        (isAdmin) => {
          if (isAdmin) {
            usersDb.removeUser(id, decoded_token.company, function (err, user) {
              if (err || !user) {
                callback({
                  status: 500,
                  message: "Failed removing user: " + err,
                });
              } else {
                callback({
                  status: 200,
                  message: "User successfully removed",
                });
              }
            });
          } else {
            callback({
              status: 401,
              message: "Only admins can perform this call",
            });
          }
        }
      );
    } catch (err) {
      callback({
        status: 500,
        message: "" + err,
      });
    }
  },

  refresh_token: function (headers, callback) {
    let token = "" + (headers["Authorization"] || headers["authorization"]);
    if (token.substring(0, 7) === "Bearer ") {
      try {
        token = token.substring(7, token.length);
        let decoded_token = jwt.decode(token, settings.server_secret);

        if (isValidForRefresh(decoded_token)) {
          callback({
            status: 200,
            message: gen_token(decoded_token.username, decoded_token.isCompany),
          });
        } else {
          callback({
            status: 401,
            message: "Token expired",
          });
        }
      } catch (err) {
        callback({
          status: 500,
          message: err,
        });
      }
    } else {
      callback({
        status: 401,
        error: "Unauthorized",
      });
    }
  },

  validate: function (username, password, logger, callback) {
    usersDb.getUser(username, password, function (err, user) {
      if (user) {
        callback(null, user);
      } else if (err || !user) {
        companyDb.getCompany(username, password, function (comperr, company) {
          if (comperr || !company) {
            return callback(comperr);
          } else {
            callback(null, company);
          }
        });
      }
    });
  },

  getUser: function (token, logger, callback) {
    let decode = jwt.decode(token, settings.server_secret);
    return isThereACompany(decode.username, logger, (nocompany, company) => {
      if (company) {
        return callback({
          status: 200,
          message: company,
        });
      } else {
        return usersDb.getLoggedInUser(decode.username, function (err, user) {
          if (err || !user) {
            return callback(err);
          } else {
            let loggedInUser = {
              username: user.username,
              email: user.email,
              description: user.description,
              socialsList: user.socialsList,
              highlights: user.highlights,
              showPhone: user.showPhone,
              showEmail: user.showEmail,
              phone: user.phone,
              title: user.title,
              isCompany: user.isCompany,
              following: user.following,
              followers: user.followers,
              selectedColor: user.selectedColor,
            };
            callback({
              status: 200,
              message: loggedInUser,
            });
          }
        });
      }
    });
  },
  activeAccount: function (token, logger, callback) {
    const decode = jwt.decode(token, settings.server_secret);
    if (decode.type === "personal") {
      usersDb.activateAccount(
        decode.username,
        decode.email,
        token,
        logger,
        function (err, user) {
          if (err) {
            return callback({
              status: 404,
              message: "Token used",
            });
          } else {
            return callback({
              status: 200,
              message: "User activated",
            });
          }
        }
      );
    } else if (decode.type === "company") {
      companyDb.activateAccount(
        decode.username,
        decode.email,
        token,
        logger,
        function (err, user) {
          if (err) {
            return callback({
              status: 404,
              message: "Token used",
            });
          } else {
            return callback({
              status: 200,
              message: "User activated",
            });
          }
        }
      );
    } else {
      return callback({
        status: 404,
        message: "No token found",
      });
    }
  },
};

// private functions

function gen_token(username, isCompany) {
  let expires = expiresIn(settings.token_lifetime);
  let token = jwt.encode(
    {
      username: username,
      isCompany: isCompany,
      exp: expires,
    },
    settings.server_secret
  );

  return {
    token: token,
    expires: expires,
  };
}

function isThereACompany(username, logger, callback) {
  return companyDb.getLoggedInCompany(username, function (comperr, company) {
    if (company) {
      let loggedInCompany = {
        username: company.username,
        email: company.email,
        legalname: company.legalname,
        description: company.description,
        socialsList: company.socialsList,
        highlights: company.highlights,
        showPhone: company.showPhone,
        showEmail: company.showEmail,
        phone: company.phone,
        title: company.title,
        isCompany: company.isCompany,
        selectedColor: company.selectedColor,
      };

      callback(null, loggedInCompany);
    } else {
      callback(comperr);
    }
  });
}

function expiresIn(numMinutes) {
  let dateObj = new Date();
  return dateObj.setTime(dateObj.getTime() + numMinutes * 60000);
}

function isValidForRefresh(decoded_token) {
  if (
    decoded_token.exp >
    Date.now() + settings.refresh_token_lifetime * 60000
  ) {
    return false;
  } else {
    return true;
  }
}

module.exports = auth;
