const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

module.exports.Search = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { Product } = req.body;

    query += `
        SELECT T.CMM_KEY_1 AS F_PRODUCT,
        T.CMM_KEY_2 AS F_PROCESS,
        T.CMM_KEY_3 AS F_MACHINE														
        ,T.CMM_VALUE_NUM_1 AS F_CHAMBER,
        T.CMM_VALUE_NUM_2 AS F_MODE,
        T.CMM_VALUE_CHR_1 AS F_HOLDING														
        FROM FPCC_CONTROL_MASTER_MAINTAIN T														
        WHERE T.CMM_TYPE = '0034'														
       	AND (T.CMM_KEY_1 = '${Product}' OR '${Product}'  = 'ALL')													
        ORDER BY T.CMM_KEY_1,T.CMM_KEY_2 `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      PRODUCT: row[0],
      PROCESS: row[1],
      MACHINE: row[2],
      CHAMBER: row[3],
      MODE: row[4],
      HOLDING: row[5],
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
async function readBlobData(blobData) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    blobData.on("data", (chunk) => chunks.push(chunk));
    blobData.on("end", () => resolve(Buffer.concat(chunks)));
    blobData.on("error", (err) => reject(err));
  });
}

module.exports.FileFormat = async function (req, res) {
  var query = "";
  let Conn;
  try {
    Conn = await ConnectOracleDB("FPC");
    query += `
          SELECT T.CMT_FILE_FORMAT													  
          FROM FPCC_CONTROL_MASTER_TYPE T													  
          WHERE T.CMT_CODE ='0034'		`;

    const result = await Conn.execute(query);

    if (result.rows.length > 0) {
      const blobData = result.rows[0][0];

      if (blobData) {
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="yourfile.ext"'
        );

        const buffer = await readBlobData(blobData);

        res.send(buffer);
      } else {
        res.status(404).json({ message: "No BLOB data found." });
      }
    } else {
      res.status(404).json({ message: "File not found." });
    }
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};


module.exports.InsUploadFile = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("FPC");
    const { Product, Process, Machine, Chamber, Mode, Holding } = req.body;

    const query = `
      INSERT INTO FPCC_CONTROL_MASTER_MAINTAIN(CMM_TYPE, CMM_KEY_1, CMM_KEY_2, CMM_KEY_3, CMM_VALUE_NUM_1, CMM_VALUE_NUM_2, CMM_VALUE_CHR_1)
      VALUES('0034', :insproduct, :insprocess, :insmachine, :inschamber, :insmode, :insholding)`;

    const params = {
      insproduct: Product,
      insprocess: Process,
      insmachine: Machine,
      inschamber: Chamber,
      insmode: Mode,
      insholding: Holding,
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

module.exports.DeleteUploadFile = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("FPC");
    const { Product, Process } = req.body;
    const query = `
       DELETE FROM FPCC_CONTROL_MASTER_MAINTAIN T																																																	
       WHERE T.CMM_TYPE = '0034'																																																	
       AND T.CMM_KEY_1 = :Delproduct																																																	
       AND T.CMM_KEY_2 = :Delprocess`;

    const params = {
      Delproduct: Product,
      Delprocess: Process,
    };

    const result = await Conn.execute(query, params, { autoCommit: true });
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

