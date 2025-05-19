
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.geIPaddress = async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded
      ? forwarded.split(',')[0] 
      : req.connection.remoteAddress;
    
    const ip = clientIp.includes(':') ? clientIp.split(':').pop() : clientIp;
    res.status(200).send({ ip: ip, clientIp });
  } catch (error) {
    writeLogError(error.message, "Cannot get IP address");
    res.status(500).json({ message: error.message });
  }
};