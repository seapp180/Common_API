const express = require("express");
const app = express();
const port = 4005;
const oracledb = require("oracledb");
const cors = require('cors');
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // เพิ่ม headers ที่จำเป็น
}));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
    return res.sendStatus(200);  
  }
  next();
});

// ----------------------------------------------------------
const RDESMasterUpload = require("./routes/Routes_RDESMasterUpload.cjs");
const Common = require("./routes/Routes_Common.cjs")
const Shipmentschedulemaintain = require("./routes/Routes_Shipmentschedulemaintain.cjs");
const QA_ORT_WorkingRecord = require("./routes/Routes_QA_ORT_WorkingRecord.cjs");
const Analysis_Formular = require("./routes/Routes_Anaylsis_Formular.cjs");
// ---------------------------------------- ------------------
app.use("/api/RDESMasterUpload", RDESMasterUpload);
app.use("/api/Common", Common);
app.use("/api/Shipment", Shipmentschedulemaintain);
app.use("/api/QA_ORT_WorkingRecord", QA_ORT_WorkingRecord);
app.use("/api/Analysis_Formular", Analysis_Formular);
// ----------------------------------------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
