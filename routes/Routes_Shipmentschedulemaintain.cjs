const express = require("express");
const router = express.Router();
const Shipmentschedulemaintain = require("../WorkService/Model_Shipmentschedulemaintain.cjs");

router.post("/GetURL", Shipmentschedulemaintain.GetURL);
router.post("/GetBuild", Shipmentschedulemaintain.GetBuild);
router.post("/Getdata", Shipmentschedulemaintain.Getdata);
router.post("/SaveData", Shipmentschedulemaintain.SaveData);
router.post("/SaveData2", Shipmentschedulemaintain.SaveData2);

module.exports = router;