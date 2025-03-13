const express = require("express");
const router = express.Router();
const Oqc_barcode = require("../WorkService/MODEL_OQC/Model_2DBarcode_output.cjs");
const Oqc_barcode_confirm = require("../WorkService/MODEL_OQC/Model_2DBarcode_confirm.cjs");
const Oqc_barcode_report = require("../WorkService/MODEL_OQC/Model_2DBarcode_Report.cjs");

router.get("/getCheckPrdnamewithLot", Oqc_barcode.GetCheckPrdnamewithLot);
router.get("/getCheckRawData", Oqc_barcode.GetCheckRawData);
router.get("/getCheckNGRawData", Oqc_barcode.GetCheckNGRawData);
router.get("/getCheckDuplicatedata", Oqc_barcode.GetCheckDuplicatedata);
router.get("/getCheckUserStatus", Oqc_barcode.GetcheckUserStatus);
router.get("/getCheckSameQtywithLot", Oqc_barcode.GetcheckSameQtywithLot);
router.post("/InsertOqcoutputData", Oqc_barcode.InsertOqcoutputData);
router.post("/InsertQrcodeTest", Oqc_barcode.InsertQrcodeTest);

//Confirm
router.get("/getAlldtDataConfirm", Oqc_barcode_confirm.GetAlldtData);
router.get("/getpopUpdataConfirm", Oqc_barcode_confirm.GetpopUpdata);
router.post("/UpdatedDataConfirm", Oqc_barcode_confirm.UpdatedData);

// report
router.get("/getAlldtDataReport", Oqc_barcode_report.GetAlldtDataReport);
router.get("/getpopUpdataReport", Oqc_barcode_report.GetpopUpdataReport);










module.exports = router;


