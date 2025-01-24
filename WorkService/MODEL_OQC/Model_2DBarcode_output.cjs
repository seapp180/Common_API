const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../../Common/LogFuction.cjs");

module.exports.GetCheckPrdnamewithLot = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                SELECT T.LOT_PRD_NAME ,T.LOT
                FROM FPC_LOT T
                WHERE T.LOT = '${strLotNo}'
                `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      jsonData = {
        prdName: result.rows[0][0],
        lot: result.rows[0][1],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetCheckRawData = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                 SELECT T.QOD_SERIAL,COUNT(T.QOD_SERIAL) AS F_COUNT
                    FROM COND.QA_OQC_2D_DATA T
                    WHERE T.QOD_LOT='${strLotNo}'
                    GROUP BY T.QOD_SERIAL

                  `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      let dtData = [];
      for (let i = 0; i < result.rows.length; i++) {
        dtData.push({
          Qod_serial: result.rows[i][0],
          F_count: result.rows[i][1],
        });
      }
      jsonData = dtData;
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetCheckNGRawData = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                 SELECT COUNT(D.QOD_SERIAL) AS F_RESULT                     
                    FROM COND.QA_OQC_2D_DATA D INNER JOIN FPC.FPC_LOT LO ON LO.LOT=D.QOD_LOT                      
                                            LEFT JOIN FPC.FPCC_CONTROL_MASTER_MAINTAIN M                     
                                                    ON M.CMM_TYPE='0041'                     
                                                    AND M.CMM_KEY_1='01'                     
                                                    AND LO.LOT_PRD_NAME LIKE CMM_KEY_2 || '%'                      
                                                    AND M.CMM_STATUS='A'                     
                                                    AND M.CMM_VALUE_CHR_1 LIKE '%' || D.QOD_GRADE || '%'                     
                    WHERE D.QOD_LOT='${strLotNo}'
                        AND (D.QOD_GRADE IS NOT NULL AND M.CMM_VALUE_CHR_1 IS NULL) 
                  `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      jsonData = {
        ng_count: result.rows[0][0],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetCheckNGRawData = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                   SELECT T.*
                        FROM COND.QA_OQC_2D_HEADER T
                        WHERE T.QOH_LOT='${strLotNo}'                
                    `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      jsonData = {
        ng_count: result.rows[0][0],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetcheckUserStatus = async function (req, res) {
  var query = "";
  const { strUserIdCode } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                     SELECT T.EMPCODE,T.TNAME,T.TSURNAME,T.STATUS
                        FROM CUSR.CU_USER_HUMANTRIX@PCTTPROD T
                        WHERE T.EMPCODE ='${strUserIdCode}'             
                      `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      jsonData = {
        emp_code: result.rows[0][0],
        tname: result.rows[0][1],
        tsurname: result.rows[0][2],
        status: result.rows[0][3],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetcheckSameQtywithLot = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                       SELECT COUNT(D.QOD_SERIAL) AS F_QTY                    
                        FROM COND.QA_OQC_2D_DATA D                
                        WHERE D.QOD_LOT='${strLotNo}' 
                        `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      jsonData = {
        qty: result.rows[0][0],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

// ขาด merge & insert ข้อมูล