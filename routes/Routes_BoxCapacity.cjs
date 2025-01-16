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











module.exports = router;