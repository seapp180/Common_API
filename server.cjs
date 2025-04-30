const express = require("express");
const app = express();
const port = 4005;
const oracledb = require("oracledb");
const cors = require('cors');
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
const UserListReport = require("./routes/Routes_UserListReport.cjs");
const BoxCapacity = require("./routes/Routes_BoxCapacity.cjs");
const zPO_Report = require("./routes/Routes_zPO_Report.cjs");
const zPO_Summary = require("./routes/Routes_zPO_Summary.cjs")
const Oqc_barcode = require("./routes/Routes_Oqc_barcode.cjs");
const Export_Supplier_Customer = require("./routes/Routes_Export_Supplier_Customer.cjs");
const BoxFoxcon = require("./routes/Routes_BoxFoxconn.cjs");
const BoxInv = require("./routes/Routes_BoxInvoice.cjs");

// const BoxFoxcon = require("./routes/Routes_BoxFoxconn.cjs");
// ---------------------------------------- ------------------
app.use("/api/RDESMasterUpload", RDESMasterUpload);
app.use("/api/Common", Common);
app.use("/api/Shipment", Shipmentschedulemaintain);
app.use("/api/QA_ORT_WorkingRecord", QA_ORT_WorkingRecord);
app.use("/api/Analysis_Formular", Analysis_Formular);
app.use("/api/QAORTWorkingRecord", QA_ORT_WorkingRecord);
app.use("/api/UserListReport", UserListReport);
app.use("/api/BoxCapacity", BoxCapacity);
app.use("/api/zPO_Report", zPO_Report);
app.use("/api/zPO_Summary", zPO_Summary);
app.use("/api/Oqc_barcode", Oqc_barcode);
app.use("/api/Export_Supplier_Customer", Export_Supplier_Customer);
app.use("/api/BoxFoxcon", BoxFoxcon);
app.use("/api/BoxSelectInv", BoxInv);

// ----------------------------------------------------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
  