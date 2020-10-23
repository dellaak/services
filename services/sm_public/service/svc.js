const users = require("./lib/users");
const qrcode = require("./lib/qrcode");
const routes = [
  "/login",
  "/profile",
  "/settings",
  "/verify",
  "/success",
  "/cancel",
  "/downloads"
];
function onMessage(headers, params, query, body, logger, requester, reply) {
  let isUser = true;
  routes.map((i) => {
    if (i === headers.url) return (isUser = false);
  });

  if (
    headers.url.indexOf("/") > -1 &&
    params.hasOwnProperty("user") &&
    headers.method === "GET" &&
    isUser
  ) {
    users.getUserInfo(params.user, logger, function (ret) {
      reply.send(ret.status, { "Content-type": "application/json" }, ret);
    });
  } else if (headers.url.endsWith("/generateqr") && headers.method === "POST") {
    qrcode.createUserQr(body.username, logger, function (ret) {
      reply.send(ret.status, { "Content-type": "application/json" }, ret);
    });
  } else if (!isUser && headers.method === "GET") {
    reply.send(
      200,
      { "Content-type": "application/json" },
      { message: "Is route" }
    );
  } else {
    reply.send(
      404,
      { "Content-type": "application/json" },
      { status: 404, message: "User not found" }
    );
  }
}

module.exports = {
  onMessage: onMessage,
};
