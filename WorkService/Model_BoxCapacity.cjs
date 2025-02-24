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
  try {
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
    SELECT DISTINCT F.FACTORY_DESC AS FAC,
         T.BCM_PRD_ITEM_CODE || '/' ||P.PRD_NAME AS ITEM,
        T.BCM_BOX_NO AS BOX_NO
       ,(SELECT RTRIM(XMLAGG(XMLELEMENT(E, UPPER(D.BCD_LOT) || ', ')).EXTRACT('//text()'), ', ')
        FROM FPC_BOX_CAP_DET D
        WHERE D.BCD_PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE AND D.BCD_BOX_NO=T.BCM_BOX_NO) AS LOT_NO
       ,TO_CHAR(T.BCM_DATE,'DD/MM/YYYY') AS PACKING_DATE
       ,T.BCM_STATUS AS STATUS
       ,T.BCM_QTY AS QUANTITY
       ,T.BCM_PACKING_BY AS PACKING_BY
FROM FPC_BOX_CAP_MSTR T LEFT JOIN FPC_BOX_CAP_DET CD ON CD.BCD_PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE AND CD.BCD_BOX_NO=T.BCM_BOX_NO
                        INNER JOIN FPC_PRODUCT P ON P.PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE
                        INNER JOIN FPC_FACTORY F ON F.FACTORY_CODE=T.BCM_FACTORY_CODE
WHERE (T.BCM_PRD_ITEM_CODE = '${datalist.Product}' OR '${datalist.Product}' IS NULL)
      AND (CD.BCD_LOT >= UPPER('${datalist.LotFrom}') OR '${datalist.LotFrom}' IS NULL)
      AND (CD.BCD_LOT <= UPPER('${datalist.LotTo}') OR '${datalist.LotTo}' IS NULL)
      AND (TO_CHAR(T.BCM_DATE,'YYYY-MM-DD') >= '${datalist.PackingDateFrom}' OR '${datalist.PackingDateFrom}' IS NULL)
      AND (TO_CHAR(T.BCM_DATE,'YYYY-MM-DD') <= '${datalist.PackingDateTo}' OR '${datalist.PackingDateTo}' IS NULL)
      AND (T.BCM_BOX_NO LIKE UPPER('${datalist.BoxNoSeacrh}') || '%')
ORDER BY 2,3 ASC
      `;
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
    Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
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
    T.BCM_STATUS = S.BCM_STATUS,
    T.BCM_QTY = S.BCM_QTY,
    T.BCM_MAX_QTY = S.BCM_MAX_QTY,
    T.BCM_SHEET_QTY = S.BCM_SHEET_QTY,
    T.BCM_PACKING_BY = S.BCM_PACKING_BY,
    T.BCM_MODIFY_DATE = S.BCM_MODIFY_DATE,
    T.BCM_REMARK = S.BCM_REMARK,
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
module.exports.InsBoxCapacity1 = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    const { dataList } = req.body;

    const query = `
     INSERT INTO FPC_BOX_CAP_MSTR  (
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
    :Item,
    :box_No,
    :FAC_1,
    :box_status,
    :box_qty,
    :box_max_qty,
    :sheet_qty,
    :packingBy,
    SYSDATE,
    :remark,
    :FAC_2,
    TO_DATE(:packdate, 'YYYY-MM-DD')
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
    Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
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
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
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
module.exports.DataPPL_QTY = async function (req, res) {
  var query = "";
  try {
    const { product } = req.body;
    const Conn = await ConnectOracleDB("INV");
    query += `
 SELECT MAX(INV_PPI_CT.IVPICT_VOLUME) AS PPI_QTY
FROM INV.INV_PPI_CT, INV.INV_CARTON
WHERE ( INV_PPI_CT.IVPICT_CODE = INV_CARTON.IVCT_CODE ) AND
      ( INV_PPI_CT.IVPICT_SITE = INV_CARTON.IVCT_SITE ) AND
      ( INV_CARTON.IVCT_BOX_SIZE_CODE = 'S' ) AND
      ( INV_PPI_CT.IVPICT_ITEM = '${product}')
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      PPI_QTY: row[0],
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
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
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
      value: row[0],
      label: row[0],
      GOOD_QTY: row[2],
      PRD_TYPE: row[1],
      LOT_NO: row[0],
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
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
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
module.exports.UpdateBoxQty = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;
    const query = `
      UPDATE FPC_BOX_CAP_MSTR 
      SET BCM_QTY = :box_qty
      WHERE ( FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE =  :DDLItemProduct) AND  	
( FPC_BOX_CAP_MSTR.BCM_BOX_NO = :txtBoxNo)
      `;

    const params = {
      DDLItemProduct: dataList.item,
      txtBoxNo: dataList.boxno,
      box_qty: dataList.pack_qty,
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
module.exports.DataHeader = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    query += `
   SELECT BCM_PRD_ITEM_CODE AS ITEM_CODE,
BCM_BOX_NO AS BOX_NO,
BCM_FACTORY_CODE AS FAC,
BCM_DATE AS DATE_PACK,
BCM_STATUS AS STATUS,
BCM_MAX_QTY AS MAX_QTY,
BCM_QTY AS PACK_QTY,
BCM_PACKING_BY AS PACK_BY,
BCM_REMARK AS REMARK
FROM FPC_BOX_CAP_MSTR
WHERE BCM_PRD_ITEM_CODE ='${dataList.product}' AND BCM_BOX_NO ='${dataList.boxno}'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      ITEM_CODE: row[0],
      BOX_NO: row[1],
      FAC: row[2],
      DATE_PACK: row[3],
      STATUS: row[4],
      MAX_QTY: row[5],
      PACK_QTY: row[6],
      PACK_BY: row[7],
      REMARK: row[8],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.UpdateManual = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;
    // QUERY 1
    const query1 = `
      UPDATE FPC_REJECT_HEADER  
	    SET REJH_PACKED = 'Y'  
	    WHERE ( FPC_REJECT_HEADER.REJH_LOTNO = :lot_no) AND  
	      ( FPC_REJECT_HEADER.REJH_PRD_TYPE = ( SELECT FPC_PRODUCT.PRD_TYPE  
	                                            FROM  FPC_PRODUCT  
	                                            WHERE FPC_PRODUCT.PRD_ITEM_CODE =  :product )) 
      `;
    const params1 = {
      product: dataList.item,
      lot_no: dataList.lot,
    };
    const result = await Conn.execute(query1, params1, { autoCommit: true });

    // QUERY 2
    const query2 = `
     SELECT NVL(MAX(L.BCS_STATUS),'ACTIVE') lot_status	
      FROM FPC_BOX_CAP_LOT_STATUS L	
   , FPC_BOX_CAP_DET D	
      WHERE D.BCD_PRD_ITEM_CODE = L.BCS_PRD_ITEM_CODE (+)	
      AND D.BCD_LOT = L.BCS_LOT_NO (+)	
      AND D.BCD_PRD_ITEM_CODE = :product 
      AND D.BCD_BOX_NO = :box_no
      `;
    const params2 = {
      product: dataList.item,
      box_no: dataList.boxno,
    };
    const result2 = await Conn.execute(query2, params2, { autoCommit: true });
    // QUERY 3
    let resultquery2 = "" || result2.rows[0][0]; //LOT_STATUS
    let result3 = "";
    if (resultquery2 != "") {
      const query3 = `
     UPDATE FPC_BOX_CAP_MSTR  	
      SET BCM_STATUS = :lot_status	
      WHERE   ( FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE = :DDLItemProduct) AND  
    ( FPC_BOX_CAP_MSTR.BCM_BOX_NO = :txtBoxNo)
       `;
      const params3 = {
        DDLItemProduct: dataList.item,
        txtBoxNo: dataList.boxno,
        lot_status: resultquery2,
      };
      result3 = await Conn.execute(query3, params3, { autoCommit: true });
    }
    res.status(200).json({
      result1: result.rows,
      result2: result2.rows,
      result3: result3.rows,
    });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message);
  }
};
module.exports.DataLotPacking = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    query += `
  SELECT BCD_SEQ_NO AS SEQ ,
    BCD_LOT AS LOT_NO,
    BCD_LOT_QTY AS LOT_QTY,
    TO_CHAR(BCD_PACK_DATE,'DD/MM/YYYY') AS LOT_DATE,
    BCD_PRD_ITEM_CODE AS ITEM_CODE,
    BCD_BOX_NO  AS BOX_NO
    FROM FPC_BOX_CAP_DET WHERE BCD_PRD_ITEM_CODE ='${dataList.product}' AND BCD_BOX_NO= '${dataList.boxno}'
    order by BCD_SEQ_NO ASC
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      SEQ: row[0],
      LOT_NO: row[1],
      LOT_QTY: row[2],
      LOT_DATE: row[3],
      LOT_ITEM_CODE: row[4],
      LOT_BOX_NO: row[5],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataReceive = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("FPC"); //มาเปลี่ยนเป็น FPC ด้วย
    query += `
  SELECT FPC_REJECT_HEADER.REJH_LOTNO AS LOT_NO,                                                              
         ( FPC_REJECT_HEADER.REJH_PRD_TYPE) AS PRD_TYPE,                                                            
         (( FPC_REJECT_HEADER.REJH_TOTALPCS -                                                             
           ( FPC_REJECT_HEADER.REJH_QTY_SCRAP +                                                               
             FPC_REJECT_HEADER.REJH_QTY ) ) -                                                           
           NVL((SELECT SUM(FPC_BOX_CAP_DET.BCD_LOT_QTY)                                                               
                FROM  FPC_BOX_CAP_DET                                                             
              WHERE ( FPC_BOX_CAP_DET.BCD_LOT = FPC_REJECT_HEADER.REJH_LOTNO ) AND                                                        
                    ( FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE = FPC_PRODUCT.PRD_ITEM_CODE ) ) ,0 )) + 
          NVL( (
              SELECT Sum(TR_HIST.TR_QTY_LOC)
              FROM QAD.TR_HIST@PCTTPROD TR_HIST  
              WHERE ( UPPER(TR_HIST.TR_SERIAL) = FPC_REJECT_HEADER.REJH_LOTNO ) AND
                  ( UPPER(TR_HIST.TR_TYPE) in ('ISS-TR','RCT-TR' ) ) AND  
                  ( UPPER(TR_HIST.TR_STATUS) = 'GOOD' ) AND  
                  ( UPPER(TR_HIST.TR_PART) = '${dataList.product}') AND 
                  ( TR_HIST.TR_EFFDATE >=add_months(sysdate,-12)) AND  
                  ( UPPER(TR_HIST.TR_DOMAIN) = '2000' )
              )
            ,0)  AS GOOD_QTY 
      , FPC_PROCESS.PROC_DISP AS PROCESS                                                        
    FROM FPC_REJECT_HEADER,                                                               
         FPC_PRODUCT,                                                               
         FPC_LOT,
      FPC_PROCESS                                                               
   WHERE ( FPC_REJECT_HEADER.REJH_LOTNO = FPC_LOT.LOT ) AND                                                             
         ( FPC_REJECT_HEADER.REJH_PRD_NAME = FPC_LOT.LOT_PRD_NAME ) AND                                                             
         ( FPC_LOT.LOT_ITEM_CODE = FPC_PRODUCT.PRD_ITEM_CODE ) AND                                                              
         ( FPC_REJECT_HEADER.REJH_PRD_TYPE = FPC_PRODUCT.PRD_TYPE ) AND                                                             
         ( FPC_LOT.LOT_SCAN_FINISH = 'N' ) AND                                                           
         ( ( FPC_REJECT_HEADER.REJH_PACKED is null ) OR                                                             
           ( FPC_REJECT_HEADER.REJH_PACKED = '' ) ) AND                                                             
         ( FPC_PRODUCT.PRD_ITEM_CODE = '${dataList.product}') AND 
      ( FPC_LOT.PROC_ID = FPC_PROCESS.PROC_ID )                                                         
  ORDER BY FPC_REJECT_HEADER.REJH_LAST_MODIFY ASC,                                                          
        FPC_REJECT_HEADER.REJH_LOTNO ASC  
       
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      LOT_NO: row[0],
      PRD_TYPE: row[1],
      GOOD_QTY: row[2],
      PROCESS: row[3],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetDataBoxMainTain = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    query += `
      SELECT BCM_PRD_ITEM_CODE AS ITEM,
        P.PRD_NAME AS PRODUCT,
        F.FACTORY_DESC AS FAC,
        M.BCM_BOX_NO AS BOX_NO,
        M.BCM_STATUS AS STATUS,
        M.BCM_QTY AS MRTR_QTY, 
        TO_CHAR(M.BCM_DATE,'YYYY-MM-DD') AS PACKING_DATE,
        M.BCM_MAX_QTY AS MAX_QTY,
        M.BCM_SHEET_QTY AS SHEET_QTY,
        M.BCM_PACKING_BY AS PACK_BY,
        M.BCM_REMARK AS REMARK
        FROM FPC_BOX_CAP_MSTR M
        INNER JOIN FPC_PRODUCT P ON M.BCM_PRD_ITEM_CODE = P.PRD_ITEM_CODE
        INNER JOIN FPC_FACTORY F ON M.BCM_FACTORY_CODE = F.FACTORY_CODE 
        WHERE BCM_PRD_ITEM_CODE ='${dataList.item}'
        AND BCM_BOX_NO ='${dataList.boxno}'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      ITEM: row[0],
      PRODUCT: row[1],
      FAC: row[2],
      BOX_NO: row[3],
      STATUS: row[4],
      MRTR_QTY: row[5],
      PACKING_DATE: row[6],
      MAX_QTY: row[7],
      SHEET_QTY: row[8],
      PACK_BY: row[9],
      REMARK: row[10],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
// ---------------------------
// module.exports.DeleteLotPacking = async function (req, res) {
//   let Conn;
//   let query;
//   try {
//     Conn = await ConnectOracleDB("PCTTTEST");
//     const { dataList } = req.body;
//     const query = `
//     DELETE FROM FPC_BOX_CAP_DET
//     WHERE  BCD_LOT = :lot_no
//     AND BCD_PRD_ITEM_CODE = :item_id 
//     AND BCD_BOX_NO = :box_no 
//     AND BCD_SEQ_NO = :seq_id
//       `;

//     const params = {
//       lot_no: dataList.lot,
//       item_id: dataList.item,
//       box_no: dataList.boxno,
//       seq_id: dataList.seq,
//     };
//     const result = await Conn.execute(query, params, { autoCommit: true });
//     res.status(200).json(result.rows);
//     DisconnectOracleDB(Conn);
//   } catch (error) {
//     writeLogError(error.message, query);
//     res.status(500).json({ message: error.message });
//     console.error(error.message, "DeleteLotPacking");
//   }
// };
// module.exports.UpdateSeqLotPacking = async function (req, res) {
//   let Conn;
//   let query;
//   try {
//     Conn = await ConnectOracleDB("PCTTTEST");
//     const { dataList } = req.body;
//     // ตรวจสอบลำดับปัจจุบันก่อนทำการอัปเดต
//     console.log(dataList,"DeleteLotPacking");
//     const checkQuery = `
//     UPDATE FPC_BOX_CAP_DET
//     SET BCD_SEQ_NO = (BCD_SEQ_NO - 1)
//     WHERE BCD_SEQ_NO > :SeqNo
//     AND BCD_BOX_NO = :box_no
//     AND BCD_PRD_ITEM_CODE = :item_id
//     and BCD_LOT = :lot_no
//     `;
   
//     const checkParams = {
//       SeqNo: dataList.seq,
//       lot_no: dataList.lot,
//       item_id: dataList.item,
//       box_no: dataList.boxno,
//     }; 
//     console.log(checkParams,"DeleteLotPacking2");
//     const checkResult = await Conn.execute(checkQuery, checkParams, { autoCommit: true });
   

//     res.status(200).json(checkResult.rows);
//     DisconnectOracleDB(Conn);
//   } catch (error) {
//     writeLogError(error.message, query);
//     res.status(500).json({ message: error.message });
//     console.error(error.message, "UpdateSeqLotPacking");
//   }
// };
module.exports.DeleteLotPacking = async function (req, res) {
  let Conn;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;

    // ลบข้อมูลที่มี SeqNo ปัจจุบันก่อน
    const deleteQuery = `
      DELETE FROM FPC_BOX_CAP_DET 
      WHERE BCD_SEQ_NO = :SeqNo
      AND BCD_BOX_NO = :box_no
      AND BCD_PRD_ITEM_CODE = :item_id
      AND BCD_LOT = :lot_no
    `;

    const deleteParams = {
      SeqNo: dataList.seq,
      lot_no: dataList.lot,
      item_id: dataList.item,
      box_no: dataList.boxno,
    };

    await Conn.execute(deleteQuery, deleteParams, { autoCommit: true });
    res.status(200).json({ message: "Update successful" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdateSeqLotPacking");
  }
};
module.exports.UpdateSeqLotPacking = async function (req, res) {
  let Conn;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;
    const updateQuery = `
     MERGE INTO FPC_BOX_CAP_DET q
      USING (
          SELECT ROWID AS row_id, ROW_NUMBER() OVER (ORDER BY BCD_SEQ_NO) AS new_seq
          FROM FPC_BOX_CAP_DET
          WHERE  BCD_BOX_NO = :box_no
            AND BCD_PRD_ITEM_CODE = :item_id
      ) t
      ON (q.ROWID = t.row_id)
      WHEN MATCHED THEN
      UPDATE SET q.BCD_SEQ_NO = t.new_seq
    `;
    
    const updateParams = {
      item_id: dataList.item,
      box_no: dataList.boxno,
    };

   const result2= await Conn.execute(updateQuery, updateParams, { autoCommit: true });


    res.status(200).json({ message: "Update successful" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdateSeqLotPacking");
  }
};

// ---------------------------
module.exports.UpdateBoxMaster = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;
    
    const query = `
    UPDATE FPC_BOX_CAP_MSTR
    SET BCM_QTY = BCM_QTY - :boxqty
    WHERE BCM_PRD_ITEM_CODE = :item_id 
    AND BCM_BOX_NO = :box_no
      `;

    const params = {
      boxqty: dataList.qty,
      item_id: dataList.item,
      box_no: dataList.boxno,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdateBoxMaster");
  }
};
module.exports.DeleteBoxMaintain = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;
    query = `
     DELETE FROM FPC_BOX_CAP_MSTR 
     WHERE BCM_PRD_ITEM_CODE = :item_id 
     AND BCM_BOX_NO = :box_no 
      `;

    const params = {
      item_id: dataList.item,
      box_no: dataList.boxno,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DeleteBoxMaintain");
  }
};
module.exports.DataMapping = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    query += `
 SELECT * FROM FPC_BOX_CAP_POST  WHERE BCP_PRD_ITEM_CODE ='${dataList.product}' AND BCP_BOX_NO ='${dataList.boxno}'
      `;
    const result = await Conn.execute(query);
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DataMapping");
  }
};
module.exports.DataRemainQTY_AUTO = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    query += `
    SELECT NVL(D.BCM_MAX_QTY,0) - NVL(D.BCM_QTY,0) REMAIN_QTY  ,
     D.BCM_BOX_NO AS OLD_LOT
    FROM FPC_BOX_CAP_MSTR  T INNER JOIN FPC_BOX_CAP_MSTR D ON D.BCM_PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE
    													  AND SUBSTR(D.BCM_BOX_NO,1,5)=SUBSTR(T.BCM_BOX_NO,1,5)
    													  AND TO_NUMBER(SUBSTR(D.BCM_BOX_NO,7,5))=TO_NUMBER(SUBSTR(T.BCM_BOX_NO,7,5))-1
    WHERE T.BCM_PRD_ITEM_CODE =  '${dataList.item}'
    	  AND T.BCM_BOX_NO ='${dataList.boxno}'
    	  AND D.BCM_STATUS = 'ACTIVE'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      REMAIN_QTY: row[0],
      OLD_LOT: row[1],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataLOT_AUTO = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย

    query += `
       SELECT FPC_BOX_CAP_DET.BCD_LOT LOT  
FROM FPC_BOX_CAP_DET  
WHERE ( FPC_BOX_CAP_DET.BCD_BOX_NO = '${dataList.boxno}') AND 
    ( FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE = '${dataList.item}' ) AND 
    ( FPC_BOX_CAP_DET.BCD_SEQ_NO = (SELECT MAX(B.BCD_SEQ_NO)
                                    FROM FPC_BOX_CAP_DET B
                                    WHERE B.BCD_BOX_NO = '${dataList.boxno}' 
                                          AND B.BCD_PRD_ITEM_CODE = '${dataList.item}' ) )
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      LOT: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataMAX_DATE_AUTO = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย

    query += `
       SELECT FPC_REJECT_HEADER.REJH_DATE MAX_DATE
FROM FPC_REJECT_HEADER,FPC_PRODUCT
WHERE ( FPC_REJECT_HEADER.REJH_PRD_TYPE  = FPC_PRODUCT.PRD_TYPE ) AND
    ( FPC_REJECT_HEADER.REJH_PRD_NAME  = FPC_PRODUCT.PRD_NAME ) AND
    ( FPC_REJECT_HEADER.REJH_LOTNO = '${dataList.lotno}') AND 
    ( FPC_PRODUCT.PRD_ITEM_CODE = '${dataList.item}')
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      MAX_DATE: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataMAX_SEQ_AUTO = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย

    query += `
         SELECT NVL(MAX(FPC_BOX_CAP_DET.BCD_SEQ_NO),0)+1 AS MAX_SEQ
  FROM FPC_BOX_CAP_DET  
  WHERE ( FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE = '${dataList.item}' ) AND 
        ( FPC_BOX_CAP_DET.BCD_BOX_NO = '${dataList.boxno}'  ) 
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      MAX_SEQ: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetDataGOOD_QTY_FOR_AUTO = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย

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
            FROM FPC_BOX_CAP_DET
            WHERE ( FPC_BOX_CAP_DET.BCD_LOT = FPC_REJECT_HEADER.REJH_LOTNO ) AND
            ( FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE = FPC_PRODUCT.PRD_ITEM_CODE ) ) ,0 ) AS GOOD_QTY ,
            FPC_REJECT_HEADER.REJH_LAST_MODIFY AS LAST_MODIFY
        FROM FPC_REJECT_HEADER,
        FPC_PRODUCT,
        FPC_LOT
        WHERE ( FPC_REJECT_HEADER.REJH_LOTNO = FPC_LOT.LOT ) AND
        ( FPC_REJECT_HEADER.REJH_PRD_NAME = FPC_LOT.LOT_PRD_NAME ) AND
        ( FPC_LOT.LOT_ITEM_CODE = FPC_PRODUCT.PRD_ITEM_CODE ) AND
        ( FPC_REJECT_HEADER.REJH_PRD_TYPE = FPC_PRODUCT.PRD_TYPE ) AND
        ( FPC_LOT.LOT_SCAN_FINISH = 'Y' ) AND
        ( ( FPC_REJECT_HEADER.REJH_PACKED is null ) OR
        ( FPC_REJECT_HEADER.REJH_PACKED = '' ) ) AND
        ( FPC_PRODUCT.PRD_ITEM_CODE = '${dataList.item}' ) AND
        ( '${dataList.date}' IS NULL OR FPC_REJECT_HEADER.REJH_DATE >= '${dataList.date}' )

        UNION
        SELECT T.LOT_NO,
        T.PRD_TYPE,
        T.LOT_QTY - NVL((SELECT SUM(FPC_BOX_CAP_DET.BCD_LOT_QTY)
        FROM FPC_BOX_CAP_DET
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
        ( FPC_PRODUCT.PRD_ITEM_CODE = '${dataList.item}' ) AND
        ( '${dataList.date}' IS NULL OR P.LPT_REQUEST_DATE >= '${dataList.date}' )
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
      GOOD_QTY: row[2],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.INS_UP_AUTO_PACK1 = async function (req, res) {
  let Conn;
  let query1, query2;
  try {
    Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    const { dataList } = req.body;
   
    query1 = `
      INSERT INTO FPC_BOX_CAP_DET  
      (BCD_PRD_ITEM_CODE, BCD_BOX_NO, BCD_SEQ_NO, BCD_LOT, BCD_LOT_QTY, BCD_PACK_DATE)  
      VALUES (:PRD, :BOX, :Seq, :LOT, :REMAIN_QTY, TO_DATE(:PACK_DATE, 'YYYY-MM-DD'))
    `;

    const params1 = {
      PRD: dataList.item,
      BOX: dataList.boxno,
      Seq: dataList.maxseq,
      LOT: dataList.lot_no,
      REMAIN_QTY: dataList.remain_qty,
      PACK_DATE: dataList.packdate,
    };
    
    query2 = `
      UPDATE FPC_BOX_CAP_MSTR  
      SET BCM_QTY = BCM_QTY + :REMAIN_QTY  
      WHERE BCM_PRD_ITEM_CODE = :PRD AND BCM_BOX_NO = :BOX
    `;

    const params2 = {
      PRD: dataList.item,
      BOX: dataList.boxno,
      REMAIN_QTY: dataList.remain_qty,
    };
    await Conn.execute(query1, params1, { autoCommit: true });
    await Conn.execute(query2, params2, { autoCommit: true });

    res.status(200).json({ message: "Success" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query1 || query2);
    res.status(500).json({ message: error.message });
    console.error(error.message,"INS_UP_AUTO_PACK1");
  }
};
module.exports.INS_UP_AUTO_PACK2 = async function (req, res) {
  let Conn;
  let query1, query2, query3;
  try {
    Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    const { dataList } = req.body;
    
    query1 = `
      INSERT INTO FPC_BOX_CAP_DET  
      (BCD_PRD_ITEM_CODE, 
      BCD_BOX_NO, 
      BCD_SEQ_NO, 
      BCD_LOT, 
      BCD_LOT_QTY, 
      BCD_PACK_DATE)  
      VALUES (
      :PRD, 
      :BOX,
      :Seq, 
      :LOT, 
      :QTY, 
      TO_DATE(:PACK_DATE, 'YYYY-MM-DD'))
    `;

    const params1 = {
      PRD: dataList.item,
      BOX: dataList.boxno,
      Seq: dataList.maxseq,
      LOT: dataList.lot_no,
      QTY: dataList.qty_pack,
      PACK_DATE: dataList.packdate,
    };
    query2 = `
      UPDATE FPC_BOX_CAP_MSTR  
      SET BCM_QTY = BCM_QTY + :QTY  
      WHERE BCM_PRD_ITEM_CODE = :PRD AND BCM_BOX_NO = :BOX
    `;

    const params2 = {
      PRD: dataList.item,
      BOX: dataList.boxno,
      QTY: dataList.qty_pack,
    };

    query3 = `
    UPDATE FPC_REJECT_HEADER  
    SET REJH_PACKED = 'Y'  
    WHERE   ( FPC_REJECT_HEADER.REJH_LOTNO = :LOT ) AND  
    ( FPC_REJECT_HEADER.REJH_PRD_TYPE = ( SELECT FPC_PRODUCT.PRD_TYPE  
                                  FROM  FPC_PRODUCT  
                                    WHERE FPC_PRODUCT.PRD_ITEM_CODE = :PRD  ))

  `;

    const params3 = {
      PRD: dataList.item,
      LOT: dataList.lot_no,
    };
    const result1 = await Conn.execute(query1, params1, { autoCommit: true });
    const result2 = await Conn.execute(query2, params2, { autoCommit: true });
    const result3 = await Conn.execute(query3, params3, { autoCommit: true });

    res.status(200).json({
      message: "Success",
      result1: result1.rows,
      result2: result2.rows,
      result3: result3.rows
    });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query1 || query2|| query3);
    res.status(500).json({ message: error.message });
    console.error(error.message,"INS_UP_AUTO_PACK2");
  }
};
module.exports.UpdateAutoSts = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST");
    const { dataList } = req.body;
    // QUERY 1
    const query1 = `
    SELECT NVL(MAX(L.BCS_STATUS),'ACTIVE') lot_status	
    FROM FPC_BOX_CAP_LOT_STATUS L	
      , FPC_BOX_CAP_DET D	
    WHERE D.BCD_PRD_ITEM_CODE = L.BCS_PRD_ITEM_CODE (+)	
        AND D.BCD_LOT = L.BCS_LOT_NO (+)	
        AND D.BCD_PRD_ITEM_CODE = :DDLItemProduct 
        AND D.BCD_BOX_NO = :txtBoxNo  

      `;
    const params1 = {
      DDLItemProduct: dataList.item,
      txtBoxNo: dataList.boxno,
    };
    const result = await Conn.execute(query1, params1, { autoCommit: true });

    // QUERY 2
    let resultquery1= "" || result.rows[0][0]; //LOT_STATUS
    let result2 = "";
    if (resultquery1 != "") {
      const query2 = `
     UPDATE FPC_BOX_CAP_MSTR  	
      SET BCM_STATUS = :lot_status	
      WHERE   ( FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE = :DDLItemProduct) AND  
    ( FPC_BOX_CAP_MSTR.BCM_BOX_NO = :txtBoxNo)
       `;
      const params2 = {
        DDLItemProduct: dataList.item,
        txtBoxNo: dataList.boxno,
        lot_status: resultquery1,
      };
      result2 = await Conn.execute(query2, params2,{ autoCommit: true });
    }
    res.status(200).json({
      result1: result.rows,
      result2: result2.rows,
    });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message,'UpdateAutoSts');
  }
};
module.exports.DataLotPackingAuto_Gen = async function (req, res) {
  let query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น FPC ด้วย
    // Convert the array to a comma-separated string
    const boxnoList = dataList.boxno.map(box => `'${box}'`).join(',');
if (boxnoList) {
  query = `
    SELECT BCM_BOX_NO AS BOX_NO,
    BCM_STATUS AS STATUS,
    BCM_MAX_QTY AS MAX_QTY,
    BCM_QTY AS QTY
    FROM FPC_BOX_CAP_MSTR 
    WHERE BCM_PRD_ITEM_CODE = :item
    AND BCM_BOX_NO IN (${boxnoList})
  `;
} else {
  query = `
    SELECT BCM_BOX_NO AS BOX_NO,
    BCM_STATUS AS STATUS,
    BCM_MAX_QTY AS MAX_QTY,
    BCM_QTY AS QTY
    FROM FPC_BOX_CAP_MSTR 
    WHERE BCM_PRD_ITEM_CODE = :item
    AND BCM_BOX_NO IN ('')
  `;
}
    const params = {
      item: dataList.item,
    };

    const result = await Conn.execute(query, params);
    const jsonData = result.rows.map((row) => ({
      BOX_NO: row[0],
      STATUS: row[1],
      MAX_QTY: row[2],
      QTY: row[3],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};