const express = require("express");
const router = express.Router();
const zPO_Report = require("../WorkService/Model_zPO_Report.cjs");


router.post("/Prt_Poz", zPO_Report.Prt_poz);
router.post("/Search860", zPO_Report.Search860);
router.post("/Search846", zPO_Report.Search846);
router.post("/Search856", zPO_Report.Search856);
router.post("/Search810", zPO_Report.Search810);

module.exports = router;