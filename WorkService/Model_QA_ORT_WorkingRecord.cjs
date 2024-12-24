const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.SearchQAORTWorkingRecord = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const {
      ptrFactory,
      ptrProductType,
      ptrInput,
      ptrOutput,
      ptrProductName,
      ptrTestItem,
      ptrLotNo,
      ptrWeekNo,
      ptrSerialNo,
      ptrDateFromIn1,
      ptrDateFromIn2,
      ptrDateFromOut1,
      ptrDateFromOut2,
      ptrDateToIn1,
      ptrDateToIn2,
      ptrDateToOut1,
      ptrDateToOut2,
    } = req.body;
     query += `
      SELECT
      FACTORY,
      PROCESS,
      SERIAL_NO,
      PRODUCT_NAME,
      LOT_NO,
      QTY,
      PRODUCT_TYPE,
      JOB_TYPE,
      ITEM_TEST,
      MC_CODE,
      TEST_CYCLE,
      FIXTURE_JIG_CODE,
      CAVITY_NO,
      LAYER_POSITION,
      COND_1,
      COND_2,
      RECEIVE_PIC,
      RECEIVE_DATE,
      RECEIVE_TIME,
      INPUT1_PIC,
      INPUT1_DATE,
      INPUT1_TIME,
      OUTPUT_PLAN1_DATE,
      OUTPUT_PLAN1_TIME,
      OUTPUT1_PIC,
      OUTPUT1_DATE,
      OUTPUT1_TIME,
      INPUT2_PIC,
      INPUT2_DATE,
      INPUT2_TIME,
      OUTPUT_PLAN2_DATE,
      OUTPUT_PLAN2_TIME,
      OUTPUT2_PIC,
      OUTPUT2_DATE,
      OUTPUT2_TIME,
      INSPECTION_ITEM,
      INSPECTION_PIC,
      TEST_RESULT,
      REMARK
      FROM COND.COND_QA_ORT_WORKING_RECORD
      WHERE FACTORY = '${ptrFactory}'
      AND (PRODUCT_TYPE = '${ptrProductType}' OR '${ptrProductType}' = 'ALL')
      AND (UPPER(PRODUCT_NAME) LIKE UPPER('${ptrProductName}') || '%' OR '${ptrProductName}' IS NULL OR '${ptrProductName}' = 'ALL')
      AND (UPPER(ITEM_TEST) LIKE UPPER('${ptrTestItem}') || '%' OR '${ptrTestItem}' IS NULL OR '${ptrTestItem}' = 'ALL')
      AND (UPPER(SUBSTR(LOT_NO,1,9)) LIKE UPPER('${ptrLotNo}') OR '${ptrLotNo}' IS NULL)
      AND (REGEXP_SUBSTR(LOT_NO, '[^_]+', 1, 2) = '${ptrWeekNo}' OR '${ptrWeekNo}' IS NULL)
      AND (UPPER(SERIAL_NO) LIKE UPPER('${ptrSerialNo}') || '%' OR '${ptrSerialNo}' IS NULL)
      AND (TO_CHAR(TO_DATE(INPUT1_DATE,'DD/MM/YYYY'),'YYYYMMDD') >= '${ptrDateFromIn1}' OR '${ptrDateFromIn1}' IS NULL)
      AND (TO_CHAR(TO_DATE(INPUT1_DATE,'DD/MM/YYYY'),'YYYYMMDD') <= '${ptrDateToIn1}' OR '${ptrDateToIn1}' IS NULL)
      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE,'DD/MM/YYYY'),'YYYYMMDD') >= '${ptrDateFromOut1}' OR '${ptrDateFromOut1}' IS NULL)
      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE,'DD/MM/YYYY'),'YYYYMMDD') <= '${ptrDateToOut1}' OR '${ptrDateToOut1}' IS NULL)
      AND (TO_CHAR(TO_DATE(INPUT2_DATE,'DD/MM/YYYY'),'YYYYMMDD') >= '${ptrDateFromIn2}' OR '${ptrDateFromIn2}' IS NULL)
      AND (TO_CHAR(TO_DATE(INPUT2_DATE,'DD/MM/YYYY'),'YYYYMMDD') <= '${ptrDateToIn2}' OR '${ptrDateToIn2}' IS NULL)
      AND (TO_CHAR(TO_DATE(OUTPUT2_DATE,'DD/MM/YYYY'),'YYYYMMDD') >= '${ptrDateFromOut2}' OR '${ptrDateFromOut2}' IS NULL)
      AND (TO_CHAR(TO_DATE(OUTPUT2_DATE,'DD/MM/YYYY'),'YYYYMMDD') <= '${ptrDateToOut2}' OR '${ptrDateToOut2}' IS NULL)
      ORDER BY
      FACTORY,
      PROCESS,
      PRODUCT_NAME,
      LOT_NO,
      SERIAL_NO,
      TO_DATE(RECEIVE_DATE,'DD/MM/YYYY')
    `;

    const result = await Conn.execute(query);
    const jsonData = result.rows.map(row => ({
      factory: row[0] === null ? "" : row[0],
      process: row[1] === null ? "" : row[1],
      serial_no: row[2] === null ? "" : row[2],
      product_name: row[3] === null ? "" : row[3],
      lot_no: row[4] === null ? "" : row[4],
      qty: row[5] === null ? "" : row[5],
      product_type: row[6] === null ? "" : row[6],
      job_type: row[7] === null ? "" : row[7],
      item_test: row[8] === null ? "" : row[8],
      mc_code: row[9] === null ? "" : row[9],
      test_cycle: row[10] === null ? "" : row[10],
      fixture_jig_code: row[11] === null ? "" : row[11],
      cavity_no: row[12] === null ? "" : row[12],
      layer_position: row[13] === null ? "" : row[13],
      cond_1: row[14] === null ? "" : row[14],
      cond_2: row[15] === null ? "" : row[15],
      receive_pic: row[16] === null ? "" : row[16],
      receive_date: row[17] === null ? "" : row[17],
      receive_time: row[18] === null ? "" : row[18],
      input1_pic: row[19] === null ? "" : row[19],
      input1_date: row[20] === null ? "" : row[20],
      input1_time: row[21] === null ? "" : row[21],
      output_plan1_date: row[22] === null ? "" : row[22],
      output_plan1_time: row[23] === null ? "" : row[23],
      output1_pic: row[24] === null ? "" : row[24],
      output1_date: row[25] === null ? "" : row[25],
      output1_time: row[26] === null ? "" : row[26],
      input2_pic: row[27] === null ? "" : row[27],
      input2_date: row[28] === null ? "" : row[28],
      input2_time: row[29] === null ? "" : row[29],
      output_plan2_date: row[30] === null ? "" : row[30],
      output_plan2_time: row[31] === null ? "" : row[31],
      output2_pic: row[32] === null ? "" : row[32],
      output2_date: row[33] === null ? "" : row[33],
      output2_time: row[34] === null ? "" : row[34],
      inspection_item: row[35] === null ? "" : row[35],
      inspection_pic: row[36] === null ? "" : row[36],
      test_result: row[37] === null ? "" : row[37],
      remark: row[38] === null ? "" : row[38],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

// A1 Bare INPUT1 OUTPUT1 RGOZ-893MW Heat soak & BD 803105981 2349 A803105981RGO8930199 20240104 20240111 null null


module.exports.ProductNameQAORTWorkingRecord = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
     query += `
            SELECT DISTINCT T.PRODUCT_NAME AS PRODUCT_NAME
            FROM COND.COND_QA_ORT_WORKING_RECORD T
            ORDER BY T.PRODUCT_NAME
    `;
    const result = await Conn.execute(query);
    const jsonResult = result.rows.map((row) => {
      const rowObject = {};
      result.metaData.forEach((meta, index) => {
        rowObject[meta.name] = row[index];
      });
      return rowObject;
    });
    jsonResult.unshift({ PRODUCT_NAME: 'ALL' });
    res.status(200).json(jsonResult);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.ItemTestQAORTWorkingRecord = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
     query += `
            SELECT DISTINCT T.ITEM_TEST AS ITEM_TEST
            FROM COND.COND_QA_ORT_WORKING_RECORD T
            ORDER BY T.ITEM_TEST
    `;
    const result = await Conn.execute(query);
    const jsonResult = result.rows.map((row) => {
      const rowObject = {};
      result.metaData.forEach((meta, index) => {
        rowObject[meta.name] = row[index];
      });
      return rowObject;
    });
    jsonResult.unshift({ ITEM_TEST: 'ALL' });
    res.status(200).json(jsonResult);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

