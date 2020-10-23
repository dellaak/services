const jwt = require('jwt-simple');
const settings = require('../config/settings');


const auth_client = {
    isAuthorized: function(headers, callback) {
        let token = '' + (headers['Authorization'] || headers['authorization']);
        if(token.substring(0, 7) === 'Bearer ') {
            try {
                token = token.substring(7, token.length);
                let decoded_token = jwt.decode(token, settings.server_secret);

                if (decoded_token.exp > Date.now()) {
                    callback(true, decoded_token);
                } else {
                    callback(false, null);
                }
            } catch (err) {
                callback(false, null);
            }
        } else {
            callback(false, null);
        }
    }
}

module.exports = auth_client;