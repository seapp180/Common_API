const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.DDLShipFactory = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
      SELECT T.FACTORY_CODE, T.FACTORY_DESC 
      FROM FPC.FPC_FACTORY T 
      WHERE T.FACTORY_CODE <> '1' 
      ORDER BY T.FACTORY_CODE
    `;
    const result = await Conn.execute(query);
    console.log(result.rows, "rows");
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[1],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DDLItemProduct = async function (req, res) {
  var query = "";
  try {
    const { product } = req.body;
    const Conn = await ConnectOracleDB("FPC");
    query += `
       SELECT P.PRD_NAME FROM FPC_PRODUCT P WHERE P.PRD_ITEM_CODE = '${product}'  
      `;
    const result = await Conn.execute(query);
    // const jsonData = result.rows.map((row) => ({
    //   PRD_NAME: row[1],
    // }));
    res.status(200).json(result.rows[0]);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.SearchBoxCapacity = async function (req, res) {
  var query = "";
  const { datalist } = req.body;
  console.log(datalist, "datalist");
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
SELECT 
  F.FACTORY_DESC AS FAC,
  M.BCM_PRD_ITEM_CODE || '/' || P.PRD_NAME AS ITEM,
  M.BCM_BOX_NO AS BOX_NO,
  D.BCD_LOT AS LOT_NO,
  TO_CHAR(D.BCD_PACK_DATE, 'DD/MM/YYYY') AS PACKING_DATE,
  M.BCM_STATUS AS STATUS,
  D.BCD_LOT_QTY AS QUANTITY,
  M.BCM_PACKING_BY AS PACKING_BY
FROM 
  FPC_BOX_CAP_MSTR M
INNER JOIN 
  FPC_FACTORY F ON M.BCM_FACTORY_CODE = F.FACTORY_CODE
INNER JOIN 
  FPC_PRODUCT P ON M.BCM_PRD_ITEM_CODE = P.PRD_ITEM_CODE
LEFT JOIN 
  FPC_BOX_CAP_DET D ON M.BCM_PRD_ITEM_CODE = D.BCD_PRD_ITEM_CODE 
  AND M.BCM_BOX_NO = D.BCD_BOX_NO
WHERE 
  1=1
  AND (M.BCM_PRD_ITEM_CODE = '${datalist.Product}' OR '${datalist.Product}' IS NULL)
  AND (D.BCD_LOT >= '${datalist.LotFrom}' OR '${datalist.LotFrom}' IS NULL)
  AND (D.BCD_LOT <= '${datalist.LotTo}' OR '${datalist.LotTo}' IS NULL)
  AND (TO_CHAR(D.BCD_PACK_DATE, 'YYYY-MM-DD') >= '${datalist.PackingDateFrom}' OR '${datalist.PackingDateFrom}' IS NULL)
  AND (TO_CHAR(D.BCD_PACK_DATE, 'YYYY-MM-DD') <= '${datalist.PackingDateTo}' OR '${datalist.PackingDateTo}' IS NULL)
  AND (M.BCM_BOX_NO = '${datalist.BoxNoSeacrh}' OR '${datalist.BoxNoSeacrh}' IS NULL)
  ORDER BY 3 ASC
      `;
    console.log(query, "SearchBoxCapacity");
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      FAC: row[0],
      ITEM: row[1],
      BOX_NO: row[2],
      LOT_NO: row[3],
      PACKING_DATE: row[4],
      STATUS: row[5],
      QUANTITY: row[6],
      PACKING_BY: row[7],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.InsBoxCapacity = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;
    const query = `
     MERGE INTO FPC_BOX_CAP_MSTR T
USING (
  SELECT 
    :Item AS BCM_PRD_ITEM_CODE,
    :box_No AS BCM_BOX_NO,
    :FAC_1 AS BCM_FACTORY_CODE,
    :box_status AS BCM_STATUS,
    :box_qty AS BCM_QTY,
    :box_max_qty AS BCM_MAX_QTY,
    :sheet_qty AS BCM_SHEET_QTY,
    :packingBy AS BCM_PACKING_BY,
    SYSDATE AS BCM_MODIFY_DATE,
    :remark AS BCM_REMARK,
    :FAC_2 AS BCM_SUPPORT_BY,
    TO_DATE(:packdate, 'YYYY-MM-DD') AS BCM_DATE
  FROM DUAL
) S
ON (T.BCM_BOX_NO = S.BCM_BOX_NO) 
WHEN MATCHED THEN
  UPDATE SET
    T.BCM_PRD_ITEM_CODE = S.BCM_PRD_ITEM_CODE,
    T.BCM_FACTORY_CODE = S.BCM_FACTORY_CODE,
    T.BCM_STATUS = S.BCM_STATUS,
    T.BCM_QTY = S.BCM_QTY,
    T.BCM_MAX_QTY = S.BCM_MAX_QTY,
    T.BCM_SHEET_QTY = S.BCM_SHEET_QTY,
    T.BCM_PACKING_BY = S.BCM_PACKING_BY,
    T.BCM_MODIFY_DATE = S.BCM_MODIFY_DATE,
    T.BCM_REMARK = S.BCM_REMARK,
    T.BCM_SUPPORT_BY = S.BCM_SUPPORT_BY,
    T.BCM_DATE = S.BCM_DATE
WHEN NOT MATCHED THEN
  INSERT (
    BCM_PRD_ITEM_CODE,
    BCM_BOX_NO,
    BCM_FACTORY_CODE,
    BCM_STATUS,
    BCM_QTY,
    BCM_MAX_QTY,
    BCM_SHEET_QTY,
    BCM_PACKING_BY,
    BCM_MODIFY_DATE,
    BCM_REMARK,
    BCM_SUPPORT_BY,
    BCM_DATE
  )
  VALUES (
    S.BCM_PRD_ITEM_CODE,
    S.BCM_BOX_NO,
    S.BCM_FACTORY_CODE,
    S.BCM_STATUS,
    S.BCM_QTY,
    S.BCM_MAX_QTY,
    S.BCM_SHEET_QTY,
    S.BCM_PACKING_BY,
    S.BCM_MODIFY_DATE,
    S.BCM_REMARK,
    S.BCM_SUPPORT_BY,
    S.BCM_DATE
  )`;

    const params = {
      Item: dataList.Item,
      box_No: dataList.box_No,
      FAC_1: dataList.fac1,
      box_status: dataList.box_status,
      box_qty: dataList.box_qty,
      box_max_qty: dataList.box_max_qty,
      sheet_qty: dataList.sheet_qty,
      packingBy: dataList.packingBy,
      remark: dataList.remark,
      FAC_2: dataList.fac2,
      packdate: dataList.packdate,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message);
  }
};
module.exports.InsLotPacking = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;

    const query = `
      INSERT INTO FPC_BOX_CAP_DET (
        BCD_PRD_ITEM_CODE,
        BCD_BOX_NO,
        BCD_SEQ_NO,
        BCD_LOT,
        BCD_LOT_QTY,
        BCD_PACK_DATE
        
      ) VALUES (
        :item,
        :boxno,
          (SELECT NVL(MAX(BCD_SEQ_NO), 0) + 1 
          FROM FPC_BOX_CAP_DET 
         WHERE BCD_BOX_NO = :boxno 
          AND BCD_PRD_ITEM_CODE = :item),
        :lot,
        :lot_qty,
        TO_DATE(:packdate, 'YYYY-MM-DD')
      )`;

    const params = {
      item: dataList.item,
      boxno: dataList.boxno,
      lot: dataList.lot,
      lot_qty: dataList.lot_qty,
      packdate: dataList.packdate
     
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message);
  }
};
module.exports.ShipFAC = async function (req, res) {
  var query = "";
  try {
    const { product } = req.body;
    const Conn = await ConnectOracleDB("FPC");
    query += `
     SELECT PR.FACTORY_CODE AS PLANT,
FC.FACTORY_DESC 
FROM FPC_ROUTING RO,
     FPC_PROCESS PR,
     FPC_FACTORY FC,
    (
      SELECT R1.RO_ITEM_CODE as RO_ITEM_CODE,
             R1.RO_REV AS RO_REV,
             MAX(R1.RO_SEQ) AS RO_SEQ
      FROM FPC_ROUTING R1
      WHERE (R1.RO_ITEM_CODE = '${product}') AND -- '9ARGPZ127MW0E'
            (R1.RO_REV IN (
                SELECT TO_CHAR(MAX(TO_NUMBER(R3.RO_REV)))
                FROM FPC_ROUTING R3 
                WHERE R3.RO_ITEM_CODE = '${product}'
            )) -- '9ARGPZ127MW0E'
      GROUP BY R1.RO_ITEM_CODE, R1.RO_REV
    ) RS
WHERE (RO.RO_ITEM_CODE = RS.RO_ITEM_CODE) AND
      (RO.RO_REV = RS.RO_REV) AND
      (PR.FACTORY_CODE = FC.FACTORY_CODE) AND
      (RO.RO_SEQ = RS.RO_SEQ) AND
      (RO.RO_PROC_ID = PR.PROC_ID) AND
      (RO.RO_ITEM_CODE = '${product}') 
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      FAC_ITEM: row[0],
      FAC_DESC: row[1],
      
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataBoxno = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    console.log(dataList, "dataList");
    const Conn = await ConnectOracleDB("FPC");
    query += `
    SELECT '${dataList.fac}' || TO_CHAR(SYSDATE,'YYMM') || '/' ||	
        TRIM(TO_CHAR(TO_NUMBER(NVL(MAX(SUBSTR(B.BCM_BOX_NO,7,5)),'0'))+1,'00000')) AS BOX_NO	
        FROM FPC_BOX_CAP_MSTR B 	
        WHERE ( B.BCM_PRD_ITEM_CODE = '${dataList.product}') AND 
      ( B.BCM_BOX_NO LIKE '${dataList.fac}'  || TO_CHAR(SYSDATE,'YYMM') ||'%' ) 
      `;
    const result = await Conn.execute(query);
    res.status(200).json(result.rows[0]);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataFullBoxQTY = async function (req, res) {
  var query = "";
  try {
    const { product } = req.body;
    const Conn = await ConnectOracleDB("QAD");
    query += `
  SELECT PT_MSTR.PT_SIZE AS MAX_QTY,UPPER(PT_MSTR.PT_DESC1) AS PRD
FROM PT_MSTR
WHERE ( UPPER(PT_MSTR.PT_PART) =  '${product}') AND
      ( UPPER(PT_MSTR.PT_DOMAIN) = '2000' ) 
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      MAX_QTY: row[0],
      PRD: row[1],
      
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.LotNo = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("FPC");
    query += `
    SELECT R.LOT_NO	
       , R.PRD_TYPE	
       , R.GOOD_QTY 	
FROM (	
          SELECT FPC_REJECT_HEADER.REJH_LOTNO AS LOT_NO,                                           	
                 FPC_REJECT_HEADER.REJH_PRD_TYPE AS PRD_TYPE,                                        	
                 ( FPC_REJECT_HEADER.REJH_TOTALPCS -                                          	
                   ( FPC_REJECT_HEADER.REJH_QTY_SCRAP +                                           	
                     FPC_REJECT_HEADER.REJH_QTY ) ) -                                        	
                   NVL((SELECT SUM(FPC_BOX_CAP_DET.BCD_LOT_QTY)                                           	
                       FROM  FPC_BOX_CAP_DET                                          	
                     WHERE ( FPC_BOX_CAP_DET.BCD_LOT = FPC_REJECT_HEADER.REJH_LOTNO ) AND                                    	
                           ( FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE = FPC_PRODUCT.PRD_ITEM_CODE ) ) ,0 ) AS GOOD_QTY,  	
                  FPC_REJECT_HEADER.REJH_LAST_MODIFY AS LAST_MODIFY                              	
            FROM FPC_REJECT_HEADER,	
                 (                                           	
                  SELECT P.PRD_ITEM_CODE	
                         , P.PRD_NAME	
                         , P.PRD_TYPE	
                  FROM FPC_PRODUCT P	
                  WHERE P.PRD_ITEM_CODE =  '${dataList.product}'
                 ) FPC_PRODUCT,                                           	
                 FPC_LOT                                          	
           WHERE ( FPC_REJECT_HEADER.REJH_LOTNO = FPC_LOT.LOT ) AND                                          	
                 ( FPC_REJECT_HEADER.REJH_PRD_NAME = FPC_PRODUCT.PRD_NAME ) AND                                             	
                 ( FPC_REJECT_HEADER.REJH_PRD_TYPE = FPC_PRODUCT.PRD_TYPE ) AND                                          	
                 ( FPC_LOT.LOT_ITEM_CODE = FPC_PRODUCT.PRD_ITEM_CODE )  AND                                          	
                 ( FPC_LOT.LOT_SCAN_FINISH = 'Y' ) AND                                         	
                 ( ( FPC_REJECT_HEADER.REJH_PACKED is null ) OR                                          	
                   ( FPC_REJECT_HEADER.REJH_PACKED = '' ) )	
        UNION	
        SELECT T.LOT_NO,	
               T.PRD_TYPE,                           	
               T.LOT_QTY - NVL((SELECT SUM(FPC_BOX_CAP_DET.BCD_LOT_QTY)                                           	
                                FROM  FPC_BOX_CAP_DET                                          	
                                WHERE ( FPC_BOX_CAP_DET.BCD_LOT = T.LOT_NO) AND                                    	
                                      ( FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE = T.PRD_ITEM_CODE ) ) ,0 )AS GOOD_QTY , 	
               T.LAST_MODIFY 	
        FROM (	
                SELECT P.LPT_LOT AS LOT_NO,  	
                       FPC_PRODUCT.PRD_ITEM_CODE,                                         	
                       FPC_PRODUCT.PRD_TYPE AS PRD_TYPE,                                        	
                       SUM(P.LPT_REQUEST_QTY) AS LOT_QTY, 	
                       MAX(P.LPT_REQUEST_DATE) AS LAST_MODIFY                              	
                  FROM FPC_LOT_PARTIAL_QTY P,                                           	
                       FPC_PRODUCT,                                           	
                       FPC_LOT                                          	
                 WHERE ( FPC_LOT.LOT = P.LPT_LOT ) AND	
                       ( FPC_LOT.LOT_ITEM_CODE = FPC_PRODUCT.PRD_ITEM_CODE ) AND                                                     	
                       ( FPC_LOT.LOT_SCAN_FINISH = 'N' ) AND                                                                                  	
                       ( FPC_PRODUCT.PRD_ITEM_CODE = '${dataList.product}')  	
                GROUP BY P.LPT_LOT,                                           	
                       FPC_PRODUCT.PRD_TYPE ,	
                       FPC_PRODUCT.PRD_ITEM_CODE  	
                ) T   	
     ) R	
WHERE R.GOOD_QTY > 0   	
ORDER BY R.LAST_MODIFY ASC,                                      	
         R.LOT_NO ASC  	 
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      LOT_NO: row[0],
      PRD_TYPE: row[1],
      GOOD_QTY: row[2]
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataSeq = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("FPC");
    query += `
    SELECT NVL(MAX(FPC_BOX_CAP_DET.BCD_SEQ_NO),0)+1 AS MAX_SEQ	
  FROM FPC_BOX_CAP_DET  	
  WHERE ( FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE = '${dataList.product}' ) AND 
        ( FPC_BOX_CAP_DET.BCD_BOX_NO = '${dataList.boxno}' )  
      `;
    const result = await Conn.execute(query);
    res.status(200).json(result.rows[0]);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};