const express = require("express");
const router = express.Router();
const Analysis = require("../WorkService/Model_Analysis_Formular_Master.cjs");

router.post("/GetUnit",Analysis.GetUnit);
router.post("/GetProcess",Analysis.GetProcess);
router.post("/GetMachine",Analysis.GetMachine);
router.post("/GetBath",Analysis.GetBath);
router.post("/GetChemical",Analysis.GetChemical);
router.post("/Search_Analysis",Analysis.Search_Analysis);






module.exports = router;