const {
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetFac = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("PCTT");
    query += `
            SELECT FACTORY_CODE AS FAC_ID,
             FACTORY_DESC AS FAC_DESC ,
             1 AS SEQ
            FROM FPC.FPC_FACTORY
            WHERE FACTORY_STATUS='A'
            UNION
            SELECT '','ALL',0 FROM DUAL
            ORDER BY 3,2
        `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0] || "",
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
    const Conn = await ConnectOracleDB("PCTT");
    query += `
                SELECT DISTINCT T.BCP_INV_NO AS F_VALUE
                ,T.BCP_INV_NO AS F_TEXT,
                1 AS SEQ
                FROM FPC_BOX_CAP_POST T
                WHERE T.BCP_POST_DATE >= sysdate - 75
                AND T.BCP_BOX_NO LIKE '${fac}' || '%'
                UNION
                SELECT '','ALL',0 FROM DUAL
                ORDER BY 3,2
          `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0] || "",
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
// module.exports.GetProduct = async function (req, res) {
//   var query = "";
//   try {
//     const { fac, inv } = req.body;
//     const Conn = await ConnectOracleDB("PCTT");
//     query += `
//                 SELECT DISTINCT T.BCP_PRD_ITEM_CODE AS F_VALUE,T.BCP_PRD_ITEM_CODE AS F_TEXT,1
//                 FROM FPC_BOX_CAP_POST T
//                 WHERE T.BCP_POST_DATE >= sysdate - 75
//                 AND T.BCP_BOX_NO LIKE '${fac}' || '%'
//                 AND T.BCP_INV_NO = '${inv}'
//                 UNION
//                 SELECT '','ALL',0 FROM DUAL
//                 ORDER BY 3,2
//             `;
//     const result = await Conn.execute(query);
//     const jsonData = result.rows.map((row) => ({
//       value: row[0] || "",
//       label: row[1],
//       SEQ: row[2],
//     }));
//     res.status(200).json(jsonData);
//     DisconnectOracleDB(Conn);
//   } catch (error) {
//     writeLogError(error.message, query);
//     res.status(500).json({ message: error.message });
//     console.error(error.message, "GetProduct");
//   }
// };

module.exports.GetProduct = async function (req, res) {
  var query1 = "",
    query2 = "",
    query3 = "",
    jsonData = "";
  try {
    const { fac, inv } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query1 = `
      SELECT *
      FROM FPC_BOX_CAP_POST T
      WHERE T.BCP_INV_NO = :inv
    `;
    const result1 = await Conn.execute(query1, { inv });
    // ถ้าอยากใช้ข้อมูลจาก result1 สามารถนำไปใช้งานต่อได้
    if (result1.rows.length == 0) {
      query2 = `
        SELECT DISTINCT BCM_PRD_ITEM_CODE AS F_VALUE,BCM_PRD_ITEM_CODE AS F_TEXT,1
        FROM FPC.FPC_BOX_CAP_MSTR
        WHERE BCM_STATUS='ACTIVE'
        AND BCM_FACTORY_CODE=:fac
        UNION
        SELECT '','ALL',0 FROM DUAL
        ORDER BY 3,2
    `;
      const result = await Conn.execute(query2, { fac });
      jsonData = result.rows.map((row) => ({
        value: row[0] || "",
        label: row[1],
        SEQ: row[2],
      }));
    } else {
      query3 = `
      SELECT DISTINCT T.BCP_PRD_ITEM_CODE AS F_VALUE,T.BCP_PRD_ITEM_CODE AS F_TEXT,1
        FROM FPC_BOX_CAP_POST T
                WHERE T.BCP_POST_DATE >= sysdate - 75
                AND T.BCP_BOX_NO LIKE  :fac || '%'
                AND T.BCP_INV_NO = :inv
                UNION
                SELECT '','ALL',0 FROM DUAL
                ORDER BY 3,2
    `;
      const result = await Conn.execute(query3, { fac, inv });
      jsonData = result.rows.map((row) => ({
        value: row[0] || "",
        label: row[1],
        SEQ: row[2],
      }));
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query1, query2, query3);
    res.status(500).json({ message: error.message });
    console.error(error.message, "GetProduct");
  }
};

module.exports.GetSeq_Date = async function (req, res) {
  var query = "";
  try {
    const { fac, inv, prd } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
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

module.exports.DataSelectBox = async function (req, res) {
  var query = "";
  try {
    const { invno, prd, seq } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
      SELECT 
          BCM.BCM_PRD_ITEM_CODE AS ITEM,
          BCM.BCM_BOX_NO AS BOX_NO,
          TO_CHAR(BCM.BCM_DATE,'DD/MM/YYYY') AS D_DATE, 
          BCM.BCM_STATUS AS STATUS,
          BCM.BCM_QTY AS QTY,
          BCM.BCM_PACKING_BY AS PACK_BY,
          1 AS CHECKBOX,
          BCP.BCP_INV_BOX AS INV_BOX
      FROM FPC_BOX_CAP_MSTR BCM
      JOIN FPC_BOX_CAP_POST BCP
          ON BCP.BCP_PRD_ITEM_CODE = BCM.BCM_PRD_ITEM_CODE
          AND BCP.BCP_BOX_NO = BCM.BCM_BOX_NO
      WHERE 
          BCP.BCP_INV_NO = '${invno}' AND
          BCP.BCP_INV_SEQ = '${seq}' AND
          BCP.BCP_PRD_ITEM_CODE = '${prd}' 
      ORDER BY 2, 1
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      ITEM: row[0],
      BOX_NO: row[1],
      D_DATE: row[2],
      STATUS: row[3],
      QTY: row[4],
      PACK_BY: row[5],
      CHECKBOX: row[6],
      INV_BOX: row[7],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DataSelectBox");
  }
};
// module.exports.DataSelectBoxNew = async function (req, res) {
//   var query = "";
//   try {
//     const { invno, prd, seq } = req.body;
//     const Conn = await ConnectOracleDB("PCTT");
//     query += `
//                 SELECT
//     BCM_PRD_ITEM_CODE AS ITEM,
//     BCM_BOX_NO AS BOX_NO,
//    TO_CHAR(BCM_DATE,'DD/MM/YYYY') AS D_DATE,
//     BCM_STATUS AS STATUS,
//     BCM_QTY AS QTY,
//     BCM_PACKING_BY AS PACK_BY,
//     0 AS CHECKBOX,
//     NULL AS INV_BOX
//     FROM FPC_BOX_CAP_MSTR
//     WHERE
//     BCM_QTY > 0 AND
//     BCM_PRD_ITEM_CODE = '${prd}' AND
//     BCM_STATUS = 'ACTIVE'
//     ORDER BY 2
//             `;
//     const result = await Conn.execute(query);
//     const jsonData = result.rows.map((row) => ({
//       ITEM: row[0],
//       BOX_NO: row[1],
//       D_DATE: row[2],
//       STATUS: row[3],
//       QTY: row[4],
//       PACK_BY: row[5],
//       CHECKBOX: row[6],
//       INV_BOX: row[7],
//     }));
//     res.status(200).json(jsonData);
//     DisconnectOracleDB(Conn);
//   } catch (error) {
//     writeLogError(error.message, query);
//     res.status(500).json({ message: error.message });
//     console.error(error.message, "DataSelectBoxNew");
//   }
// };
module.exports.DataSelectBoxeEdit = async function (req, res) {
  var query = "";
  try {
    const { invno, prd, seq, boxno } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
      SELECT 
          BCM.BCM_PRD_ITEM_CODE AS ITEM,
          BCM.BCM_BOX_NO AS BOX_NO,
          TO_CHAR(BCM.BCM_DATE,'DD/MM/YYYY') AS D_DATE, 
          BCM.BCM_STATUS AS STATUS,
          BCM.BCM_QTY AS QTY,
          BCM.BCM_PACKING_BY AS PACK_BY,
          1 AS CHECKBOX,
          BCP.BCP_INV_BOX AS INV_BOX
      FROM FPC_BOX_CAP_MSTR BCM
      JOIN FPC_BOX_CAP_POST BCP
          ON BCP.BCP_PRD_ITEM_CODE = BCM.BCM_PRD_ITEM_CODE
          AND BCP.BCP_BOX_NO = BCM.BCM_BOX_NO
      WHERE 
          BCP.BCP_INV_NO = '${invno}' AND
          BCP.BCP_INV_SEQ = '${seq}' AND
          BCP.BCP_PRD_ITEM_CODE = '${prd}' 
          AND BCP.BCP_BOX_NO = '${boxno}'
      ORDER BY 2, 1
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      ITEM: row[0],
      BOX_NO: row[1],
      D_DATE: row[2],
      STATUS: row[3],
      QTY: row[4],
      PACK_BY: row[5],
      CHECKBOX: row[6],
      INV_BOX: row[7],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DataSelectBox");
  }
};
module.exports.Search = async function (req, res) {
  var query = "";
  try {
    const { prd, invfrom, invto, datefrom } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
               SELECT DISTINCT CP.BCP_INV_NO AS INVOICE_NO
              ,TO_CHAR(CP.BCP_POST_DATE,'DD/MM/YYYY') AS INVOICE_DATE
              ,CP.BCP_INV_BOX AS INVOICE_BOX
              ,T.BCM_PRD_ITEM_CODE || ' / ' ||P.PRD_NAME AS ITEM
              ,T.BCM_BOX_NO AS BOX_NO
              ,(SELECT RTRIM(XMLAGG(XMLELEMENT(E, UPPER(D.BCD_LOT) || ', ')).EXTRACT('//text()'), ', ')
                  FROM FPC_BOX_CAP_DET D
                  WHERE D.BCD_PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE AND D.BCD_BOX_NO=T.BCM_BOX_NO) AS LOT_NO
                  ,TO_CHAR(T.BCM_DATE,'DD/MM/YYYY') AS PACKING_DATE
                  ,T.BCM_STATUS AS STATUS
                  ,T.BCM_QTY AS QUANTITY
                  ,T.BCM_PACKING_BY AS PACKING_BY
                  ,T.BCM_FACTORY_CODE AS FACTORY_CODE
                  ,T.BCM_PRD_ITEM_CODE AS PRD_ITEM_CODE
                  ,F.FACTORY_DESC AS FACTORY_DESC
                  ,CP.BCP_INV_SEQ AS SEQ
                  ,TO_CHAR(CP.BCP_POST_DATE,'YYYY-MM-DD') AS POST_DATE
              FROM FPC_BOX_CAP_MSTR T LEFT JOIN FPC_BOX_CAP_DET CD ON CD.BCD_PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE AND CD.BCD_BOX_NO=T.BCM_BOX_NO
                    INNER JOIN FPC_PRODUCT P ON P.PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE
                    INNER JOIN FPC_FACTORY F ON F.FACTORY_CODE=T.BCM_FACTORY_CODE
                    INNER JOIN FPC_BOX_CAP_POST CP ON CP.BCP_PRD_ITEM_CODE=T.BCM_PRD_ITEM_CODE
                    AND CP.BCP_BOX_NO=T.BCM_BOX_NO
              WHERE 1=1
             -- (T.BCM_PRD_ITEM_CODE = '${prd}' OR '${prd}' IS NULL)
              AND (CP.BCP_INV_NO = UPPER('${invfrom}') OR '${invfrom}' IS NULL)
             -- AND (CP.BCP_INV_NO <= UPPER('${invto}') OR '${invto}' IS NULL)
              AND (CP.BCP_POST_DATE >= sysdate - 75)
              AND (TO_CHAR(CP.BCP_POST_DATE,'YYYY-MM-DD') >= '${datefrom}' OR '${datefrom}' IS NULL)
              ORDER BY 2,4 ASC
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      INVOICE_NO: row[0],
      INVOICE_DATE: row[1],
      INVOICE_BOX: row[2],
      ITEM: row[3],
      BOX_NO: row[4],
      LOT_NO: row[5],
      PACKING_DATE: row[6],
      STATUS: row[7],
      QUANTITY: row[8],
      PACKING_BY: row[9],
      FACTORY_CODE: row[10],
      PRD_ITEM_CODE: row[11],
      FACTORY_DESC: row[12],
      SEQ: row[13],
      POST_DATE: row[14],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "Search");
  }
};
module.exports.UpdataStatusNew = async function (req, res) {
  let Conn;
  let { query, query2 } = "";
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList, inv_no, inv_date, seq_no } = req.body;
    query = `
        UPDATE FPC_BOX_CAP_MSTR 
        SET BCM_STATUS = 'CLOSE'
        WHERE BCM_PRD_ITEM_CODE = :prd
        AND BCM_BOX_NO = :box_no
    `;
    const params = dataList.map((item) => ({
      prd: item.ITEM,
      box_no: item.BOX_NO,
    }));

    const result = await Conn.executeMany(query, params, { autoCommit: true });
    query2 = `
      INSERT INTO FPC_BOX_CAP_POST(BCP_INV_NO, BCP_PRD_ITEM_CODE, BCP_BOX_NO,																																				
      BCP_INV_SEQ, BCP_INV_BOX, BCP_POST_DATE)																																				
      VALUES(:invno, :prd, :boxno,																																				
     :seq, :invbox, to_date(:invdate,'YYYY-MM-DD'))																																				
    `;
    const params2 = dataList.map((item) => ({
      invno: inv_no,
      prd: item.ITEM,
      boxno: item.BOX_NO,
      seq: seq_no,
      invbox: item.INV_BOX || "",
      invdate: inv_date,
    }));
    const result2 = await Conn.executeMany(query2, params2, {
      autoCommit: true,
    });

    res.status(200).json({
      message: "Update successful",
      rowsAffected: result.rowsAffected,
      rowsAffected: result2.rowsAffected,
    });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdataStatusNew");
  }
};
module.exports.UpdataStatusEdit_NotCheck = async function (req, res) {
  let Conn;
  let { query, query2 } = "";
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList, inv_no, seq_no } = req.body;
    query = `
      UPDATE FPC_BOX_CAP_MSTR 
      SET BCM_STATUS = 'ACTIVE'
      WHERE BCM_PRD_ITEM_CODE = :prd
      AND BCM_BOX_NO = :box_no
    `;

    const params = dataList.map((item) => ({
      prd: item.ITEM,
      box_no: item.BOX_NO,
    }));
    const result = await Conn.executeMany(query, params, { autoCommit: true });

    query2 = `
      DELETE FROM FPC_BOX_CAP_POST
      WHERE BCP_INV_NO = :invno
      AND BCP_PRD_ITEM_CODE = :prd
      AND BCP_BOX_NO = :boxno
      AND BCP_INV_SEQ = :seq																													
  `;
    const params2 = dataList.map((item) => ({
      invno: inv_no,
      prd: item.ITEM,
      boxno: item.BOX_NO,
      seq: seq_no,
    }));
    const result2 = await Conn.executeMany(query2, params2, {
      autoCommit: true,
    });
    res.status(200).json({
      message: "Update successful",
      rowsAffected: result.rowsAffected,
      rowsAffected: result2.rowsAffected,
    });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdataStatusEdit_NotCheck");
  }
};
module.exports.UpdataStatusEdit_Check = async function (req, res) {
  let Conn;
  let { query } = "";
  try {
    Conn = await ConnectOracleDB("PCTT");
    const { dataList, inv_no, seq_no, date_inv } = req.body;

    query = `
      UPDATE FPC_BOX_CAP_POST	
      SET BCP_POST_DATE=TO_DATE(:inv_date,'YYYY-MM-DD')
	    ,BCP_INV_BOX=:inv_box
      WHERE BCP_INV_NO = :invno
      AND BCP_PRD_ITEM_CODE = :prd
      AND BCP_BOX_NO = :boxno
      AND BCP_INV_SEQ = :seq
    `;

    const params = dataList.map((item) => ({
      inv_date: date_inv,
      inv_box: item.INV_BOX,
      invno: inv_no,
      prd: item.ITEM,
      boxno: item.BOX_NO,
      seq: seq_no,
    }));
    const result = await Conn.executeMany(query, params, { autoCommit: true });

    res.status(200).json({
      message: "Update successful",
      rowsAffected: result.rowsAffected,
    });
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message);
    res.status(500).json({ message: error.message });
    console.error(error.message, "UpdataStatusEdit_Check");
  }
};
module.exports.GetDataTest = async function (req, res) {
  var query = "";
  try {
    const { invno, prd, seq } = req.body;
    const Conn = await ConnectOracleDB("PCTT");
    query += `
        SELECT FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE AS ITEM,   				
         FPC_BOX_CAP_MSTR.BCM_BOX_NO AS BOX_NO,   				
         TO_CHAR(FPC_BOX_CAP_MSTR.BCM_DATE,'DD/MM/YYYY') AS D_DATE,   				
         FPC_BOX_CAP_MSTR.BCM_STATUS AS STATUS,   				
         FPC_BOX_CAP_MSTR.BCM_QTY AS QTY,   				
         FPC_BOX_CAP_MSTR.BCM_PACKING_BY AS PACK_BY,   				
         0  AS CHECKBOX,   				
         '' AS INV_BOX  				
    FROM FPC_BOX_CAP_MSTR  				
   WHERE  FPC_BOX_CAP_MSTR.BCM_QTY > 0  AND  				
          FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE = '${prd}'  AND  				
          FPC_BOX_CAP_MSTR.BCM_STATUS = 'ACTIVE'    				
   UNION   				
  SELECT FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE AS ITEM,   				
         FPC_BOX_CAP_MSTR.BCM_BOX_NO AS BOX_NO,   				
         TO_CHAR(FPC_BOX_CAP_MSTR.BCM_DATE,'DD/MM/YYYY') AS D_DATE,				
         FPC_BOX_CAP_MSTR.BCM_STATUS AS STATUS ,   				
         FPC_BOX_CAP_MSTR.BCM_QTY AS QTY,   				
         FPC_BOX_CAP_MSTR.BCM_PACKING_BY AS PACK_BY,				
         1 AS CHECKBOX ,   				
         FPC_BOX_CAP_POST.BCP_INV_BOX   AS INV_BOX				
    FROM FPC_BOX_CAP_MSTR,   				
         FPC_BOX_CAP_POST  				
   WHERE  FPC_BOX_CAP_POST.BCP_PRD_ITEM_CODE = FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE  and  				
          FPC_BOX_CAP_POST.BCP_BOX_NO = FPC_BOX_CAP_MSTR.BCM_BOX_NO  and  				
          FPC_BOX_CAP_POST.BCP_INV_NO = '${invno}' AND  				
          FPC_BOX_CAP_POST.BCP_PRD_ITEM_CODE = '${prd}'  AND  				
          FPC_BOX_CAP_POST.BCP_INV_SEQ = '${seq}'      					
            `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      ITEM: row[0],
      BOX_NO: row[1],
      D_DATE: row[2],
      STATUS: row[3],
      QTY: row[4],
      PACK_BY: row[5],
      CHECKBOX: row[6],
      INV_BOX: row[7],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DataSelectBox");
  }
};
module.exports.DataBoxDetail = async function (req, res) {
  let query1;

  try {
    const { inv } = req.body;
    const Conn = await ConnectOracleDB("PCTT");

    // ใช้ parameter binding ปลอดภัยกว่า
    query1 = `
      SELECT 
        FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE AS PRD_ITEM_CODE,
        FPC_BOX_CAP_DET.BCD_BOX_NO AS BOX_NO,
        FPC_BOX_CAP_MSTR.BCM_QTY AS BOX_QTY,
        FPC_BOX_CAP_POST.BCP_INV_BOX AS INV_BOX,
        FPC_BOX_CAP_DET.BCD_SEQ_NO AS SEQ_NO,
        FPC_BOX_CAP_DET.BCD_LOT AS LOT_NO,
        FPC_BOX_CAP_DET.BCD_LOT_QTY AS LOT_QTY
      FROM FPC_BOX_CAP_DET
      JOIN FPC_BOX_CAP_MSTR
        ON FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE = FPC_BOX_CAP_DET.BCD_PRD_ITEM_CODE
        AND FPC_BOX_CAP_MSTR.BCM_BOX_NO = FPC_BOX_CAP_DET.BCD_BOX_NO
      JOIN FPC_BOX_CAP_POST
        ON FPC_BOX_CAP_POST.BCP_PRD_ITEM_CODE = FPC_BOX_CAP_MSTR.BCM_PRD_ITEM_CODE
        AND FPC_BOX_CAP_POST.BCP_BOX_NO = FPC_BOX_CAP_MSTR.BCM_BOX_NO
      WHERE FPC_BOX_CAP_POST.BCP_INV_NO = :inv
      ORDER BY PRD_ITEM_CODE
    `;
    const result = await Conn.execute(query1, { inv });
    jsonData = result.rows.map((row) => ({
      PRD_ITEM_CODE: row[0],
      BOX_NO: row[1],
      BOX_QTY: row[2],
      INV_BOX: row[3],
      SEQ_NO: row[4],
      LOT_NO: row[5],
      LOT_QTY: row[6],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query1);
    res.status(500).json({ message: error.message });
    console.error(error.message, "DataBoxDetail");
  }
};
