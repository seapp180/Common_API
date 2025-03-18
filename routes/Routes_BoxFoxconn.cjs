const express = require("express");
const router = express.Router();
const Model_BoxFoxconn = require("../WorkService/Model_BoxFoxconn.cjs");

router.get("/GetUser", Model_BoxFoxconn.GetUser);
router.get("/GetProductKey", Model_BoxFoxconn.GetProductKey);
router.post("/GetBoxNo", Model_BoxFoxconn.GetBoxNo);
router.post("/GetproductScan", Model_BoxFoxconn.GetproductScan);
router.post("/GetProductName", Model_BoxFoxconn.GetProductName);
router.post("/GetDataPackLabel", Model_BoxFoxconn.GetDataPackLabel);
router.post("/InsertBoxFoxCoonn", Model_BoxFoxconn.InsertBoxFoxCoonn);  //ยังไม่เสร็จ 18/03/2025
module.exports = router;