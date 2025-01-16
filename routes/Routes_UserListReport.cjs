const express = require("express");
const router = express.Router();
const UserListReport = require("../WorkService/Model_UserListReport.cjs");

router.post("/GetFactory", UserListReport.GetFactory);

module.exports = router;