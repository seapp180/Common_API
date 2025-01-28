const {
  ConnectPG_DB,
  DisconnectPG_DB, 
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../../Common/LogFuction.cjs");

module.exports.GetAlldtDataReport = async function (req, res) {
  var query = "";
  const { strLotNo, strProduct, strDateFrom, strDateTo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `SELECT B.*																																		
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
                            ,CASE WHEN TO_CHAR(T.QOH_DATE,'HH24MI') >= '0800' AND TO_CHAR(T.QOH_DATE,'HH24MI') <= '2000' THEN 'DS' ELSE 'NS' END AS F_SHIFT																																		
                            ,INITCAP(U.USER_NAME) || ' ' || INITCAP(U.USER_SURNAME) AS F_CONFIRM_BY																																		
                    FROM COND.QA_OQC_2D_HEADER T INNER JOIN FPC.FPC_LOT L ON L.LOT=T.QOH_LOT																																		
                                                LEFT JOIN FPC.NAP_USER_LOGIN U ON U.LOGIN_ID=T.QOH_CONFIRM_BY																																		
                    WHERE L.LOT_PRD_NAME LIKE UPPER('${strProduct}') || '%'																																		
                            AND L.LOT LIKE UPPER('${strLotNo}') || '%'																																		
                            AND (TO_CHAR(T.QOH_DATE,'YYYYMMDD') >= '${strDateFrom}' OR '${strDateFrom}' IS NULL)																																		
                            AND (TO_CHAR(T.QOH_DATE,'YYYYMMDD') <= '${strDateTo}' OR '${strDateTo}' IS NULL)																																		
                    ORDER BY T.QOH_DATE,L.LOT_PRD_NAME,T.QOH_LOT																																		
                    ) B	`;
    const result = await Conn.execute(query);
    DisconnectOracleDB(Conn);
    res.status(200).send(result.rows);
  } catch (error) {
    writeLogError("GetAlldtData", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
module.exports.GetpopUpdataReport = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `SELECT LO.LOT_PRD_NAME AS F_PRODUCT
                        ,LO.LOT AS F_LOT
                        ,TO_CHAR(D.QOD_DATE,'DD/MM/YYYY') AS F_DATE
                        ,D.QOD_SERIAL AS F_SERIAL
                        ,D.QOD_GRADE AS F_GRADE
                    FROM COND.QA_OQC_2D_DATA D INNER JOIN FPC.FPC_LOT LO ON LO.LOT=D.QOD_LOT
                    WHERE D.QOD_LOT='${strLotNo}' `;
    const result = await Conn.execute(query);
    DisconnectOracleDB(Conn);
    res.status(200).send(result.rows);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).send({ message: error.message });
  }
};
