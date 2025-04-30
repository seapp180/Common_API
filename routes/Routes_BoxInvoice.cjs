const express = require("express");
const router = express.Router();
const Model_BoxInvoice = require("../WorkService/Model_BoxInvoice.cjs");

router.get("/GetFac", Model_BoxInvoice.GetFac);
router.post("/GetInv", Model_BoxInvoice.GetInv);
router.post("/GetProduct", Model_BoxInvoice.GetProduct);
router.post("/GetSeq_Date",Model_BoxInvoice.GetSeq_Date)
router.post("/DataBoxDetail",Model_BoxInvoice.DataBoxDetail)






module.exports = router;