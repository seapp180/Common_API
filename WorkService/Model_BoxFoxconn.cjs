const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetUser = async function (req, res) {
  var query = "";
  try {
    const { empcode } = req.query;
    console.log(empcode, "empcode");
    const Conn = await ConnectOracleDB("CUSR");
    query += `
        SELECT ENAME AS F_NAME, 
        ESURNAME AS SURNAME 
        FROM cu_user_humantrix  
        WHERE UPPER(EMPCODE) = UPPER('${empcode}')
      `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      F_NAME: row[0],
      SURNAME: row[1],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetUser");
  }
};
module.exports.GetProductKey = async function (req, res) {
  var query = "";
  console.log("GetProductKey");
  try {
    const { product } = req.query;
    console.log(product, "product");
    const Conn = await ConnectOracleDB("PCTTTEST");
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
    console.log(dataList, "dataList");
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
      SELECT '${dataList.fac}' || TO_CHAR(SYSDATE,'YYMM') || '/' ||	
          TRIM(TO_CHAR(TO_NUMBER(NVL(MAX(SUBSTR(B.BCM_BOX_NO,7,5)),'0'))+1,'00000')) AS BOX_NO	
          FROM FPC_BOX_CAP_MSTR B 	
          WHERE ( B.BCM_PRD_ITEM_CODE = '${dataList.product}') AND 
        ( B.BCM_BOX_NO LIKE '${dataList.fac}'  || TO_CHAR(SYSDATE,'YYMM') ||'%' ) 
        `;
    const result = await Conn.execute(query);
    console.log(result.rows[0], "result");
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
  console.log("GetproductScan");
  try {
    const client = await ConnectPG_DB();

    const { packid } = req.body;
    console.log(packid, "packid");
    query += ` SELECT T.MFG AS PRODUCT,
    T.LOT_NO AS LOT,
    T.BIN,T.PKG_ID AS PACK_ID,
    T.GOOD_QTY AS QTY,
    TO_CHAR(T.UPDATE_DATE,'DD/MM/YYYY') AS PACKDATE																																																															
    FROM FOXCONN.FOXCONN_LABEL T																																																															
    WHERE T.PKG_ID='${packid}'`;

    const result = await client.query(query);

    if (result.rows.length > 0) {
      console.log(result.rows, "result");
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
    console.log(dataList, "dataList");
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น PCTT ด้วย
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
    console.log(pack_label, "pack_lable");
    const Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น PCTT ด้วย
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
module.exports.InsertBoxFoxCoonn = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("PCTTTEST"); //มาเปลี่ยนเป็น PCTT ด้วย
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
    SYSDATE
  )`;

    const params = {
      Item: dataList.item,
      box_No: dataList.boxno,
      FAC_1: dataList.fac1,
      box_qty: dataList.box_qty,
      box_max_qty: dataList.box_max_qty,
      packingBy: dataList.packingBy,
      FAC_2: dataList.fac2,
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