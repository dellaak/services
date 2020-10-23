const auth_cli = require("./lib/auth");
const highlight = require("./lib/highlight");

function onMessage(headers, params, query, body, logger, requester, reply) {
  auth_cli.isAuthorized(headers,logger, function (authorized, token) {
    if (!authorized || !token) {
      reply.send(
        401,
        { "Content-type": "application/json" },
        { error: "Unauthorized" }
      );
    } else {
      if (
        headers.url.endsWith("/highlight/add") &&
        body.hasOwnProperty("text") &&
        headers.method === "POST"
      ) {
        highlight.add(
          token.username,
          body.text,
          body.social,
          body.url,
          body.date,
          token.isCompany,
          logger,
          function (ret) {
            reply.send(ret.status, { "Content-type": "application/json" }, ret);
          }
        );
      } else if (
        headers.url.endsWith("/highlight/removeall") &&
        headers.method === "POST"
      ) {

        highlight.removeAll(token.username, token.isCompany, logger, function (
          ret
        ) {
          reply.send(ret.status, { "Content-type": "application/json" }, ret);
        });
        
      }else if (
        headers.url.endsWith("/highlight/remove") &&
        headers.method === "POST"
      ) {
        highlight.remove(token.username,body.socialid, token.isCompany, logger, function (
          ret
        ) {
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
  });
}

module.exports = {
  onMessage: onMessage,
};
