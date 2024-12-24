const express = require("express");
const router = express.Router();
const QA_ORT_WorkingRecord = require("../WorkService/Model_QA_ORT_WorkingRecord.cjs");

router.post("/SearchQAORTWorkingRecord",QA_ORT_WorkingRecord.SearchQAORTWorkingRecord);
router.post("/ProductNameQAORTWorkingRecord",QA_ORT_WorkingRecord.ProductNameQAORTWorkingRecord);
router.post("/ItemTestQAORTWorkingRecord",QA_ORT_WorkingRecord.ItemTestQAORTWorkingRecord);

module.exports = router;