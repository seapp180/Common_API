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
  
  module.exports.Search856 = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      const {  PoNo,Date856} = req.body;
      query += `
           SELECT H.PAVH_OEM_PO AS FETL_PO			
          ,TO_CHAR(H.PAVH_SEND_DATE,'DD/MM/YYYY') AS RECEIVE_DATE			
          ,H.PAVH_PARTNER_DO AS PARTNER_DO			
          ,H.PAVH_APPLE_RETURN_PO AS APPLE_RETUEN_PO			
          ,TO_CHAR(H.PAVH_SHIPPED_DATE,'DD/MM/YYYY') AS SHIP_DATE			
          ,D.PAVD_SHIP_QUANTITY AS SHIP_QTY			
          FROM PR.POZ_ADVSHP_HEADER H INNER JOIN PR.POZ_ADVSHP_DETAIL D ON H.PAVH_CONTROL_ID=D.PAVD_CONTROL_ID			
          WHERE H.PAVH_OEM_PO='${PoNo}'			
          AND TO_CHAR(H.PAVH_SEND_DATE,'DD/MM/YYYY') = '${Date856}'			
          ORDER BY H.PAVH_SEND_DATE			
   `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        FETL_PO : row[0],
        RECEIVE_DATE : row[1],
        PARTNER_DO : row[2],
        APPLE_RETUEN_PO : row[3],
        SHIP_DATE : row[4],
        SHIP_QTY : formatNumberWithCommas(row[5]),
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports.Search846 = async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      const {  PoNo,Date846} = req.body;
      query += `
              SELECT H.POGH_OEM_PO AS FETL_PO				
              ,H.POGH_APPLE_PO AS APPLE_PO				
              ,TO_CHAR(H.POGH_SEND_DATE,'DD/MM/YYYY') AS SEND_DATE				
              ,H.POGH_GR_NO AS GR_NO				
              ,H.POGH_DO_NO AS DO_NO				
              ,H.POGH_PROFORMA_INV AS PROFORMA_INVOICE				
              ,D.POGD_STOCK_TRANS_QTY AS STOCK_TRANSFER_QTY				
              FROM PR.POZ_GR_HEADER H INNER JOIN PR.POZ_GR_DETAIL D ON H.POGH_CONTROL_ID=D.POGD_CONTROL_ID				
              WHERE H.POGH_OEM_PO='${PoNo}'			
              AND TO_CHAR(H.POGH_SEND_DATE,'DD/MM/YYYY') = '${Date846}'			
              ORDER BY H.POGH_SEND_DATE	`;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        FETL_PO : row[0],
        APPLE_PO : row[1],
        SEND_DATE : row[2],
        GR_NO : row[3],
        DO_NO : row[4],
        PROFORMA_INVOICE : row[5],
        STOCK_TRANSFER_QTY :  formatNumberWithCommas(row[6]),
      }));
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports.Search810= async function (req, res) {
    var query = "";
    try {
      const Conn = await ConnectOracleDB("QAD");
      const {  PoNo,Date810} = req.body;
      query += `
            SELECT H.POIH_OEM_PO AS FETL_PO								
            ,H.POIH_INV_NO								
            ,H.POIH_PROFORMA_INV								
            ,H.POIH_APPLE_PO AS APPLE_PO								
            ,TO_CHAR(H.POIH_SEND_DATE,'DD/MM/YYYY')							
            ,TO_CHAR(H.POIH_INV_DATE,'DD/MM/YYYY')								
            ,H.POIH_CURR_CODE								
            ,H.POIH_VENDOR_NAME								
            ,H.POIH_VENDOR_ADDR1								
            ,H.POIH_VENDOR_ADDR2								
            ,H.POIH_VENDOR_CITY								
            ,H.POIH_VENDOR_POSTAL								
            ,H.POIH_VENDOR_COUNTRY								
            ,H.POIH_VENDOR_STATE								
            ,H.POIH_SHIPTO_NAME								
            ,H.POIH_BILLTO_NAME								
            ,H.POIH_BILLTO_CODE								
            ,H.POIH_PAYER_NAME								
            ,H.POIH_PAYER_CODE								
            ,H.POIH_SOLDTO_NAME								
            ,H.POIH_SOLDTO_CODE								
            ,D.POID_UNIT_PRICE_CODE								
            ,D.POID_UNIT_PRICE								
            ,D.POID_APPLE_PART_NO								
            ,D.POID_PRODUCT_DESC								
            ,D.POID_GR_NO								
            ,D.POID_INV_AMOUNT								
            FROM PR.POZ_INV_HEADER H INNER JOIN PR.POZ_INV_DETAIL D ON H.POIH_CONTROL_ID=D.POID_CONTROL_ID								
            WHERE H.POIH_OEM_PO='${PoNo}'						
            AND TO_CHAR(H.POIH_SEND_DATE,'DD/MM/YYYY') = '${Date810}'	
            ORDER BY H.POIH_SEND_DATE	`;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        FETL_PO : row[0],
        POIH_INV_NO : row[1],
        POIH_PROFORMA_INV : row[2],
        APPLE_PO : row[3],
        POIH_SEND_DATE : row[4],
        POIH_INV_DATE : row[5],
        POIH_CURR_CODE: row[6],
        POIH_VENDOR_NAME: row[7],
        POIH_VENDOR_ADDR1: row[8],
        POIH_VENDOR_ADDR2: row[9],
  
        POIH_VENDOR_CITY: row[10],
        POIH_VENDOR_POSTAL : row[11],
        POIH_VENDOR_COUNTRY : row[12],
        POIH_VENDOR_STATE : row[13],
        POIH_SHIPTO_NAME : row[14],
        POIH_BILLTO_NAME : row[15],
        POIH_BILLTO_CODE : row[16],
        POIH_PAYER_NAME: row[17],
        POIH_PAYER_CODE: row[18],
        POIH_SOLDTO_NAME: row[19],
  
        POIH_SOLDTO_CODE: row[20],
        POID_UNIT_PRICE_CODE: row[21],
        POID_UNIT_PRICE : formatNumberWithCommas(row[22]),
        POID_APPLE_PART_NO : row[23],
        POID_PRODUCT_DESC : row[24],
        POID_GR_NO : row[25],
        POID_INV_AMOUNT : formatNumberWithCommas(row[26]),
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
  
   