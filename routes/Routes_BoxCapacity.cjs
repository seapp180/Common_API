const express = require("express");
const router = express.Router();
const Model_BoxCapacity = require("../WorkService/Model_BoxCapacity.cjs");


router.post("/DDLShipFactory", Model_BoxCapacity.DDLShipFactory);
router.post("/DDLItemProduct", Model_BoxCapacity.DDLItemProduct);
router.post("/SearchBoxCapacity", Model_BoxCapacity.SearchBoxCapacity);
router.post("/InsBoxCapacity", Model_BoxCapacity.InsBoxCapacity);
router.post("/InsLotPacking", Model_BoxCapacity.InsLotPacking);
router.post("/ShipFAC", Model_BoxCapacity.ShipFAC);
router.post("/DataBoxno", Model_BoxCapacity.DataBoxno);
router.post("/DataFullBoxQTY", Model_BoxCapacity.DataFullBoxQTY);
router.post("/DataSeq", Model_BoxCapacity.DataSeq);
router.post("/LotNo", Model_BoxCapacity.LotNo);
router.post("/DataHeader", Model_BoxCapacity.DataHeader);
router.post("/UpdateBoxQty", Model_BoxCapacity.UpdateBoxQty);
router.post("/UpdateManual", Model_BoxCapacity.UpdateManual);
router.post("/DataLotPacking", Model_BoxCapacity.DataLotPacking);
router.post("/DataReceive", Model_BoxCapacity.DataReceive);
router.post("/GetDataBoxMainTain", Model_BoxCapacity.GetDataBoxMainTain);
router.post("/DeleteLotPacking", Model_BoxCapacity.DeleteLotPacking);
router.post("/UpdateSeqLotPacking", Model_BoxCapacity.UpdateSeqLotPacking);
router.post("/UpdateBoxMaster", Model_BoxCapacity.UpdateBoxMaster);
router.post("/DeleteBoxMaintain", Model_BoxCapacity.DeleteBoxMaintain);
router.post("/DataMapping", Model_BoxCapacity.DataMapping);
router.post("/InsBoxCapacity1", Model_BoxCapacity.InsBoxCapacity1);
router.post("/DataRemainQTY_AUTO", Model_BoxCapacity.DataRemainQTY_AUTO);
router.post("/DataLOT_AUTO", Model_BoxCapacity.DataLOT_AUTO);
router.post("/DataMAX_DATE_AUTO", Model_BoxCapacity.DataMAX_DATE_AUTO);
router.post("/DataMAX_SEQ_AUTO", Model_BoxCapacity.DataMAX_SEQ_AUTO);   
router.post("/GetDataGOOD_QTY_FOR_AUTO", Model_BoxCapacity.GetDataGOOD_QTY_FOR_AUTO);
router.post("/INS_UP_AUTO_PACK1", Model_BoxCapacity.INS_UP_AUTO_PACK1);
router.post("/INS_UP_AUTO_PACK2", Model_BoxCapacity.INS_UP_AUTO_PACK2);
router.post("/UpdateAutoSts", Model_BoxCapacity.UpdateAutoSts);
router.post("/DataPPL_QTY", Model_BoxCapacity.DataPPL_QTY);
router.post("/DataLotPackingAuto_Gen", Model_BoxCapacity.DataLotPackingAuto_Gen);
router.post("/DATA_USER", Model_BoxCapacity.DATA_USER);
router.post("/updateReject", Model_BoxCapacity.updateReject);

// router.get("/TEST",Model_BoxCapacity.TEST)










module.exports = router;