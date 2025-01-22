const express = require("express");
const router = express.Router();
const UserListReport = require("../WorkService/Model_UserListReport.cjs");

router.post("/GetDataMFG", UserListReport.GetDataMFG);
router.post("/GetDataMFGList", UserListReport.GetDataMFGList);
router.post("/GetFactory", UserListReport.GetFactory);
router.post("/DataSearch", UserListReport.DataSearch);

module.exports = router;