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
      ptrDateFromIn,
      ptrDateFromOut,
      ptrDateToIn,
      ptrDateToOut,
    } = req.body;
    console.log(
      "Search_QA_ORT_WorkingRecord",
      ptrFactory,
      ptrProductType,
      ptrInput,
      ptrOutput,
      ptrProductName,
      ptrTestItem,
      ptrLotNo,
      ptrWeekNo,
      ptrSerialNo,
      ptrDateFromIn,
      ptrDateFromOut,
      ptrDateToIn,
      ptrDateToOut
    );
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
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(RECEIVE_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS RECEIVE_DATE,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(RECEIVE_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS RECEIVE_TIME,
          INPUT1_PIC,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(INPUT1_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(INPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS INPUT1_DATE,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(INPUT1_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(INPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS INPUT1_TIME,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT_PLAN1_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT_PLAN1_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT_PLAN1_DATE,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT_PLAN1_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT_PLAN1_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT_PLAN1_TIME,
          OUTPUT1_PIC,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT1_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT1_DATE,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT1_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT1_TIME,
          INPUT2_PIC,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(INPUT2_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS INPUT2_DATE,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(INPUT2_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS INPUT2_TIME,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT_PLAN2_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT_PLAN2_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT_PLAN2_DATE,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT_PLAN2_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT_PLAN2_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT_PLAN2_TIME,
          OUTPUT2_PIC,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT2_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT2_DATE,
          TO_CHAR(TO_DATE(CASE WHEN REGEXP_LIKE(OUTPUT2_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT2_TIME,
          INSPECTION_ITEM,
          INSPECTION_PIC,
          TEST_RESULT,
          REMARK,
          TO_DATE(CASE WHEN REGEXP_LIKE(RECEIVE_DATE, '^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$') THEN TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS') ELSE NULL END, 'DD/MM/YYYY HH24:MI:SS') AS SEQ
        FROM
          COND.COND_QA_ORT_WORKING_RECORD
        WHERE
          FACTORY = '${ptrFactory}'
          AND (PRODUCT_TYPE = '${ptrProductType}'
            OR '${ptrProductType}' = 'ALL')
    `;
    if (ptrInput === 'INPUT1') {
      query += ` 
      	AND (TO_CHAR(TO_DATE(INPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${ptrDateFromIn}'
		      OR '${ptrDateFromIn}' IS NULL)
	      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${ptrDateFromIn}'
		      OR '${ptrDateFromIn}' IS NULL)
      `;
    } else if (ptrInput === 'INPUT2') {
      query += ` 
      	AND (TO_CHAR(TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${ptrDateToIn}'
		      OR '${ptrDateToIn}' IS NULL)
	      AND (TO_CHAR(TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${ptrDateToIn}'
		      OR '${ptrDateToIn}' IS NULL)
      `;
    }

    if (ptrOutput === 'OUTPUT1') {
      query += ` 
	      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${ptrDateFromOut}'
		      OR '${ptrDateFromOut}' IS NULL)
	      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${ptrDateFromOut}'
		      OR '${ptrDateFromOut}' IS NULL)
      `;
    } else if (ptrOutput === 'OUTPUT2') {
      query += ` 
	      AND (TO_CHAR(TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${ptrDateToOut}'
		      OR '${ptrDateToOut}' IS NULL)
	      AND (TO_CHAR(TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${ptrDateToOut}'
		      OR '${ptrDateToOut}' IS NULL)
      `;
    }
    query += ` 
        AND (UPPER(PRODUCT_NAME) LIKE UPPER('${ptrProductName}') || '%'
          OR '${ptrProductName}' IS NULL)
        AND (UPPER(ITEM_TEST) LIKE UPPER('${ptrTestItem}') || '%'
          OR '${ptrTestItem}' IS NULL)
        AND (UPPER(SUBSTR(LOT_NO, 1, 9)) LIKE UPPER('${ptrLotNo}')
          OR '${ptrLotNo}' IS NULL)
        AND (REGEXP_SUBSTR(LOT_NO, '[^_]+', 1, 2) = '${ptrWeekNo}'
          OR '${ptrWeekNo}' IS NULL)
        AND (UPPER(SERIAL_NO) LIKE UPPER('${ptrSerialNo}') || '%'
          OR '${ptrSerialNo}' IS NULL)
    ORDER BY
        TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS') DESC
    `;
    console.log(query)

    // TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS') AS SEQ

    // const result = await Conn.execute(query, {
    //   ptrFactory,
    //   ptrProductType,
    //   ptrInput,
    //   ptrOutput,
    //   ptrProductName,
    //   ptrTestItem,
    //   ptrLotNo,
    //   ptrWeekNo,
    //   ptrSerialNo,
    //   ptrDateFromIn,
    //   ptrDateFromOut,
    //   ptrDateToIn,
    //   ptrDateToOut,
    // });

    const result = await Conn.execute(query);

    // const jsonData = result.rows.map(row => ({
    //   factory: row[0],
    //   process: row[1],
    //   serial_no: row[2],
    //   product_name: row[3],
    //   lot_no: row[4],
    //   qty: row[5],
    //   product_type: row[6],
    //   job_type: row[7],
    //   item_test: row[8],
    //   mc_code: row[9],
    //   test_cycle: row[10],
    //   fixture_jig_code: row[11],
    //   cavity_no: row[12],
    //   layer_position: row[13],
    //   cond_1: row[14],
    //   cond_2: row[15],
    //   receive_pic: row[16],
    //   receive_date: row[17],
    //   receive_time: row[18],
    //   input1_pic: row[19],
    //   input1_date: row[20],
    //   input1_time: row[21],
    //   output_plan1_date: row[22],
    //   output_plan1_time: row[23],
    //   output1_pic: row[24],
    //   output1_date: row[25],
    //   output1_time: row[26],
    //   input2_pic: row[27],
    //   input2_date: row[28],
    //   input2_time: row[29],
    //   output_plan2_date: row[30],
    //   output_plan2_time: row[31],
    //   output2_pic: row[32],
    //   output2_date: row[33],
    //   output2_time: row[34],
    //   inspection_item: row[35],
    //   inspection_pic: row[36],
    //   test_result: row[37],
    //   remark: row[38],
    //   seq: row[39]
    // }));
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
      seq: row[39] === null ? "" : row[39]
    }));
    console.log("Data Search_QA_ORT_WorkingRecord", jsonData);
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};



// A1 Bare INPUT1 OUTPUT1 RGOZ-893MW Heat soak & BD 803105981 2349 A803105981RGO8930199 20240104 20240111 null null