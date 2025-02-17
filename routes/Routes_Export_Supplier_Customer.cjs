const express = require("express");
const router = express.Router();
const Export = require("../WorkService/Model_Export_Supplier_Customer.cjs");

router.post("/GetdataExport", Export.GetdataExport);

module.exports = router;
