const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../../Common/LogFuction.cjs");

module.exports.GetAlldtData = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                 SELECT B.*										
                            ,TO_CHAR(B.F_DATE2,'DD/MM/YYYY') AS F_DATE										
                            ,REPLACE(TRIM(TO_CHAR(B.F_GOOD2)),'0','-') AS F_GOOD										
                            ,REPLACE(TRIM(TO_CHAR(B.F_NG2)),'0','-') AS F_NG										
                            ,CASE WHEN B.F_NG2 >0 THEN 'FAIL' ELSE 'PASS' END AS F_JUDGEMENT										
                        FROM										
                        (										
                        SELECT L.LOT_PRD_NAME AS F_PRODUCT										
                                ,T.QOH_LOT AS F_LOT										
                                ,T.QOH_DATE AS F_DATE2										
                                ,T.QOH_LOT_SIZE AS F_LOT_SIZE										
                                ,T.QOH_SAMPLING_SIZE AS F_SAMPLING_SIZE										
                                ,T.QOH_APERTURE AS F__APERTURE										
                                ,(										
                                    SELECT COUNT(D.QOD_SERIAL) AS F_RESULT										
                                    FROM COND.QA_OQC_2D_DATA D INNER JOIN FPC.FPC_LOT LO ON LO.LOT=D.QOD_LOT										
                                                                LEFT JOIN FPC.FPCC_CONTROL_MASTER_MAINTAIN M										
                                                                    ON M.CMM_TYPE='0041'										
                                                                    AND M.CMM_KEY_1='01'										
                                                                    AND LO.LOT_PRD_NAME LIKE CMM_KEY_2 || '%'										
                                                                    AND M.CMM_STATUS='A'										
                                                                    AND M.CMM_VALUE_CHR_1 LIKE '%' || D.QOD_GRADE || '%'										
                                    WHERE D.QOD_LOT=T.QOH_LOT										
                                            AND (D.QOD_GRADE IS NOT NULL AND M.CMM_VALUE_CHR_1 IS NOT NULL)										
                                ) AS F_GOOD2										
                                ,(										
                                    SELECT COUNT(D.QOD_SERIAL) AS F_RESULT										
                                    FROM COND.QA_OQC_2D_DATA D INNER JOIN FPC.FPC_LOT LO ON LO.LOT=D.QOD_LOT										
                                                                LEFT JOIN FPC.FPCC_CONTROL_MASTER_MAINTAIN M										
                                                                    ON M.CMM_TYPE='0041'										
                                                                    AND M.CMM_KEY_1='01'										
                                                                    AND LO.LOT_PRD_NAME LIKE CMM_KEY_2 || '%'										
                                                                    AND M.CMM_STATUS='A'										
                                                                    AND M.CMM_VALUE_CHR_1 LIKE '%' || D.QOD_GRADE || '%'										
                                    WHERE D.QOD_LOT=T.QOH_LOT										
                                            AND (D.QOD_GRADE IS NOT NULL AND M.CMM_VALUE_CHR_1 IS NULL)										
                                ) AS F_NG2										
                                ,T.QOH_MODIFIED_BY AS F_INSPECTOR										
                                ,CASE WHEN to_CHAR(T.QOH_DATE,'HH24MI') >= '0800' AND to_CHAR(T.QOH_DATE,'HH24MI') <= '2000' THEN 'DS' ELSE 'NS' END AS F_SHIFT										
                        FROM COND.QA_OQC_2D_HEADER T INNER JOIN FPC.FPC_LOT L ON L.LOT=T.QOH_LOT										
                        WHERE T.QOH_CONFIRM_DATE IS NULL										
                        ORDER BY T.QOH_DATE										
                        ) B										

                  `;
    const result = await Conn.execute(query);
    if (result.rows.length > 0) {
      const jsonRespone = result.rows.map((item) => ({
        product: item[0],
        lot: item[1],
        date2: item[2],
        lot_size: item[3],
        sampling_size: item[4],
        aperture: item[5],
        good2: item[6],
        ng2: item[7],
        inspector: item[8],
        shift: item[9],
        date: item[10],
        good: item[11],
        ng: item[12],
        judgement: item[13],
      }));
      res.status(200).json(jsonRespone);
    } else {
      res.status(204).json({ message: "Not Found Data" });
    }
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.UpdatedData = async function (req, res) {
  var query = "";
  const { strLotNo, strLogInid } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `					
                        UPDATE COND.QA_OQC_2D_HEADER T	
                          SET T.QOH_CONFIRM_BY=:strLogInid
                              ,T.QOH_CONFIRM_DATE=SYSDATE	
                          WHERE T.QOH_LOT=:strLotNo				
                  `;
    const params = {
      strLogInid: strLogInid,
      strLotNo: strLotNo,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    if (result.rowsAffected > 0) {
      res.status(200).json({ message: "Updated Success" });
    } else {
      res.status(404).json({ message: "Not Found Data" });
    }
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetpopUpdata = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query = `SELECT LO.LOT_PRD_NAME AS F_PRODUCT		
                  ,LO.LOT AS F_LOT		
                  ,TO_CHAR(D.QOD_DATE,'DD/MM/YYYY') AS F_DATE		
                  ,D.QOD_SERIAL AS F_SERIAL		
                  ,D.QOD_GRADE AS F_GRADE		
            FROM COND.QA_OQC_2D_DATA D INNER JOIN FPC.FPC_LOT LO ON LO.LOT=D.QOD_LOT		
            WHERE D.QOD_LOT='${strLotNo}' `;
    const result = await Conn.execute(query);
    if (result.rows.length > 0) {
      const jsonRespone = result.rows.map((item) => ({
        product: item[0],
        lot: item[1],
        date: item[2],
        serial: item[3],
        grade: item[4],
      }));
      res.status(200).json(jsonRespone);
    } else {
      res.status(404).json({ message: "Not Found Data" });
    }
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
