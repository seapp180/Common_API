const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetdataExport = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("QAD");
    const { Sl_for, Add_date, To_date, Id_code, Name } = req.body;


    query += `SELECT AD_ADDR,																																						
                AD_NAME,
                AD_SORT,
                AD_LINE1,
                NVL(TRIM(AD_LINE2), '--') AS AD_LINE2,
                NVL(TRIM(AD_CITY), '--') AS AD_CITY,
                NVL(TRIM(AD_STATE), '--') AS AD_STATE,
                NVL(TRIM(AD_COUNTRY), '--') AS AD_COUNTRY,
                NVL(TRIM(AD_ZIP), '--') AS AD_ZIP,
                NVL(TRIM(AD_ATTN), '--') AS AD_ATTN,
                NVL(TRIM(AD_PHONE), '--') AS AD_PHONE,
                NVL(TRIM(AD_ATTN2), '--') AS AD_ATTN2,
                NVL(TRIM(AD_PHONE2), '--') AS AD_PHONE2,
                NVL(TO_CHAR(AD_DATE, 'YYYY/MM/DD'), '--') AS AD_DATE,
                VD_CURR,
                VD_CR_TERMS
            FROM QAD.AD_MSTR
            JOIN QAD.LS_MSTR
                ON UPPER(AD_ADDR) = UPPER(LS_ADDR)
            AND UPPER(AD_DOMAIN) = UPPER(LS_DOMAIN)
            AND LOWER(LS_TYPE) = LOWER('${Sl_for}')
            JOIN QAD.VD_MSTR
                ON UPPER(AD_ADDR) = UPPER(VD_ADDR)
            AND UPPER(AD_DOMAIN) = UPPER(VD_DOMAIN)
            WHERE UPPER(AD_DOMAIN) = '9000'																																						
            AND TRIM(AD_SORT) <> 'NOT USED'	
            AND (TO_CHAR(AD_DATE,'YYYY/MM/DD') >= '${Add_date}' OR '${Add_date}' IS NULL)
            AND (TO_CHAR(AD_DATE,'YYYY/MM/DD') <= '${To_date}' OR '${To_date}' IS NULL)
            AND ( '${Id_code}' IS NULL OR AD_ADDR LIKE '${Id_code}' || '%' )
            AND ( '${Name}' IS NULL OR UPPER(AD_NAME) LIKE '%' || UPPER('${Name}') || '%' )
            ORDER BY AD_DATE  `;

    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      AD_ADDR: row[0],
      AD_NAME: row[1],
      AD_SORT: row[2],
      AD_LINE1: row[3],
      AD_LINE2: row[4],
      AD_CITY: row[5],
      AD_STATE: row[6],
      AD_COUNTRY: row[7],
      AD_ZIP: row[8],
      AD_ATTN: row[9],
      AD_PHONE: row[10],
      AD_ATTN2: row[11],
      AD_PHONE2: row[12],
      AD_DATE: row[13],
      VD_CURR: row[14],
      VD_CR_TERMS: row[15],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
