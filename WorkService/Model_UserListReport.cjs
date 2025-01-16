const {
    ConnectPG_DB,
    DisconnectPG_DB,
    ConnectOracleDB,
    DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.GetFactory = async function (req, res) {
    var query = "";
    try {
        const Conn = await ConnectOracleDB("QAD");
        query += `
                  SELECT
	                 DISTINCT T.WORK_LOCATION
                  FROM
	                 CUSR.CU_USER_HUMANTRIX T
                  WHERE
	                 T.STATUS = 'Active'
	              AND T.WORK_LOCATION NOT IN ('L1', 'N2', 'N3')
                  ORDER BY
	                 T.WORK_LOCATION `;
        const result = await Conn.execute(query);
        const jsonData = result.rows.map((row) => ({
            value: row[0] 
        }));

        res.status(200).json(jsonData);
        DisconnectOracleDB(Conn);
    } catch (error) {
        writeLogError(error.message, query);
        res.status(500).json({ message: error.message });
    }
};