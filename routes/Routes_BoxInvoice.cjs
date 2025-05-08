const express = require("express");
const router = express.Router();
const Model_BoxInvoice = require("../WorkService/Model_BoxInvoice.cjs");

router.get("/GetFac", Model_BoxInvoice.GetFac);
router.post("/GetInv", Model_BoxInvoice.GetInv);
router.post("/GetProduct", Model_BoxInvoice.GetProduct);
router.post("/GetSeq_Date",Model_BoxInvoice.GetSeq_Date)
router.post("/DataBoxDetail",Model_BoxInvoice.DataBoxDetail)
router.post("/DataSelectBox",Model_BoxInvoice.DataSelectBox)
router.post("/Search",Model_BoxInvoice.Search)
router.post("/UpdataStatusNew",Model_BoxInvoice.UpdataStatusNew)
router.post("/DataSelectBoxNew",Model_BoxInvoice.DataSelectBoxNew)
router.post("/DataSelectBoxeEdit",Model_BoxInvoice.DataSelectBoxeEdit)
router.post("/UpdataStatusEdit_NotCheck",Model_BoxInvoice.UpdataStatusEdit_NotCheck)
router.post("/UpdataStatusEdit_Check",Model_BoxInvoice.UpdataStatusEdit_Check)






module.exports = router;