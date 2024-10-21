const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

// 
module.exports.Search = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    // const {  PoNo,Date846} = req.body;
    query += `
        SELECT T.CMM_KEY_1 AS F_PRODUCT,
        T.CMM_KEY_2 AS F_PROCESS,
        T.CMM_KEY_3 AS F_MACHINE														
        ,T.CMM_VALUE_NUM_1 AS F_CHAMBER,
        T.CMM_VALUE_NUM_2 AS F_MODE,
        T.CMM_VALUE_CHR_1 AS F_HOLDING														
        FROM FPCC_CONTROL_MASTER_MAINTAIN T														
        WHERE T.CMM_TYPE = '0034'														
       	--AND (T.CMM_KEY_1 = 'PARAMETER_PRODUCT' OR 'PARAMETER_PRODUCT' = 'ALL')													
        ORDER BY T.CMM_KEY_1,T.CMM_KEY_2 `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map(row => ({
        PRODUCT : row[0],
        PROCESS : row[1],
        MACHINE : row[2],
        CHAMBER : row[3],
        MODE : row[4],
        HOLDING : row[5],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
