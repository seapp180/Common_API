const express = require("express");
const router = express.Router();
const Summary = require("../WorkService/Model_zPo_Summary.cjs");


router.post("/Status", Summary.Status);
router.post("/Po_CountType", Summary.Po_CountType);
router.post("/PO_Complete", Summary.PO_Complete);
router.post("/PO_All", Summary.PO_All);
router.post("/PO_Outstanding", Summary.PO_Outstanding);
router.post("/Summary_search", Summary.Summary_search);

module.exports = router;