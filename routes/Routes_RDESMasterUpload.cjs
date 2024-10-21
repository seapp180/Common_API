const express = require("express");
const router = express.Router();
const RDESMasterUpload = require("../WorkService/Model_RDESMasterUpload.cjs");


router.post("/Search", RDESMasterUpload.Search);


module.exports = router;
