const express = require("express");
const router = express.Router();
const Commnon = require("../WorkService/Model_Common.cjs");

router.post("/GetProduct", Commnon.GetProductTYPE0034);
router.post("/GetURL_Home", Commnon.GetURL_Home);


module.exports = router;
