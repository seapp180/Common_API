const express = require("express");
const router = express.Router();
const Analysis = require("../WorkService/Model_Analysis_Formular_Master.cjs");

router.post("/GetUnit",Analysis.GetUnit);
router.post("/GetProcess",Analysis.GetProcess);
router.post("/GetMachine",Analysis.GetMachine);
router.post("/GetBath",Analysis.GetBath);
router.post("/GetChemical",Analysis.GetChemical);
router.post("/Search_Analysis",Analysis.Search_Analysis);
router.post("/GetUnitPopup",Analysis.GetUnitPopup);
router.post("/GetProcessPopup",Analysis.GetProcessPopup);
router.post("/GetMachinePopup",Analysis.GetMachinePopup);
router.post("/GetFileFormat",Analysis.GetFileFormat);
router.post("/GetBathValue",Analysis.GetBathValue);
router.post("/CheckChemical",Analysis.CheckChemical);
router.post("/Ins_Chem",Analysis.Ins_Chem);
router.post("/Update_Chem",Analysis.Update_Chem);
router.post("/CheckChemDesc",Analysis.CheckChemDesc);
router.post("/Change_ChemID",Analysis.Change_ChemID);
router.post("/CheckMcChemBath",Analysis.CheckMcChemBath);
router.post("/DeleteChem",Analysis.DeleteChem);








module.exports = router;