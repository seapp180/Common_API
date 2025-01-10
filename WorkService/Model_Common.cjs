const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetProductTYPE0034 = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                SELECT DISTINCT T.CMM_KEY_1 AS F_PRODUCT																	
                FROM FPCC_CONTROL_MASTER_MAINTAIN T																	
                WHERE T.CMM_TYPE = '0034'																	
                ORDER BY 1		
   `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[0],
    }));

    jsonData.unshift({
      value: "ALL",
      label: "ALL",
    });
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetURL_Home = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { loginID, systemID } = req.body;
    query += `
                SELECT REPLACE(T.APP_URL,'P_LOGIN','${loginID}') AS F_URL															
                FROM FPC.NAP_APPLICATION T															
                WHERE T.APP_ID ='${systemID}'  `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      URL: row[0],
    }));
    // console.log(result.rows,'result.rows');
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
