const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.Search_QA_ORT_WorkingRecord = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("PCTTTEST");
    // const { strprdname } = req.body;
    const { PtrList } = req.body;
    // const json_convertdata = JSON.stringify(dataList);
    console.log("Search_QA_ORT_WorkingRecord", PtrList);
    let query = `
       SELECT
            FACTORY,
            PROCESS,
            SERIAL_NO,
            PRODUCT_NAME,
            LOT_NO,f
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
            TO_CHAR(TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS RECEIVE_DATE,
            TO_CHAR(TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS RECEIVE_TIME,
            INPUT1_PIC,
            TO_CHAR(TO_DATE(INPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS INPUT1_DATE,
            TO_CHAR(TO_DATE(INPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS INPUT1_TIME,
            TO_CHAR(TO_DATE(OUTPUT_PLAN1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT_PLAN1_DATE,
            TO_CHAR(TO_DATE(OUTPUT_PLAN1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT_PLAN1_TIME,
            OUTPUT1_PIC,
            TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT1_DATE,
            TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT1_TIME,
            INPUT2_PIC,
            TO_CHAR(TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS INPUT2_DATE,
            TO_CHAR(TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS INPUT2_TIME,
            TO_CHAR(TO_DATE(OUTPUT_PLAN2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT_PLAN2_DATE,
            TO_CHAR(TO_DATE(OUTPUT_PLAN2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT_PLAN2_TIME,
            OUTPUT2_PIC,
            TO_CHAR(TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'DD/MM/YYYY') AS OUTPUT2_DATE,
            TO_CHAR(TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'HH24:MI') AS OUTPUT2_TIME,
            INSPECTION_ITEM,
            INSPECTION_PIC,
            TEST_RESULT,
            REMARK,
            TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS') AS SEQ
        FROM
          COND.COND_QA_ORT_WORKING_RECORD
        WHERE
          FACTORY = '${ptrFactory}'
          AND (PRODUCT_TYPE = '${ptrProductType}'
            OR '${ptrProductType}' = 'ALL')
    `;
    if (ptrInput === "INPUT1") {
      query += ` 
      	AND (TO_CHAR(TO_DATE(INPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${selectedDateFromIn}'
		      OR '${selectedDateFromIn}' IS NULL)
	      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${selectedDateFromIn}'
		      OR '${selectedDateFromIn}' IS NULL)
      `;
    } else if (ptrInput === "INPUT2") {
      query += ` 
      	AND (TO_CHAR(TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${selectedDateToIn}'
		      OR '${selectedDateToIn}' IS NULL)
	      AND (TO_CHAR(TO_DATE(INPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${selectedDateToIn}'
		      OR '${selectedDateToIn}' IS NULL)
      `;
    }

    if (ptrOutput === "OUTPUT1") {
      query += ` 
	      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${selectedDateFromOut}'
		      OR '${selectedDateFromOut}' IS NULL)
	      AND (TO_CHAR(TO_DATE(OUTPUT1_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${selectedDateFromOut}'
		      OR '${selectedDateFromOut}' IS NULL)
      `;
    } else if (ptrOutput === "OUTPUT2") {
      query += ` 
	      AND (TO_CHAR(TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') >= '${selectedDateToOut}'
		      OR '${selectedDateToOut}' IS NULL)
	      AND (TO_CHAR(TO_DATE(OUTPUT2_DATE, 'DD/MM/YYYY HH24:MI:SS'), 'YYYYMMDD') <= '${selectedDateToOut}'
		      OR '${selectedDateToOut}' IS NULL)
      `;
    }
    query += ` 
        AND (UPPER(PRODUCT_NAME) LIKE UPPER('${inputProductName}') || '%'
          OR '${inputProductName}' IS NULL)
        AND (UPPER(ITEM_TEST) LIKE UPPER('${inputTestItem}') || '%'
          OR '${inputTestItem}' IS NULL)
        AND (UPPER(SUBSTR(LOT_NO, 1, 9)) LIKE UPPER('${inputLotNo}')
          OR '${inputLotNo}' IS NULL)
        AND (REGEXP_SUBSTR(LOT_NO, '[^_]+', 1, 2) = '${inputWeekNo}'
          OR '${inputWeekNo}' IS NULL)
        AND (UPPER(SERIAL_NO) LIKE UPPER('${ptrSerialNo}') || '%'
          OR '${ptrSerialNo}' IS NULL)
    ORDER BY
        TO_DATE(RECEIVE_DATE, 'DD/MM/YYYY HH24:MI:SS') DESC
    `;

    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      build: row[1],
      label: row[0],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
