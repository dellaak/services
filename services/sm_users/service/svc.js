const auth_cli = require('./lib/auth');
const user = require('./lib/users');


    function onMessage(headers, params, query, body, logger, requester, reply) {
        auth_cli.isAuthorized(headers, function(authorized, token) {
            if(!authorized || !token) {
                reply.send(401, { 'Content-type': 'application/json' }, { error: 'Unauthorized' });
            } else {
                if(headers.url.endsWith('/user_update') && headers.method === 'POST' ) {
                    user.update(token.username ,body.phone, body.socialsList ,body.description,body.showPhone,body.showEmail,body.selectedColor, token.isCompany,logger, function(ret) {
                         reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                     });
                 } else if(headers.url.endsWith('/user_updateusername')  && headers.method === 'PUT') {
                    user.usernameUpdate(token.username ,body.newusername, token.isCompany,logger, function(ret) {
                        reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                    });
                }  
                else if(headers.url.endsWith('/user_updatepassword')  && headers.method === 'PUT') {
                    user.passwordUpdate(token.username ,body.newpassword, token.isCompany,logger, function(ret) {
                        reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                    });
                    
                }
                else if(headers.url.endsWith('/user_delete')  && headers.method === 'POST') {
                    user.deleteUser(token.username , token.isCompany,logger, function(ret) {
                        reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                    });
                    
                } 

                else if(headers.url.endsWith('/user_follow')  && headers.method === 'POST') {
                    user.followUser(token.username ,body.username, body.isCompany,token.isCompany,logger, function(ret) {
                        reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                    });
                    
                }    else if(headers.url.endsWith('/user_unfollow')  && headers.method === 'POST') {
                    user.unFollowUser(token.username,body.username,body.isCompany,token.isCompany,logger, function(ret) {
                        reply.send(ret.status, { 'Content-type': 'application/json' }, ret);
                    });
                    
                }  
                else {
                    reply.send(404, { 'Content-type': 'application/json' }, {"status": 404, "message": "Page not found"});
                }
            }
        });
    };


module.exports = {
    onMessage: onMessage
};
