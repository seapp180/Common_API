const express = require("express");
const router = express.Router();
const RDESMasterUpload = require("../WorkService/Model_RDESMasterUpload.cjs");


router.post("/Search", RDESMasterUpload.Search);
router.post("/FileFormat", RDESMasterUpload.FileFormat);
router.post("/InsUploadFile", RDESMasterUpload.InsUploadFile);
router.post("/DeleteUploadFile", RDESMasterUpload.DeleteUploadFile);
// router.post("/Updatae", RDESMasterUpload.Updatae);

module.exports = router;
