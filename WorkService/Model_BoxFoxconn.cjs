const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
  ConnectPG_DB_fetlmes,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetUser = async function (req, res) {
  var query = "";
  try {
    const { empcode } = req.query;
    const Conn = await ConnectOracleDB("CUSR");
    query += `
        SELECT ENAME AS F_NAME, 
        ESURNAME AS SURNAME,
        WORK_LOCATION AS FAC
        FROM cu_user_humantrix  
        WHERE UPPER(EMPCODE) = UPPER('${empcode}')
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      F_NAME: row[0],
      SURNAME: row[1],
      FAC: row[2],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetUser");
  }
};
module.exports.GetFactoryCode = async function (req, res) {
  var query = "";
  try {
    const { fac } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
       SELECT FACTORY_CODE AS FAC_CODE 
       FROM FPC_FACTORY WHERE FACTORY_DESC ='${fac}'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      FAC_CODE: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetFactoryCode");
  }
};
module.exports.GetProductKey = async function (req, res) {
  var query = "";
  try {
    const { product } = req.query;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
        SELECT T.PRD_ITEM_CODE AS ITEM,
        T.PRD_NAME AS PRD_NAME																																							
        FROM FPC_PRODUCT T																																								
        WHERE UPPER(T.PRD_NAME) = UPPER('${product}')
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      ITEM: row[0],
      PRD_NAME: row[1],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetProductKey");
  }
};
module.exports.GetBoxNo = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
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
    console.error(error.message, "GetBoxNo");
  }
};
module.exports.GetproductScan = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB_fetlmes();
    const { packid } = req.body;
    query += ` SELECT T.MFG AS PRODUCT,
    T.LOT_NO AS LOT,
    T.BIN,T.PKG_ID AS PACK_ID,
    T.GOOD_QTY AS QTY,
    TO_CHAR(T.UPDATE_DATE,'DD/MM/YYYY') AS PACKDATE																																																															
    FROM FOXCONN.FOXCONN_LABEL T																																																															
    WHERE T.PKG_ID='${packid}'`;
    const result = await client.query(query);
    if (result.rows.length > 0) {
      const jsonData = result.rows.map((row) => ({
        ITEM: row.product,
        LOT: row.lot,
        BIN: row.bin,
        PACK_ID: row.pack_id,
        QTY: row.qty,
        PACK_DATE: row.packdate,
      }));
      res.status(200).json(jsonData);
      await DisconnectPG_DB(client);
    } else {
      res.status(204).json({ result: "Data Not Found" });
      await DisconnectPG_DB(client);
    }
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetproductScan");
  }
};

module.exports.GetProductName = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
          SELECT PRD_ITEM_CODE AS ITEM FROM FPC_PRODUCT WHERE PRD_NAME ='${dataList.product}'
          `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      ITEM: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetProductName");
  }
};
module.exports.GetDataPackLabel = async function (req, res) {
  var query = "";
  try {
    const { pack_label } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
          SELECT BCDD_PACK_ID																																																
FROM FPC.FPC_BOX_CAP_DET_DETAIL																																																
WHERE BCDD_PACK_ID='${pack_label}'																																																
          `;
    const result = await Conn.execute(query);
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetDataPackLabel");
  }
};
module.exports.InsertBoxMSTR = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;

    query = `
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
    'ACTIVE',
    :box_qty,
    :box_max_qty,
     1,
    :packingBy,
    SYSDATE,
    '',
    :FAC_2,
    TO_DATE(:date_pack,'YYYY-MM-DD') 
  )`;

    const params = {
      Item: dataList.item,
      box_No: dataList.boxno,
      FAC_1: dataList.fac1,
      box_qty: dataList.box_qty,
      box_max_qty: dataList.box_max_qty,
      packingBy: dataList.packingBy,
      FAC_2: dataList.fac2,
      date_pack: dataList.datepack,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "InsertBoxMSTR");
  }
};
module.exports.InsertBoxDet = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    query = `
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
        TO_DATE(:pack_date,'YYYY-MM-DD')
      )`;

    const params = {
      item: dataList.item,
      boxno: dataList.boxno,
      lot: dataList.lot,
      lot_qty: dataList.lot_qty,
      pack_date: dataList.packdate,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "InsertBoxDet");
  }
};
module.exports.InsertBoxDetail = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;

    query = `
     INSERT INTO FPC_BOX_CAP_DET_DETAIL (
        BCDD_PRD_ITEM_CODE,
        BCDD_BOX_NO,
        BCDD_LOT,
        BCDD_LOT_BIN,
        BCDD_LOT_BIN_QTY,
        BCDD_LOT_BIN_PACK_DATE,
        BCDD_PACK_ID
      ) VALUES (
        :item,
        :boxno,
        :lot,
        :lot_bin,
        :lot_bin_qty,
        TO_DATE(:pack_date,'YYYY-MM-DD'),
        :packid
      )`;

    const params = {
      item: dataList.item_id,
      boxno: dataList.box_no,
      lot: dataList.lot_no,
      lot_bin: dataList.lotbin,
      lot_bin_qty: dataList.qty,
      packid: dataList.pack_id,
      pack_date: dataList.packdate,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "InsertBoxDetail");
  }
};
module.exports.ddlProduct = async function (req, res) {
  var query = "";
  try {
    const { product } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
      SELECT T.PRD_ITEM_CODE AS ITEM  FROM FPC_PRODUCT T																																											
WHERE T.PRD_NAME LIKE UPPER('${product}') || '%' OR T.PRD_ITEM_CODE LIKE UPPER('${product}') || '%' ORDER BY  T.PRD_ITEM_CODE  
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      label: row[0],
      value: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetddlProduct = async function (req, res) {
  var query = "";
  try {
    const { product } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    // SELECT P.PRD_NAME FROM FPC_PRODUCT P WHERE P.PRD_ITEM_CODE = '${product}'
    query += `
      SELECT T.PRD_ITEM_CODE AS ITEM,T.PRD_NAME			  FROM FPC_PRODUCT T																																								

      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      label: row[0],
      value: row[1],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.SearchBoxFoxConn = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
       SELECT
         DISTINCT
    P.PRD_NAME AS PRODUCT,
    T.BCM_BOX_NO AS BOX_NO,
    T.BCM_QTY AS BOX_QTY,
    TO_CHAR(T.BCM_DATE, 'DD/MM/YYYY') AS BOX_DATE,
    D.BCD_LOT AS LOT,
    D.BCD_LOT_QTY AS LOT_QTY,
    (PI.NAME_ENG || ' ' || PI.SURNAME_ENG) AS PACKAGE_BY,
    T.BCM_STATUS AS BOX_STATUS,
    T.BCM_PRD_ITEM_CODE AS ITEM
FROM
    FPC.FPC_BOX_CAP_MSTR T
    INNER JOIN FPC_PRODUCT P ON P.PRD_ITEM_CODE = T.BCM_PRD_ITEM_CODE
    INNER JOIN PIS.PIS_MASTER PI 
        ON PI.ID_CODE_NEW = T.BCM_PACKING_BY 
        OR PI.ID_CODE = T.BCM_PACKING_BY
    LEFT JOIN FPC.FPC_BOX_CAP_DET D 
        ON D.BCD_PRD_ITEM_CODE = T.BCM_PRD_ITEM_CODE
        AND D.BCD_BOX_NO = T.BCM_BOX_NO
      WHERE
           (UPPER(T.BCM_PRD_ITEM_CODE) = UPPER('${dataList.product}') OR '${dataList.product}' IS NULL)
            AND (UPPER(D.BCD_LOT) LIKE UPPER('${dataList.lot}') || '%' OR '${dataList.lot}' IS NULL)
            AND (UPPER(T.BCM_BOX_NO) LIKE UPPER('${dataList.boxno}') || '%' OR '${dataList.boxno}' IS NULL)
            AND (TO_CHAR(T.BCM_DATE, 'YYYY-MM-DD') >= '${dataList.datefrom}' OR '${dataList.datefrom}' IS NULL)
            AND (TO_CHAR(T.BCM_DATE, 'YYYY-MM-DD') <= '${dataList.dateto}' OR '${dataList.dateto}' IS NULL)
      ORDER BY
        P.PRD_NAME,
        T.BCM_BOX_NO,
        D.BCD_LOT
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      PRODUCT: row[0],
      BOX_NO: row[1],
      BOX_QTY: row[2],
      BOX_DATE: row[3],
      LOT: row[4],
      LOT_QTY: row[5],
      // BIN: row[6],
      PACKAGE_BY: row[6],
      BOX_STATUS: row[7],
      ITEM: row[8],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.DataBox_Qty = async function (req, res) {
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
module.exports.DataPPL_QTYfoxConn = async function (req, res) {
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
module.exports.GetEdit_MSTR = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
        SELECT P.PRD_NAME AS PRODUCT,
        M.BCM_BOX_NO AS BOX_NO,
        M.BCM_MAX_QTY AS BOX_QTY,
        M.BCM_PACKING_BY AS PACK_BY,
        TO_CHAR(M.BCM_DATE,'YYYY-MM-DD') AS BOX_DATE ,
        BCM_PRD_ITEM_CODE AS ITEM
        FROM  FPC_BOX_CAP_MSTR M
        INNER JOIN FPC_PRODUCT P
        ON P.PRD_ITEM_CODE = M.BCM_PRD_ITEM_CODE
        WHERE P.PRD_NAME ='${dataList.product}' 
        AND M.BCM_BOX_NO ='${dataList.boxno}'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      PRODUCT: row[0],
      BOX_NO: row[1],
      BOX_QTY: row[2],
      PACK_BY: row[3],
      BOX_DATE: row[4],
      ITEM: row[5],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetEdit_BoxDet = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
        SELECT D.BCD_PRD_ITEM_CODE AS ITEM,
      P.PRD_NAME AS PRODUCT,
      D.BCD_LOT AS LOT,
      D.BCD_BOX_NO AS BOX_NO,
      D.BCD_SEQ_NO AS SEQ
      FROM FPC_BOX_CAP_DET D
      INNER JOIN FPC_PRODUCT P ON P.PRD_ITEM_CODE = D.BCD_PRD_ITEM_CODE 
      WHERE P.PRD_NAME ='${dataList.product}'
      AND BCD_BOX_NO ='${dataList.boxno}'
      ORDER BY 5
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      PRODUCT: row[0],
      ITEM: row[1],
      LOT: row[2],
      BIN: row[3],
      PACK_ID: row[4],
      QTY: row[5],
      PACK_DATE: row[6],
      BOX_NO: row[7],
      SEQ: row[8],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetEdit_BoxDet_Detail = async function (req, res) {
  var query = "";
  try {
    const { dataList } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
      SELECT 
      D.BCDD_PRD_ITEM_CODE  AS ITEM,
      P.PRD_NAME AS PRODUCT,
      D.BCDD_LOT AS LOT,
      D.BCDD_LOT_BIN AS LOT_BIN,
      D.BCDD_PACK_ID AS PACK_ID,
      D.BCDD_LOT_BIN_QTY  AS QTY ,
      TO_CHAR(D.BCDD_LOT_BIN_PACK_DATE,'DD/MM/YYYY') AS PACK_DATE,
      D.BCDD_BOX_NO AS BOX_NO
      FROM FPC_BOX_CAP_DET_DETAIL D
      INNER JOIN FPC_PRODUCT P ON P.PRD_ITEM_CODE = D. BCDD_PRD_ITEM_CODE
      WHERE P.PRD_NAME ='${dataList.product}'
      AND D.BCDD_BOX_NO ='${dataList.boxno}'
      ORDER BY 5
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      PRODUCT: row[0],
      ITEM: row[1],
      LOT: row[2],
      BIN: row[3],
      PACK_ID: row[4],
      QTY: row[5],
      PACK_DATE: row[6],
      BOX_NO: row[7],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.Update_BoxMSTR = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    query = `
        UPDATE FPC_BOX_CAP_MSTR 
        SET BCM_MAX_QTY = :max_qty,
        BCM_QTY = :box_qty,
        BCM_PACKING_BY = :packingBy,
        BCM_DATE = TO_DATE(:date_pack,'YYYY-MM-DD')
        WHERE BCM_PRD_ITEM_CODE =:item_id
        AND BCM_BOX_NO = :box
    `;
    const params3 = {
      item_id: dataList.item,
      box: dataList.boxno,
      max_qty: dataList.maxqty,
      box_qty: dataList.boxqty,
      packingBy: dataList.packing_By,
      date_pack: dataList.datepack,
    };
    const result3 = await Conn.execute(query, params3, { autoCommit: true });

    res
      .status(200)
      .json({ message: "Status updated successfully", result: result3.rows });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "Update_BoxMSTR");
  }
};
module.exports.updateDeleteRejectFoxconn = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;

    query = `
          UPDATE FPC_REJECT_HEADER
          SET REJH_PACKED = ''
          WHERE REJH_LOTNO = :Lot
      `;

    const params = {
      Lot: dataList.lot,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "updateRejectFoxconn");
  }
};
module.exports.UpdateAddReject = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
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
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdateAddReject");
  }
};
module.exports.DeleteBoxDet_Foxconn = async function (req, res) {
  let Conn;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    const deleteQuery = `
        UPDATE FPC_BOX_CAP_DET
        SET BCD_LOT_QTY = (
        SELECT BCD_LOT_QTY - :qty
        FROM FPC_BOX_CAP_DET
        WHERE BCD_BOX_NO = :box_no
          AND BCD_PRD_ITEM_CODE = :item_id
          AND BCD_LOT = :lot_no
        )
        WHERE BCD_BOX_NO = :box_no
          AND BCD_PRD_ITEM_CODE = :item_id
          AND BCD_LOT = :lot_no
          `;

    const deleteParams = {
      lot_no: dataList.lot,
      item_id: dataList.item,
      box_no: dataList.boxno,
      qty: dataList.lot_qty,
    };
    await Conn.execute(deleteQuery, deleteParams, { autoCommit: true });
    res.status(200).json({ message: "Update successful" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DeleteBoxDet_Foxconn");
  }
};
module.exports.DeleteBoxDetDetail_Foxconn = async function (req, res) {
  let Conn;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    const deleteQuery = `
    DELETE FROM FPC_BOX_CAP_DET_DETAIL
    WHERE BCDD_PRD_ITEM_CODE = :prd
    AND BCDD_BOX_NO =:boxNo
    AND BCDD_LOT =:Lot
    AND BCDD_PACK_ID =:packId
    AND BCDD_LOT_BIN = :bin
    `;

    const deleteParams = {
      prd: dataList.item,
      boxNo: dataList.boxno,
      Lot: dataList.lot,
      packId: dataList.pack_id,
      bin: dataList.lot_bin,
    };

    await Conn.execute(deleteQuery, deleteParams, { autoCommit: true });
    res.status(200).json({ message: "delete successful" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DeleteBoxDetDetail_Foxconn");
  }
};
module.exports.UpdateBoxDetDetail = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    query = `
    MERGE INTO FPC_BOX_CAP_DET_DETAIL T
    USING (
    SELECT 
        :Item AS BCDD_PRD_ITEM_CODE,
        :box_No AS BCDD_BOX_NO,
        :lot_no AS BCDD_LOT,
        :bin_lot AS BCDD_LOT_BIN,
        :bin_qty AS BCDD_LOT_BIN_QTY,
        TO_DATE(:pack_date, 'YYYY-MM-DD') AS BCDD_LOT_BIN_PACK_DATE,
        :pack_id AS BCDD_PACK_ID
      FROM DUAL
    ) S
    ON (T.BCDD_PRD_ITEM_CODE = S.BCDD_PRD_ITEM_CODE 
    AND T.BCDD_BOX_NO = S.BCDD_BOX_NO 
    AND T.BCDD_LOT = S.BCDD_LOT
    AND T.BCDD_PACK_ID = S.BCDD_PACK_ID
    AND T.BCDD_LOT_BIN = S.BCDD_LOT_BIN
    )
    WHEN MATCHED THEN
      UPDATE SET
        T.BCDD_LOT_BIN_QTY = S.BCDD_LOT_BIN_QTY,
        T.BCDD_LOT_BIN_PACK_DATE = S.BCDD_LOT_BIN_PACK_DATE
    WHEN NOT MATCHED THEN
      INSERT (
      BCDD_PRD_ITEM_CODE,
      BCDD_BOX_NO,
      BCDD_LOT,
      BCDD_LOT_BIN,
      BCDD_LOT_BIN_QTY,
      BCDD_LOT_BIN_PACK_DATE,
      BCDD_PACK_ID
      )
      VALUES (
        S.BCDD_PRD_ITEM_CODE,
        S.BCDD_BOX_NO,
        S.BCDD_LOT,
        S.BCDD_LOT_BIN,
        S.BCDD_LOT_BIN_QTY,
        S.BCDD_LOT_BIN_PACK_DATE,
        S.BCDD_PACK_ID
  )`;

    const params = {
      Item: dataList.item,
      box_No: dataList.boxNo,
      lot_no: dataList.lotno,
      bin_lot: dataList.binlot,
      bin_qty: dataList.binqty,
      pack_date: dataList.packdate,
      pack_id: dataList.packid,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};
module.exports.UpdateBoxDet = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    query = `
   MERGE INTO FPC_BOX_CAP_DET T
    USING (
      SELECT 
        :Item AS BCD_PRD_ITEM_CODE,
        :box_No AS BCD_BOX_NO,
        :lot_no AS BCD_LOT,
        :bin_qty AS BCD_LOT_QTY,
        TO_DATE(:pack_date, 'YYYY-MM-DD') AS BCD_PACK_DATE
      FROM DUAL
    ) S
    ON (T.BCD_PRD_ITEM_CODE = S.BCD_PRD_ITEM_CODE 
        AND T.BCD_BOX_NO = S.BCD_BOX_NO 
        AND  T.BCD_LOT = S.BCD_LOT)
    WHEN MATCHED THEN
      UPDATE SET
        T.BCD_PACK_DATE = S.BCD_PACK_DATE,
        T.BCD_LOT_QTY = T.BCD_LOT_QTY + S.BCD_LOT_QTY
    WHEN NOT MATCHED THEN
      INSERT (
        BCD_PRD_ITEM_CODE,
        BCD_BOX_NO,
        BCD_SEQ_NO,
        BCD_LOT,
        BCD_LOT_QTY,
        BCD_PACK_DATE
      )
      VALUES (
        S.BCD_PRD_ITEM_CODE,
        S.BCD_BOX_NO,
      (SELECT NVL(MAX(BCD_SEQ_NO), 0) + 1 
              FROM FPC_BOX_CAP_DET 
            WHERE BCD_BOX_NO = S.BCD_BOX_NO 
              AND BCD_PRD_ITEM_CODE = S.BCD_PRD_ITEM_CODE) ,
        S.BCD_LOT,
        S.BCD_LOT_QTY,
        S.BCD_PACK_DATE
      )
    `;

    const params = {
      Item: dataList.item,
      box_No: dataList.boxNo,
      lot_no: dataList.lotno,
      bin_qty: dataList.binqty,
      pack_date: dataList.packdate,
    };
    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};
module.exports.UpdateSeqDet = async function (req, res) {
  let Conn;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    const updateQuery = `
    UPDATE FPC_BOX_CAP_DET q
    SET BCD_SEQ_NO = (
    SELECT new_seq FROM (
        SELECT BCD_BOX_NO, BCD_PRD_ITEM_CODE, BCD_SEQ_NO,
               ROW_NUMBER() OVER (PARTITION BY BCD_BOX_NO, BCD_PRD_ITEM_CODE ORDER BY BCD_SEQ_NO) AS new_seq
        FROM FPC_BOX_CAP_DET
        WHERE BCD_BOX_NO = :box_no
          AND BCD_PRD_ITEM_CODE = :item_id
    ) t
    WHERE t.BCD_BOX_NO = q.BCD_BOX_NO 
      AND t.BCD_PRD_ITEM_CODE = q.BCD_PRD_ITEM_CODE
      AND t.BCD_SEQ_NO = q.BCD_SEQ_NO
)
  WHERE BCD_BOX_NO = :box_no
  AND BCD_PRD_ITEM_CODE = :item_id

    `;

    const updateParams = {
      item_id: dataList.item,
      box_no: dataList.boxno,
    };

    const result2 = await Conn.execute(updateQuery, updateParams, {
      autoCommit: true,
    });

    res.status(200).json({ message: "Update successful" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdateSeqDet");
  }
};
module.exports.DeleteBoxMaster = async function (req, res) {
  let Conn;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    const deleteQuery = `
        DELETE FROM  FPC_BOX_CAP_MSTR 
        WHERE BCM_PRD_ITEM_CODE = :product
        AND BCM_BOX_NO  = :boxno
    `;

    const deleteParams = {
      product: dataList.item,
      boxno: dataList.box_no,
    };
    await Conn.execute(deleteQuery, deleteParams, { autoCommit: true });
    res.status(200).json({ message: "Delete successful" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DeleteBoxMaster");
  }
};
module.exports.DeleteBoxALL_DET = async function (req, res) {
  let Conn;
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList } = req.body;
    const deleteQuery = `
       DELETE FROM FPC_BOX_CAP_DET 
      WHERE BCD_BOX_NO = :boxno
      AND BCD_PRD_ITEM_CODE = :product
    `;

    const deleteParams = {
      product: dataList.item,
      boxno: dataList.box_no,
    };
    await Conn.execute(deleteQuery, deleteParams, { autoCommit: true });
    res.status(200).json({ message: "Delete successful" });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DeleteBoxALL_DET");
  }
};
module.exports.GetLink = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("PCTT");
    query += `
      SELECT CMM_VALUE_CHR_1 AS LINK
      FROM FPC.FPCC_CONTROL_MASTER_MAINTAIN
      WHERE CMM_TYPE='0043'
      AND CMM_KEY_1='01'
      AND CMM_KEY_2='SMF'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      LINK: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetShipTo = async function (req, res) {
  var query = "";
  try {
    const { product } = req.body;
    const Conn = await ConnectOracleDB("QAD");
    query += `
    SELECT M.SHIP_CODE AS AD_ADDR ,M.SHIP_NAME AS AD_NAME ,
                   NVL(S.DUE_DATE,M.DUE_DATE) AS  DUE_DATE
             FROM ( SELECT  UPPER(AD_MSTR.AD_ADDR) AS SHIP_CODE ,
                           (UPPER(AD_MSTR.AD_ADDR) || ':' || UPPER(AD_MSTR.AD_NAME)) AS SHIP_NAME
                           , TO_DATE('09/09/2999','dd/mm/yyyy')  AS DUE_DATE
                   FROM CP_MSTR,PT_MSTR,AD_MSTR
                   WHERE ( UPPER(CP_MSTR.CP_PART) = UPPER(PT_MSTR.PT_PART)) AND  
                         ( UPPER(CP_MSTR.CP_DOMAIN) = UPPER(PT_MSTR.PT_DOMAIN)) AND
                         ( UPPER(CP_MSTR.CP_CUST) = UPPER(AD_MSTR.AD_ADDR) ) AND
                         ( UPPER(CP_MSTR.CP_DOMAIN) = UPPER(AD_MSTR.AD_DOMAIN) ) AND
                         ( UPPER(CP_MSTR.CP_DOMAIN) = '2000' )  AND
                         ( UPPER(PT_MSTR.PT_PART) = '${product}')) M
                 ,( SELECT UPPER(AD_MSTR.AD_ADDR) AS SHIP_CODE
                           , UPPER(AD_MSTR.AD_NAME)||' ('||UPPER(AD_MSTR.AD_ADDR)||')' AS SHIP_NAME
                           , MIN(SOD_DET.SOD_DUE_DATE) AS DUE_DATE FROM SOD_DET,SO_MSTR,PT_MSTR,AD_MSTR
                    WHERE ( UPPER(SOD_DET.SOD_NBR) = UPPER(SO_MSTR.SO_NBR) ) AND
                          (UPPER(SOD_DET.SOD_DOMAIN) = UPPER(SO_MSTR.SO_DOMAIN) ) AND
                          ( UPPER(SOD_DET.SOD_PART) = UPPER(PT_MSTR.PT_PART) ) AND
                          ( UPPER(SOD_DET.SOD_DOMAIN) = UPPER(PT_MSTR.PT_DOMAIN) ) AND
                          ( UPPER(SO_MSTR.SO_SHIP) = UPPER(AD_MSTR.AD_ADDR) ) AND
                          ( UPPER(SO_MSTR.SO_DOMAIN) = UPPER(AD_MSTR.AD_DOMAIN) ) AND
                          ( UPPER(PT_MSTR.PT_DOMAIN) = '2000' ) AND
                          ( UPPER(PT_MSTR.PT_PART) = '${product}')
                    GROUP BY UPPER(AD_MSTR.AD_ADDR) , UPPER(AD_MSTR.AD_NAME) ) S
             WHERE M.SHIP_CODE = S.SHIP_CODE (+)
             ORDER BY DUE_DATE ASC , M.SHIP_CODE
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      label: row[1],
      value: row[0],
      SHIP_CODE: row[2],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetShipTo_2 = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("QAD");
    query += `
          SELECT (UPPER(T.AD_ADDR) || ':' || UPPER(T.AD_NAME)) AS AD_NAME,UPPER(T.AD_ADDR) AS AD_ADDR,1
             FROM AD_MSTR T
             WHERE UPPER(T.AD_TYPE) = 'SHIP-TO' AND UPPER(T.AD_DOMAIN) = '2000'
             UNION
             SELECT ' ',' ',0 FROM DUAL
             ORDER BY 3,1
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      label: row[0],
      value: row[1],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetLinkWH = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("PCTT");
    query += `
     SELECT CMM_VALUE_CHR_1 AS LINK 
	 FROM FPC.FPCC_CONTROL_MASTER_MAINTAIN
	 WHERE CMM_TYPE='0043'
	  AND CMM_KEY_1='01'
	  AND CMM_KEY_2='WH'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      LINK: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetLinkLabel = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("PCTT");
    query += `
    SELECT CMM_VALUE_CHR_1 AS LINK
    FROM FPC.FPCC_CONTROL_MASTER_MAINTAIN
    WHERE CMM_TYPE='0043'
	  AND CMM_KEY_1='01'
	  AND CMM_KEY_2='SMF1'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      LINK: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetScanShelf = async function (req, res) {
  var query = "";
  try {
    const { LotNo} = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
      SELECT COUNT(T.LOT) AS F_SHELF
      FROM FPC_LOT_SHELF T INNER JOIN FPC_PROCESS P ON P.PROC_ID = T.PROC_ID
      WHERE T.LOT='${LotNo}'
	    AND UPPER(P.PROC_DISP) LIKE '%W/H%'
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      F_SHELF: row[0],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
