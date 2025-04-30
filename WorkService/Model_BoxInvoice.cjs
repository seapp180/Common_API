const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
  ConnectPG_DB_fetlmes,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetFac = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
            SELECT FACTORY_CODE AS FAC_ID,
             FACTORY_DESC AS FAC_DESC ,
             1 AS SEQ
            FROM FPC.FPC_FACTORY
            WHERE FACTORY_STATUS='A'
            UNION
            SELECT '','-Select-',0 FROM DUAL
            ORDER BY 3,2
        `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[1],
      SEQ: row[2],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetFac");
  }
};
module.exports.GetInv = async function (req, res) {
  var query = "";
  try {
    const { fac } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
                SELECT DISTINCT T.BCP_INV_NO AS F_VALUE
                ,T.BCP_INV_NO AS F_TEXT,
                1 AS SEQ
                FROM FPC_BOX_CAP_POST T
                WHERE T.BCP_POST_DATE >= sysdate - 75
                AND T.BCP_BOX_NO LIKE '${fac}' || '%'
                UNION
                SELECT '','-Select-',0 FROM DUAL
                ORDER BY 3,2
          `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[1],
      SEQ: row[2],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetInv");
  }
};
module.exports.GetProduct = async function (req, res) {
  var query = "";
  try {
    const { fac, inv } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
                SELECT DISTINCT T.BCP_PRD_ITEM_CODE AS F_VALUE,T.BCP_PRD_ITEM_CODE AS F_TEXT,1
                FROM FPC_BOX_CAP_POST T
                WHERE T.BCP_POST_DATE >= sysdate - 75
                AND T.BCP_BOX_NO LIKE '${fac}' || '%'
                AND T.BCP_INV_NO = '${inv}'
                UNION
                SELECT '','-Select-',0 FROM DUAL
                ORDER BY 3,2
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[1],
      SEQ: row[2],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetProduct");
  }
};
module.exports.GetSeq_Date = async function (req, res) {
  var query = "";
  try {
    const { fac, inv, prd } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
              SELECT DISTINCT T.BCP_INV_SEQ AS BOX_SEQ,
              TO_CHAR(T.BCP_POST_DATE,'YYYY-MM-DD') AS POST_DATE
              FROM FPC_BOX_CAP_POST T
              WHERE T.BCP_POST_DATE >= sysdate - 75
              AND T.BCP_BOX_NO LIKE '${fac}'|| '%'
              AND T.BCP_INV_NO = '${inv}'
              AND T.BCP_PRD_ITEM_CODE = '${prd}'
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      BOX_SEQ: row[0],
      POST_DATE: row[1],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetSeq_Date");
  }
};
module.exports.DataBoxDetail = async function (req, res) {
  var query = "";
  try {
    const { inv } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
          SELECT FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE AS PRD_ITEM_CODE,
          FPC_BOX_CAP_DET.BCD_BOX_NO AS BOX_NO,
          FPC_BOX_CAP_MSTR.BCM_QTY AS BOX_QTY,
          FPC_BOX_CAP_POST.BCP_INV_BOX AS INV_BOX,
          FPC_BOX_CAP_DET.BCD_SEQ_NO AS SEQ_NO,
          FPC_BOX_CAP_DET.BCD_LOT AS LOT_NO,
          FPC_BOX_CAP_DET.BCD_LOT_QTY AS LOT_QTY
          FROM FPC_BOX_CAP_DET,
          FPC_BOX_CAP_MSTR,
          FPC_BOX_CAP_POST
          WHERE ( FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE = FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE ) and
          ( FPC_BOX_CAP_MSTR.BCM_BOX_NO = FPC_BOX_CAP_DET.BCD_BOX_NO ) and
          ( FPC_BOX_CAP_POST.BCP_PRD_ITEM_CODE = FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE ) and
          ( FPC_BOX_CAP_POST.BCP_BOX_NO = FPC_BOX_CAP_MSTR.BCM_BOX_NO ) and
          ( FPC_BOX_CAP_POST.BCP_INV_NO = '${inv}')
          ORDER BY PRD_ITEM_CODE
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
            PRD_ITEM_CODE: row[0],
            BOX_NO: row[1],
            BOX_QTY: row[2],
            INV_BOX:row[3],
            SEQ_NO:row[4],
            LOT_NO:row[5],
            LOT_QTY:row[6],

    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetSeq_Date");
  }
};
module.exports.DataSelectBox = async function (req, res) {
  var query = "";
  try {
    const { inv } = req.body;
    const Conn = await ConnectOracleDB("PCTTTEST");
    query += `
         SELECT "FPC_BOX_CAP_MSTR"."BCM_PRD_ITEM_CODE",
                "FPC_BOX_CAP_MSTR"."BCM_BOX_NO",
                "FPC_BOX_CAP_MSTR"."BCM_DATE",
                "FPC_BOX_CAP_MSTR"."BCM_STATUS",
                "FPC_BOX_CAP_MSTR"."BCM_QTY",
                "FPC_BOX_CAP_MSTR"."BCM_PACKING_BY",
                0 AS CHECKBOX,
                ' inv_box
                FROM "FPC_BOX_CAP_MSTR"
                WHERE ( "FPC_BOX_CAP_MSTR"."BCM_QTY" > 0 ) AND
                ( "FPC_BOX_CAP_MSTR"."BCM_PRD_ITEM_CODE" = 'PARAMETER_PRD_ITEM') AND
                ( "FPC_BOX_CAP_MSTR"."BCM_STATUS" = 'ACTIVE' )
                UNION
                SELECT "FPC_BOX_CAP_MSTR"."BCM_PRD_ITEM_CODE",
                "FPC_BOX_CAP_MSTR"."BCM_BOX_NO",
                "FPC_BOX_CAP_MSTR"."BCM_DATE",
                "FPC_BOX_CAP_MSTR"."BCM_STATUS",
                "FPC_BOX_CAP_MSTR"."BCM_QTY",
                "FPC_BOX_CAP_MSTR"."BCM_PACKING_BY",
                1 CHECKBOX,
                "FPC_BOX_CAP_POST"."BCP_INV_BOX" inv_box
                FROM "FPC_BOX_CAP_MSTR",
                "FPC_BOX_CAP_POST"
                WHERE ( "FPC_BOX_CAP_POST"."BCP_PRD_ITEM_CODE" = "FPC_BOX_CAP_MSTR"."BCM_PRD_ITEM_CODE" ) and
                ( "FPC_BOX_CAP_POST"."BCP_BOX_NO" = "FPC_BOX_CAP_MSTR"."BCM_BOX_NO" ) and
                ( "FPC_BOX_CAP_POST"."BCP_INV_NO" = 'PARAMETER_INV_NO') AND
                ( "FPC_BOX_CAP_POST"."BCP_PRD_ITEM_CODE" = 'PARAMETER_PRD_ITEM') AND
                ( "FPC_BOX_CAP_POST"."BCP_INV_SEQ" = 'PARAMETER_INV_SEQ' )
                ORDER BY 2
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
            PRD_ITEM_CODE: row[0],
            BOX_NO: row[1],
            BOX_QTY: row[2],
            INV_BOX:row[3],
            SEQ_NO:row[4],
            LOT_NO:row[5],
            LOT_QTY:row[6],

    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetSeq_Date");
  }
};
