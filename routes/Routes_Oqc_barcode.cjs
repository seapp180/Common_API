const express = require("express");
const router = express.Router();
const Oqc_barcode = require("../WorkService/MODEL_OQC/Model_2DBarcode_output.cjs");
const Oqc_barcode_confirm = require("../WorkService/MODEL_OQC/Model_2DBarcode_confirm.cjs");

router.get("/getCheckPrdnamewithLot", Oqc_barcode.GetCheckPrdnamewithLot);
router.get("/getCheckRawData", Oqc_barcode.GetCheckRawData);
router.get("/getCheckNGRawData", Oqc_barcode.GetCheckNGRawData);
router.get("/getCheckUserStatus", Oqc_barcode.GetcheckUserStatus);
router.get("/getCheckSameQtywithLot", Oqc_barcode.GetcheckSameQtywithLot);
// ขาด merge & insert ข้อมูล
router.get("/getAlldtData", Oqc_barcode_confirm.GetAlldtData);


module.exports = router;
