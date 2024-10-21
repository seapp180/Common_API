const {
    ConnectPG_DB,
    DisconnectPG_DB,
    ConnectOracleDB,
    DisconnectOracleDB,
  } = require("../Conncetion/DBConn.cjs");
  const oracledb = require("oracledb");
  const { writeLogError } = require("../Common/LogFuction.cjs");
  
  
  
  
  module.exports.Prt_poz = async function (req, res) {
    let Conn;
    try {
      const { PoNo} = req.body;
       Conn = await ConnectOracleDB("QAD");
        const result = await Conn.execute(
        `BEGIN
           :cursor := PR.POZ_REPORT.RPT_POZ(:po_no);
         END;`,
        {
          po_no: PoNo,  
          cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
      );
      const cursor = result.outBinds.cursor;
      let row;
      const rows = [];
      while ((row = await cursor.getRow())) {
        rows.push(row);
      }
      await cursor.close();
      const jsonData = rows.map(row => ({
        PRT_PO_NO : row[0],
        PRT_ORDER_DATE : row[1],
        PRT_DUE_DATE : formatNumberWithCommas(row[2]),
        PRT_ORDER_QTY : row[3],
        PRT_EDI_STATUS : row[4],
        PRT_860_DATE : row[5],
        PRT_856_DATE: row[6],
        PRT_846_DATE: row[7],
        PRT_810_DATE: row[8]
      }));
      
      res.json(jsonData);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error occurred');
    } finally {
      if (Conn) {
        try {
          await Conn.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  };
  
  module.exports.Search860 = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      const {  PoNo,Date860} = req.body;
      query += `
            SELECT H.POCH_OEM_PO AS FETL_PO									
            ,H.POCH_APPLE_PO AS APPLE_PO									
            ,H.POCH_CHANGE_REV AS REV									
            ,H.POCH_REF_CHANGE_NO AS REF_CHANGE_NO									
            ,TO_CHAR(H.POCH_SEND_DATE,'DD/MM/YYYY') AS RECEIVE_DATE									
            ,TO_CHAR(H.POCH_PO_DATE,'DD/MM/YYYY') AS PO_DATE									
            ,TO_CHAR(H.POCH_PO_CS_REQUEST_DATE ,'DD/MM/YYYY') AS APPLE_REQ_DATE								
            ,DECODE(D.POCD_CHANGE_TYPE_CODE,'CA',D.POCD_CHANGE_QUANTITY,'DI',NULL,NULL) AS CHANGE_QTY									
            ,D.POCD_APPLE_PART_NO AS APPLE_PART_NO									
            ,D.POCD_APPLE_PART_DESC AS APPLE_PART_DESC									
            ,DECODE(D.POCD_CHANGE_TYPE_CODE,'CA','CHANGE QTY','DI','CANCEL PO','') AS CHANGE_TYPE									
            FROM PR.POZ_POCS_HEADER H INNER JOIN PR.POZ_POCS_DETAIL D ON H.POCH_CONTROL_ID=D.POCD_CONTROL_ID									
            WHERE H.POCH_OEM_PO='${PoNo}'	
            AND TO_CHAR(H.POCH_PO_CS_REQUEST_DATE,'DD/MM/YYYY') = '${Date860}'	
            ORDER BY H.POCH_CHANGE_REV	
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        FETL_PO : row[0],
        APPLE_PO : row[1],
        REV : row[2],
        REF_CHANGE_NO : row[3],
        RECEIVE_DATE : row[4],
        PO_DATE : row[5],
        APPLE_REQ_DATE: row[6],
        CHANGE_QTY:formatNumberWithCommas(row[7]),
        APPLE_PART_NO: row[8],
        APPLE_PART_DESC: row[9],
        CHANGE_TYPE: row[10]
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports.GetProductTYPE0034 = async function (req, res) {
    var query = "";
    try {
        console.log('เข้า')
      const Conn = await ConnectOracleDB("FPC");
      query += `
                SELECT DISTINCT T.CMM_KEY_1 AS F_PRODUCT																	
                FROM FPCC_CONTROL_MASTER_MAINTAIN T																	
                WHERE T.CMM_TYPE = '0034'																	
                ORDER BY 1		
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        value: row[0],
        label: row[0],
      }));
      
      jsonData.unshift({
        value: 'ALL',
        label: 'ALL',
      });
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };

   