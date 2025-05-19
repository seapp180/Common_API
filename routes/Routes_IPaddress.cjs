const express = require("express");
const router = express.Router();
const IP = require("../WorkService/Model_IPaddress.cjs");

router.get("/getIPaddress", IP.geIPaddress);

module.exports = router;
