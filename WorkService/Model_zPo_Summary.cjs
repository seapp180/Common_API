const {
    ConnectPG_DB,
    DisconnectPG_DB,
    ConnectOracleDB,
    DisconnectOracleDB,
  } = require("../Conncetion/DBConn.cjs");
  const oracledb = require("oracledb");
  const { writeLogError } = require("../Common/LogFuction.cjs");
  
  module.exports.Status = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      query += `
       SELECT T.POZST_CODE AS F_VAL,T.POZST_DESC AS F_TXT,T.POZST_SEQ,1	
        FROM PR.POZ_STATUS T	
        UNION ALL	
        SELECT 'ALL','ALL',0,0 FROM DUAL	
        ORDER BY 4,3	
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
         value : row[0],
         text : row[1],
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports.Po_CountType = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      query += `
          SELECT 'COMPLETED' AS F_TYPE,COUNT(H.POAH_OEM_PO) AS F_COUNT,1 AS SEQ
          FROM PR.POZ_OEMPO_HEADER H INNER JOIN PR.POZ_OEMPO_DETAIL D ON D.POAD_CONTROL_ID =H.POAH_CONTROL_ID
                        INNER JOIN PR.POZ_STATUS S ON S.POZST_CODE=H.POAH_EDI_STATUS
          WHERE H.POAH_EDI_STATUS IN ('CANCEL','CLOSE')
          UNION
          SELECT 'OUTSTANDING' AS F_TYPE,COUNT(H.POAH_OEM_PO) AS F_COUNT,2 AS SEQ
          FROM PR.POZ_OEMPO_HEADER H INNER JOIN PR.POZ_OEMPO_DETAIL D ON D.POAD_CONTROL_ID =H.POAH_CONTROL_ID
                        INNER JOIN PR.POZ_STATUS S ON S.POZST_CODE=H.POAH_EDI_STATUS
          WHERE H.POAH_EDI_STATUS NOT IN ('CANCEL','CLOSE')
          ORDER BY 3
      `;
      const result = await Conn.execute(query);
      const jsonData = {
        Type_Complete : result.rows[0][1],
        Type_Outstanding :result.rows[1][1],
        Type_All:result.rows[0][1]+result.rows[1][1]
      };
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports.PO_Complete = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      query += `
     SELECT TO_CHAR(H.POAH_PO_DATE,'DD/MM/YYYY') AS F_PO_DATE
        ,H.POAH_FETL_PO AS F_PONO	
        ,TO_CHAR(H.POAH_DELIVERY_REQUEST_DATE,'DD/MM/YYYY') AS F_DUE_DATE	
        ,D.POAD_ORDER_QUANTITY AS F_QTY	
        ,S.POZST_DESC AS F_STATUS	
      FROM PR.POZ_OEMPO_HEADER H INNER JOIN PR.POZ_OEMPO_DETAIL D ON D.POAD_CONTROL_ID =H.POAH_CONTROL_ID	
                    INNER JOIN PR.POZ_STATUS S ON S.POZST_CODE=H.POAH_EDI_STATUS	
      WHERE H.POAH_EDI_STATUS IN ('CANCEL','CLOSE')	
      ORDER BY H.POAH_PO_DATE	
  
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        F_PO_DATE : row[0],
        F_PONO : row[1],
        F_DUE_DATE : row[2],
        F_QTY : row[3],
        F_STATUS : row[4],
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports.PO_Outstanding = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      query += `
        SELECT TO_CHAR(H.POAH_PO_DATE,'DD/MM/YYYY') AS F_PO_DATE
          ,H.POAH_FETL_PO AS F_PONO	
          ,TO_CHAR(H.POAH_DELIVERY_REQUEST_DATE,'DD/MM/YYYY') AS F_DUE_DATE	
          ,D.POAD_ORDER_QUANTITY AS F_QTY	
          ,S.POZST_DESC AS F_STATUS	
        FROM PR.POZ_OEMPO_HEADER H INNER JOIN PR.POZ_OEMPO_DETAIL D ON D.POAD_CONTROL_ID =H.POAH_CONTROL_ID	
                      INNER JOIN PR.POZ_STATUS S ON S.POZST_CODE=H.POAH_EDI_STATUS	
        WHERE H.POAH_EDI_STATUS NOT IN ('CANCEL','CLOSE')	
        ORDER BY H.POAH_PO_DATE	
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        F_PO_DATE : row[0],
        F_PONO : row[1],
        F_DUE_DATE : row[2],
        F_QTY : row[3],
        F_STATUS : row[4],
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports.PO_All = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      query += `
        SELECT TO_CHAR(H.POAH_PO_DATE,'DD/MM/YYYY') AS F_PO_DATE
          ,H.POAH_FETL_PO AS F_PONO	
          ,TO_CHAR(H.POAH_DELIVERY_REQUEST_DATE,'DD/MM/YYYY') AS F_DUE_DATE	
          ,D.POAD_ORDER_QUANTITY AS F_QTY	
          ,S.POZST_DESC AS F_STATUS	
        FROM PR.POZ_OEMPO_HEADER H INNER JOIN PR.POZ_OEMPO_DETAIL D ON D.POAD_CONTROL_ID =H.POAH_CONTROL_ID	
                      INNER JOIN PR.POZ_STATUS S ON S.POZST_CODE=H.POAH_EDI_STATUS	
        ORDER BY H.POAH_PO_DATE	
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        F_PO_DATE : row[0],
        F_PONO : row[1],
        F_DUE_DATE : row[2],
        F_QTY : row[3],
        F_STATUS : row[4],
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  // ,TO_CHAR(H.POCH_SEND_DATE,'DD/MM/YYYY') AS RECEIVE_DATE	..								
  module.exports.Summary_search = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      const {  Status,PO_No,DateFrom,DateTo} = req.body;
      query += `
     SELECT TO_CHAR(H.POAH_PO_DATE,'DD/MM/YYYY') AS F_PO_DATE
      ,H.POAH_FETL_PO AS F_PONO
      ,TO_CHAR(H.POAH_DELIVERY_REQUEST_DATE,'DD/MM/YYYY') AS F_DUE_DATE
      ,D.POAD_ORDER_QUANTITY AS F_QTY
      ,S.POZST_DESC AS F_STATUS
    FROM PR.POZ_OEMPO_HEADER H INNER JOIN PR.POZ_OEMPO_DETAIL D ON D.POAD_CONTROL_ID =H.POAH_CONTROL_ID
                  INNER JOIN PR.POZ_STATUS S ON S.POZST_CODE=H.POAH_EDI_STATUS
    WHERE H.POAH_EDI_STATUS = '${Status}' OR '${Status}' = 'ALL'
          AND (TRIM(UPPER(H.POAH_OEM_PO)) = TRIM(UPPER('${PO_No}')) OR TRIM('${PO_No}') IS NULL)
          AND (TO_CHAR(H.POAH_PO_DATE,'YYYYMMDD') >= '${DateFrom}' OR '${DateFrom}' IS NULL)
          AND (TO_CHAR(H.POAH_PO_DATE,'YYYYMMDD') <= '${DateTo}' OR '${DateTo}' IS NULL)
    ORDER BY H.POAH_PO_DATE
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        F_PO_DATE : row[0],
        F_PONO : row[1],
        F_DUE_DATE : row[2],
        F_QTY : formatNumberWithCommas(row[3]),
        F_STATUS : row[4],
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  const formatNumberWithCommas = (number) => {
    if(number!=null){
      number= number.toLocaleString();
    }
    return number
  };
  
   