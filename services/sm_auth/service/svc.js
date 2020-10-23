const auth = require("./lib/auth");
const routes= [ "/login", "/profile", "/settings","/verify"]
function onMessage(headers, params, query, body, logger, requester, reply) {
  let isUser = true
  routes.map(i=>{
    if(i===headers.url)
    return isUser = false
  })
  if (headers.url.endsWith("/signup") && headers.method === "POST") {
    auth.signup(
      body.username,
      body.email,
      body.password,
      logger,
      function (ret) {
        reply.send(ret.status, { "Content-type": "application/json" }, ret);
      }
    );
  } else if (headers.url.endsWith("/login") && headers.method === "POST") {
    auth.login(body.email, body.password, logger,function (ret) {
      reply.send(ret.status, { "Content-type": "application/json" }, ret);
    });
  } else if (headers.url.endsWith("/signup_company") && headers.method === "POST") {
    auth.signupCompany(
      body.username,
      body.email,
      body.legalname,
      body.password,
      logger,
      function (ret) {
        reply.send(ret.status, { "Content-type": "application/json" }, ret);
      }
    );
  } else if (headers.url.endsWith("/getuser") && headers.method === "POST" && isUser) {
    auth.getUser(body.token, logger, function (ret) {
      reply.send(ret.status, { "Content-type": "application/json" }, ret);
    });
  } else if (
    headers.url.endsWith("/refresh_token") &&
    headers.method === "GET"
  ) {
    auth.refresh_token(headers, function (ret) {
      reply.send(ret.status, { "Content-type": "application/json" }, ret);
    });
  } else if (headers.url.indexOf("/verify") > -1 && headers.method === "POST") {
    auth.activeAccount(params.activationtoken, logger, function (ret) {
      reply.send(ret.status, { "Content-type": "application/json" }, ret);
    });
  } else {
    reply.send(
      404,
      { "Content-type": "application/json" },
      { status: 404, message: "Page not found" }
    );
  }
}

module.exports = {
  onMessage: onMessage,
};
