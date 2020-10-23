const QRCode = require('qrcode')

const createUserQr= async (username, logger, callback) => {

  // buf = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
 let link = 'https://www.sharemysocials.com/'

  QRCode.toDataURL(`${link}${username}`)
  .then(url => {
    callback({status:200,
      message:url})
  })
  .catch(err => {
    logger.error(JSON.stringify(err))
    callback({status:200,
      message:JSON.stringify(err)})
  })

}

module.exports = { createUserQr: createUserQr };
