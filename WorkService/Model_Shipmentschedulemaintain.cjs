const {
    ConnectPG_DB,
    DisconnectPG_DB,
    ConnectOracleDB,
    DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetURL = async function (req, res) {
    var query = "";
    try {
        const Conn = await ConnectOracleDB("PCTTTEST");
        const { loginID, systemID } = req.body;
        query += `
                SELECT REPLACE(T.APP_URL, 'P_LOGIN', '${loginID}') AS F_URL
                FROM FPC.NAP_APPLICATION T
                WHERE T.APP_ID = '${systemID}'		
   `;
        const result = await Conn.execute(query);
        const jsonData = result.rows.map(row => ({
            F_URL: row[0],
        }));

        res.status(200).json(jsonData);
        DisconnectOracleDB(Conn);
    } catch (error) {
        writeLogError(error.message, query);
        res.status(500).json({ message: error.message });
    }
};

module.exports.GetBuild = async function (req, res) {
    var query = "";
    try {
        const Conn = await ConnectOracleDB("PCTTTEST");
        const { strprdname } = req.body;
        query += `
                SELECT DISTINCT DECODE(T.FRC_KEY_2,'*','SKIP BUILD',T.FRC_KEY_2) AS F_TEXT,T.FRC_KEY_2 AS F_VAL,1 AS F_SEQ	
                FROM FPCC_CONTROL_RECORD T	
                WHERE T.FRC_TYPE ='0005' AND UPPER(T.FRC_KEY_1) = UPPER('${strprdname}')	
                UNION ALL	
                SELECT '-SELECT-','',0 FROM DUAL	
                ORDER BY 3,2		
                `;
        const result = await Conn.execute(query);
        const jsonData = result.rows.map(row => ({
            build: row[1],
            label: row[0]
        }));

        res.status(200).json(jsonData);
        DisconnectOracleDB(Conn);
    } catch (error) {
        writeLogError(error.message, query);
        res.status(500).json({ message: error.message });
    }
};

module.exports.Getdata = async function (req, res) {
    var query = "";
    try {
        const Conn = await ConnectOracleDB("PCTTTEST");
        const { strprdname, strbuild } = req.body;
        query += `
 SELECT T.FRC_KEY_1 AS F_PRODUCT	
  ,T.FRC_KEY_2 AS F_BUILD	
  ,T.FRC_VALUE_CHR_2 AS F_LINE	
  ,T.FRC_VALUE_DATE_1 AS F_FIRST_DATE	
  ,T2.FRC_VALUE_DATE_1 AS F_SECOND_DATE	
  ,(	
        SELECT DISTINCT RTRIM(XMLAGG(XMLELEMENT(E, UPPER(V.LOT) || ', ')).EXTRACT('//text()'), ',') AS F_LOT	
        FROM (	
            SELECT TLOT.LOT	
               , NVL((SELECT L.LOT_MASTER_ROLL FROM FPC_LOT L WHERE L.LOT= TLOT.LOT)	
                 ,NVL((SELECT L2.LOT_MASTER_ROLL 	
                       FROM FPC_LOT L1 	
                            , FPC_LOT L2	
                       WHERE L1.LOT= TLOT.LOT	
                             AND L1.LOT_TRANSFER_REF_NO = L2.LOT )	
                      , NVL((SELECT L3.LOT_MASTER_ROLL 	
                             FROM FPC_LOT L1 	
                                  , FPC_LOT L2	
                                  , FPC_LOT L3	
                             WHERE L1.LOT= TLOT.LOT	
                                   AND L1.LOT_TRANSFER_REF_NO = L2.LOT 	
                                   AND L2.LOT_TRANSFER_REF_NO = L3.LOT )	
                            ,NVL(( SELECT L4.LOT_MASTER_ROLL 	
                                   FROM FPC_LOT L1 	
                                        , FPC_LOT L2	
                                        , FPC_LOT L3	
                                        , FPC_LOT L4	
                                   WHERE L1.LOT = TLOT.LOT	
                                         AND L1.LOT_TRANSFER_REF_NO = L2.LOT 	
                                         AND L2.LOT_TRANSFER_REF_NO = L3.LOT 	
                                         AND L3.LOT_TRANSFER_REF_NO = L4.LOT )	
                                  , NVL(( SELECT L5.LOT_MASTER_ROLL 	
                                           FROM FPC_LOT L1 	
                                                , FPC_LOT L2	
                                                , FPC_LOT L3	
                                                , FPC_LOT L4	
                                                , FPC_LOT L5	
                                           WHERE L1.LOT= TLOT.LOT	
                                                 AND L1.LOT_TRANSFER_REF_NO = L2.LOT 	
                                                 AND L2.LOT_TRANSFER_REF_NO = L3.LOT 	
                                                 AND L3.LOT_TRANSFER_REF_NO = L4.LOT 	
                                                 AND L4.LOT_TRANSFER_REF_NO = L5.LOT )	
                                          ,( SELECT L6.LOT_MASTER_ROLL 	
                                             FROM FPC_LOT L1	
                                                  , FPC_LOT L2	
                                                  , FPC_LOT L3	
                                                  , FPC_LOT L4	
                                                  , FPC_LOT L5	
                                                  , FPC_LOT L6	
                                             WHERE L1.LOT= TLOT.LOT	
                                                   AND L1.LOT_TRANSFER_REF_NO = L2.LOT 	
                                                   AND L2.LOT_TRANSFER_REF_NO = L3.LOT 	
                                                   AND L3.LOT_TRANSFER_REF_NO = L4.LOT 	
                                                   AND L4.LOT_TRANSFER_REF_NO = L5.LOT 	
                                                   AND L5.LOT_TRANSFER_REF_NO = L6.LOT )	
                                        )	
                                )	
                           )	
                     )	
               )  AS MASTER_ROLL	
            FROM FPC_LOT TLOT	
            WHERE UPPER(TLOT.LOT_PRD_NAME) =UPPER( '${strprdname}')) V	
        WHERE (SUBSTR(V.MASTER_ROLL,2,INSTR(SUBSTR(V.MASTER_ROLL,2,LENGTH(V.MASTER_ROLL)-1),'-')-1) = '${strbuild}' OR '${strbuild}' = '*')	
                    AND ROWNUM<=100  	
   ) AS F_LOT	
 FROM FPCC_CONTROL_RECORD T LEFT JOIN FPCC_CONTROL_RECORD T2 ON T2.FRC_TYPE = T.FRC_TYPE	
                                                            AND T2.FRC_KEY_1 = T.FRC_KEY_1	
                                                            AND T2.FRC_KEY_2 = T.FRC_KEY_2 	
                                                            AND T2.FRC_KEY_3 = '2'	
 WHERE T.FRC_TYPE ='0005'	
      AND UPPER(T.FRC_KEY_1) = UPPER('${strprdname}')	
      AND UPPER(T.FRC_KEY_2) = UPPER('${strbuild}')	
      AND T.FRC_KEY_3 = '1'		
                `;
        const result = await Conn.execute(query);
        const jsonData = result.rows.map(row => ({
            F_PRODUCT: row[0],
            F_BUILD: row[1],
            F_LINE: row[2],
            F_FIRST_DATE: row[3],
            F_SECOND_DATE: row[4],
            F_LOT: row[5],
        }));

        res.status(200).json(jsonData[0]);
        DisconnectOracleDB(Conn);
    } catch (error) {
        writeLogError(error.message, query);
        res.status(500).json({ message: error.message });
    }
};


module.exports.SaveData = async function (req, res) {
    var query = "";
    try {
        const Conn = await ConnectOracleDB("PCTTTEST");
        const { firstshipment, loginid, strprdname, strbuild } = req.body;
        query += `
                UPDATE FPCC_CONTROL_RECORD T
                SET T.FRC_VALUE_DATE_1 = TO_DATE(:Update_shipment,'DD/MM/YYYY')	
                    ,T.FRC_VALUE_CHR_14=TO_CHAR(SYSDATE, 'DD/MM/YYYY HH24:MI:SS')
                    ,T.FRC_VALUE_CHR_15= :Update_loginid
                WHERE T.FRC_TYPE ='0005'	
                      AND UPPER(T.FRC_KEY_1) = UPPER(:Update_prdname)	
                      AND T.FRC_KEY_2 = :Update_strbuild	
                      AND T.FRC_KEY_3 = '1'	
                `;
        const params = {
            Update_shipment: firstshipment,
            Update_loginid: loginid,
            Update_prdname: strprdname,
            Update_strbuild: strbuild,
        };
        const result = await Conn.execute(query, params, { autoCommit: true });
        res.status(200).json(result.rows);
        DisconnectOracleDB(Conn);
    } catch (error) {
        writeLogError(error.message, query);
        res.status(500).json({ message: error.message });
    }
};

module.exports.SaveData2 = async function (req, res) {
    var query = "";
    try {
        const Conn = await ConnectOracleDB("PCTTTEST");
        const { secondshipment, loginid, strprdname, strbuild } = req.body;
        query += `
                UPDATE FPCC_CONTROL_RECORD T
                SET T.FRC_VALUE_DATE_1 = TO_DATE(:Update_shipment ,'DD/MM/YYYY')	
                    ,T.FRC_VALUE_CHR_14 = TO_CHAR(SYSDATE, 'DD/MM/YYYY HH24:MI:SS')
                    ,T.FRC_VALUE_CHR_15 = :Update_loginid
                WHERE T.FRC_TYPE ='0005'	
                      AND UPPER(T.FRC_KEY_1) = UPPER(:Update_prdname)	
                      AND T.FRC_KEY_2 = :Update_strbuild
                      AND T.FRC_KEY_3 = '2'	
                `;
        const params = {
            Update_shipment: secondshipment,
            Update_loginid: loginid,
            Update_prdname: strprdname,
            Update_strbuild: strbuild,
        };
        const result = await Conn.execute(query, params, { autoCommit: true });
        res.status(200).json(result.rows);
        DisconnectOracleDB(Conn);
    } catch (error) {
        writeLogError(error.message, query);
        res.status(500).json({ message: error.message });
    }
};

