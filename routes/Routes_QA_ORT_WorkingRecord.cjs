const express = require("express");
const router = express.Router();
const QA_ORT_WorkingRecord = require("../WorkService/Model_QA_ORT_WorkingRecord.cjs");

router.post("/Search_QA_ORT_WorkingRecord",QA_ORT_WorkingRecord.Search_QA_ORT_WorkingRecord);

module.exports = router;