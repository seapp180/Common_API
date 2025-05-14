const express = require("express");
const router = express.Router();
const Model_BoxFoxconn = require("../WorkService/Model_BoxFoxconn.cjs");

router.get("/GetUser", Model_BoxFoxconn.GetUser);
router.post("/GetFactoryCode", Model_BoxFoxconn.GetFactoryCode);
router.get("/GetProductKey", Model_BoxFoxconn.GetProductKey);
router.post("/GetBoxNo", Model_BoxFoxconn.GetBoxNo);
router.post("/GetproductScan", Model_BoxFoxconn.GetproductScan);
router.post("/GetProductName", Model_BoxFoxconn.GetProductName);
router.post("/GetDataPackLabel", Model_BoxFoxconn.GetDataPackLabel);
router.post("/InsertBoxMSTR", Model_BoxFoxconn.InsertBoxMSTR);  
router.post("/InsertBoxDet", Model_BoxFoxconn.InsertBoxDet);  
router.post("/InsertBoxDetail", Model_BoxFoxconn.InsertBoxDetail);  
router.post("/ddlProduct", Model_BoxFoxconn.ddlProduct);
// router.post("/ddlPSearchBoxFoxConnack", Model_BoxFoxconn.ddlPSearchBoxFoxConnack);
router.post("/SearchBoxFoxConn", Model_BoxFoxconn.SearchBoxFoxConn);
router.post("/GetddlProduct", Model_BoxFoxconn.GetddlProduct);
router.post("/DataBox_Qty", Model_BoxFoxconn.DataBox_Qty);
router.post("/DataPPL_QTYfoxConn", Model_BoxFoxconn.DataPPL_QTYfoxConn);
router.post("/GetEdit_MSTR", Model_BoxFoxconn.GetEdit_MSTR);
router.post("/GetEdit_BoxDet", Model_BoxFoxconn.GetEdit_BoxDet);
router.post("/GetEdit_BoxDet_Detail", Model_BoxFoxconn.GetEdit_BoxDet_Detail);
router.post("/Update_BoxMSTR", Model_BoxFoxconn.Update_BoxMSTR);
router.post("/updateDeleteRejectFoxconn", Model_BoxFoxconn.updateDeleteRejectFoxconn);
router.post("/UpdateAddReject", Model_BoxFoxconn.UpdateAddReject);
router.post("/DeleteBoxDet_Foxconn", Model_BoxFoxconn.DeleteBoxDet_Foxconn);
router.post("/DeleteBoxDetDetail_Foxconn", Model_BoxFoxconn.DeleteBoxDetDetail_Foxconn);
router.post("/UpdateBoxDetDetail", Model_BoxFoxconn.UpdateBoxDetDetail);
router.post("/UpdateBoxDet", Model_BoxFoxconn.UpdateBoxDet);
router.post("/UpdateSeqDet", Model_BoxFoxconn.UpdateSeqDet);
router.post("/DeleteBoxMaster", Model_BoxFoxconn.DeleteBoxMaster);
router.post("/DeleteBoxALL_DET", Model_BoxFoxconn.DeleteBoxALL_DET);
router.get("/GetLink", Model_BoxFoxconn.GetLink);
router.post("/GetShipTo", Model_BoxFoxconn.GetShipTo);
router.post("/GetShipTo_2", Model_BoxFoxconn.GetShipTo_2);
router.post("/GetLinkWH", Model_BoxFoxconn.GetLinkWH);
router.post("/GetLinkLabel", Model_BoxFoxconn.GetLinkLabel);
router.post("/GetScanShelf", Model_BoxFoxconn.GetScanShelf);



module.exports = router;