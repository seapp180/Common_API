const express = require("express");
const router = express.Router();
const QA_ORT_WorkingRecord = require("../WorkService/Model_QA_ORT_WorkingRecord.cjs");

router.post("/SearchQAORTWorkingRecord",QA_ORT_WorkingRecord.SearchQAORTWorkingRecord);

module.exports = router;