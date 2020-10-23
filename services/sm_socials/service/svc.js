const auth_cli = require('./lib/auth');
const socials = require('./lib/socials');

function onMessage(headers, params, query, body, logger, requester, reply) {
    auth_cli.isAuthorized(headers, function(authorized, token) {
        if(!authorized || !token) {
            reply.send(401, { 'Content-type': 'application/json' }, { error: 'Unauthorized' });
        } else {
            if(headers.url.endsWith('/socials/add') && body.hasOwnProperty('title') && headers.method === 'POST') {
                socials.add(token.username ,body.title,body.url,body.username,body.phone,body.socialid,token.isCompany,function(ret) {
                    reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                });
           } else if(headers.url.endsWith('/socials/remove')  && headers.method === 'POST') {
                socials.remove( body.id, body.username,token.isCompany, function(ret) {
                    reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                });
            } else if(headers.url.endsWith('/socials/update')  && headers.method === 'POST') {
                logger.error(JSON.stringify(body))
                socials.update(token.username, body.title,body.username, body.url,body.phone,body.socialid,token.isCompany, logger,function(ret) {
                    reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                });
            } else {
                reply.send(404, { 'Content-type': 'application/json' }, {"status": 404, "message": "Page not found"});
            }
        }
    });
};

module.exports = {
    onMessage: onMessage
};
