const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../Common/LogFuction.cjs");

async function readBlobData(blobData) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    blobData.on("data", (chunk) => chunks.push(chunk));
    blobData.on("end", () => resolve(Buffer.concat(chunks)));
    blobData.on("error", (err) => reject(err));
  });
}

async function GetChecmID(ChemDesc, Machine) {
  console.log(ChemDesc, Machine);
  var query = "";
  let data = "";
  // try {
  const Conn = await ConnectOracleDB("FPC");
  // const {Bath} = req.body
  query += `
        SELECT
          FAM_CHEMICAL_ID
        FROM FPCQ_ANALYSIS_MASTER
        WHERE 1=1
          AND FAM_CHEMICAL_DESC = '${ChemDesc}'
          AND FAM_CHEMICAL_DESC2 ='${ChemDesc}'
          AND FAM_MC_CODE = '${Machine}'`;
  const result = await Conn.execute(query);
  console.log("GetChecmID", result.rows);
  DisconnectOracleDB(Conn);
  if(result.rows.length>0){
    data = result.rows[0][0];
  }
  return data;
}

module.exports.GetUnit = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
               SELECT T.FAUM_UNIT_ID AS F_VAL, T.FAUM_UNIT_DESC AS F_TXT,1 AS SEQ
                FROM FPCQ_ANALYSIS_UNIT_M T
                WHERE T.FAUM_STATUS = 'A'
                UNION ALL
                SELECT '','ALL',0 FROM DUAL
                ORDER BY 3,2  `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0] ?? "",
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetProcess = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { PARAMETER_UNIT } = req.body;
    query += `
                SELECT T.FAPM_PROCESS_ID AS F_VAL, T.FAPM_PROCESS_DESC AS F_TXT,1 AS SEQ
                FROM FPCQ_ANALYSIS_PROCESS_M T
                WHERE T.FAPM_UNIT = '${PARAMETER_UNIT}' AND T.FAPM_STATUS = 'A'
                UNION ALL
                SELECT '','ALL',0 FROM DUAL
                ORDER BY 3,2 `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0] ?? "",
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetMachine = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { PARAMETER_PROCESS,PARAMETER_UNIT } = req.body;
    console.log(PARAMETER_PROCESS,PARAMETER_UNIT,'GetMC')
    query += `
    SELECT DISTINCT T.FAMM_MC_ID AS F_VAL, T.FAMM_MC_DESC AS F_TXT,1 AS SEQ
    FROM FPCQ_ANALYSIS_MC_M T INNER JOIN FPCQ_ANALYSIS_PROCESS_M P ON P.FAPM_PROCESS_ID=T.FAMM_PROC
    WHERE T.FAMM_STATUS = 'A'
          AND (T.FAMM_PROC = '${PARAMETER_PROCESS}' OR  '${PARAMETER_PROCESS}' IS NULL)
          AND (P.FAPM_UNIT = '${PARAMETER_UNIT}' OR '${PARAMETER_UNIT}' IS NULL)
    UNION ALL
    SELECT '','ALL',0 FROM DUAL
    ORDER BY 3,2`;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0] ?? "",
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetBath = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { PARAMETER_MC } = req.body;
    query += `
    SELECT DISTINCT T.FABM_FAB_BATH_ID AS F_VAL, B.FAB_BATH_DESC AS F_TXT,B.FAB_SEQ,1 AS SEQ
    FROM FPCQ_ANALYSIS_BAHT_MC T, FPCQ_ANALYSIS_BATH B
    WHERE T.FABM_FAB_BATH_ID = B.FAB_BATH_ID
          AND (T.FABM_FAMM_MC_ID = '${PARAMETER_MC}' OR '${PARAMETER_MC}' IS NULL)
          AND B.FAB_STATUS = 'A'
    UNION ALL
    SELECT '','ALL',0,0 FROM DUAL
    ORDER BY 4,3,2 `;

    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0] ?? "",
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetChemical = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { PARAMETER_MC, PARAMETER_BATH } = req.body;
    query += `
      SELECT T.FAM_CHEMICAL_ID AS F_VAL,T.FAM_CHEMICAL_DESC2 AS F_TXT,T.FAM_SEQ,1 AS SEQ
      FROM FPCQ_ANALYSIS_MASTER T
      WHERE T.FAM_STATUS='A'
          AND (T.FAM_MC_CODE = '${PARAMETER_MC}' OR '${PARAMETER_MC}' IS NULL)
          AND (T.FAM_BATH_ID='${PARAMETER_BATH}' OR '${PARAMETER_BATH}' IS NULL)
      UNION ALL
      SELECT '','ALL',0,0 FROM DUAL
      ORDER BY 4,3,2 `;
      console.log(query,'GetChemical')
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0] ?? "",
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.Search_Analysis = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const {
      PARAMETER_UNIT,
      PARAMETER_PROCESS,
      PARAMETER_MC,
      PARAMETER_BATH,
      PARAMETER_CHEMICAL,
    } = req.body;
    console.log(
      "Search",
      PARAMETER_UNIT,
      PARAMETER_PROCESS,
      PARAMETER_MC,
      PARAMETER_BATH,
      PARAMETER_CHEMICAL
    );
    query += `
      SELECT
        U.FAUM_UNIT_DESC, --0
        P.FAPM_PROCESS_DESC, --1
        M.FAMM_MC_ID, --2
        B.FAB_BATH_DESC, --3 
        T.FAM_CHEMICAL_ID,  --4
        T.FAM_CHEMICAL_DESC,  --5
        T.FAM_SEQ,  --6
        T.FAM_INPUT,  --7
        T.FAM_FORMULA,  --8
        CR1.FAM_CHEMICAL_DESC AS FORMULA_REFER1,  --9
        CR2.FAM_CHEMICAL_DESC AS FORMULA_REFER2,  --10
        T.FAM_REPLENISHER,  --11
        REP1.FAM_CHEMICAL_DESC AS REFER_REFER1, --12 
        REP2.FAM_CHEMICAL_DESC AS REFER_REFER2, --13
        T.FAM_UNIT, --14
        T.FAM_TARGET, --15
        T.FAM_LCL,  --16
        T.FAM_UCL,  --17
        T.FAM_LSL,  --18
        T.FAM_USL, --19
        ROW_NUMBER() OVER (ORDER BY U.FAUM_UNIT_DESC,P.FAPM_PROCESS_DESC,M.FAMM_MC_ID,B.FAB_BATH_DESC,T.FAM_SEQ)
      FROM FPCQ_ANALYSIS_MASTER T INNER JOIN FPCQ_ANALYSIS_MC_M M ON T.FAM_MC_CODE = M.FAMM_MC_ID  
               INNER JOIN FPCQ_ANALYSIS_PROCESS_M P ON P.FAPM_PROCESS_ID = M.FAMM_PROC  
               INNER JOIN FPCQ_ANALYSIS_UNIT_M U ON U.FAUM_UNIT_ID = P.FAPM_UNIT  
               INNER JOIN FPCQ_ANALYSIS_BATH B ON B.FAB_BATH_ID = T.FAM_BATH_ID 
               LEFT JOIN FPCQ_ANALYSIS_MASTER CR1 ON CR1.FAM_CHEMICAL_ID = T.FAM_FORMULA_REFER_ID AND CR1.FAM_BATH_ID = T.FAM_BATH_ID 
               LEFT JOIN FPCQ_ANALYSIS_MASTER CR2 ON CR2.FAM_CHEMICAL_ID = T.FAM_FORMULA_REFER_ID2 AND CR2.FAM_BATH_ID = T.FAM_BATH_ID                               
               LEFT JOIN FPCQ_ANALYSIS_MASTER REP1 ON REP1.FAM_CHEMICAL_ID = T.FAM_REP_REFER_ID1 AND REP1.FAM_BATH_ID = T.FAM_BATH_ID 
               LEFT JOIN FPCQ_ANALYSIS_MASTER REP2 ON REP2.FAM_CHEMICAL_ID = T.FAM_REP_REFER_ID2 AND REP2.FAM_BATH_ID = T.FAM_BATH_ID
      WHERE 1=1
        AND (U.FAUM_UNIT_ID = '${PARAMETER_UNIT}' OR '${PARAMETER_UNIT}' IS NULL)
        AND (P.FAPM_PROCESS_ID = '${PARAMETER_PROCESS}' OR '${PARAMETER_PROCESS}' IS NULL)
        AND (M.FAMM_MC_ID = '${PARAMETER_MC}' OR '${PARAMETER_MC}' IS NULL)
        AND (B.FAB_BATH_ID = '${PARAMETER_BATH}' OR '${PARAMETER_BATH}' IS NULL)
        AND (T.FAM_CHEMICAL_ID = '${PARAMETER_CHEMICAL}' OR '${PARAMETER_CHEMICAL}' IS NULL)
       ORDER BY U.FAUM_UNIT_DESC,P.FAPM_PROCESS_DESC,M.FAMM_MC_ID,B.FAB_BATH_DESC,T.FAM_SEQ
                  `;
    // console.log(query)
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      FAUM_UNIT_DESC: row[0],
      FAPM_PROCESS_DESC: row[1],
      FAMM_MC_ID: row[2],
      FAB_BATH_DESC: row[3],
      FAM_CHEMICAL_ID: row[4],
      FAM_CHEMICAL_DESC: row[5], //pp
      FAM_SEQ: row[6],
      FAM_INPUT: row[7],
      FAM_FORMULA: row[8],
      FAM_FORMULA_REFER_ID: row[9],
      FAM_FORMULA_REFER_ID2: row[10],
      FAM_REPLENISHER: row[11],
      FAM_REP_REFER_ID1: row[12],
      FAM_REP_REFER_ID2: row[13],
      FAM_UNIT: row[14],
      FAM_TARGET: row[15],
      FAM_LCL: row[16],
      FAM_UCL: row[17],
      FAM_LSL: row[18],
      FAM_USL: row[19],
      NO: row[20]
    }));
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetUnitPopup = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
    SELECT T.FAUM_UNIT_ID AS F_VAL, T.FAUM_UNIT_DESC AS F_TXT
    FROM FPCQ_ANALYSIS_UNIT_M T
    WHERE T.FAUM_STATUS = 'A'
    ORDER BY 2

              `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetProcessPopup = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { PARAMETER_UNIT } = req.body;
    query += `
        SELECT T.FAPM_PROCESS_ID AS F_VAL, T.FAPM_PROCESS_DESC AS F_TXT
        FROM FPCQ_ANALYSIS_PROCESS_M T
        WHERE T.FAPM_UNIT = '${PARAMETER_UNIT}'
        ORDER BY 2
              `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetMachinePopup = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { PARAMETER_PROCESS } = req.body;
    query += `
        SELECT DISTINCT T.FAMM_MC_ID AS F_VAL, T.FAMM_MC_DESC AS F_TXT
        FROM FPCQ_ANALYSIS_MC_M T
        WHERE T.FAMM_STATUS = 'A'
              AND T.FAMM_PROC = '${PARAMETER_PROCESS}'
        ORDER BY 2
              `;
    const result = await Conn.execute(query);
    const jsonData = result.rows.map((row) => ({
      value: row[0],
      label: row[1],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetFileFormat = async function (req, res) {
  var query = "";
  let Conn;
  try {
    Conn = await ConnectOracleDB("FPC");
    query += `
         SELECT T.CMT_FILE_FORMAT
        FROM FPCC_CONTROL_MASTER_TYPE T
        WHERE T.CMT_CODE ='0038'	`;

    const result = await Conn.execute(query);
    console.log(result.rows);
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
    res.status(500).json({ message: error.message })
  } 
};

module.exports.GetBathValue = async function (req, res) {
  var query = "";
  let data = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { Bath } = req.body;
    query += `
          SELECT DISTINCT T.FABM_FAB_BATH_ID AS F_VAL, B.FAB_BATH_DESC AS F_TXT
          FROM FPCQ_ANALYSIS_BAHT_MC T, FPCQ_ANALYSIS_BATH B
          WHERE T.FABM_FAB_BATH_ID = B.FAB_BATH_ID
          AND B.FAB_BATH_DESC = '${Bath}'
          AND B.FAB_STATUS = 'A'`;
    const result = await Conn.execute(query);
    if (result.rows.length > 0) {
      data = result.rows[0][0];
    }
    res.status(200).json(data);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.CheckChemical = async function (req, res) {
  var query = "";
  let data = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { MC_Code, Chem_Desc } = req.body;
    query += `
          SELECT (SELECT B.FAB_BATH_DESC FROM FPCQ_ANALYSIS_BATH B WHERE B.FAB_BATH_ID=T.FAM_BATH_ID) AS F_BATH  
          ,T.FAM_BATH_ID     
          ,T.FAM_CHEMICAL_ID
          ,T.FAM_CHEMICAL_DESC
          ,T.FAM_SEQ
          ,T.FAM_MC_CODE
          ,T.FAM_FORMULA
          ,T.FAM_INPUT
          ,T.FAM_FORMULA_REFER_ID
          ,T.FAM_FORMULA_REFER_ID2
          ,T.FAM_REPLENISHER
          ,T.FAM_FORMULA1
          ,T.FAM_FORMULA2
          ,T.FAM_REP_REFER_ID1
          ,T.FAM_REP_REFER_ID2
          ,T.FAM_CHEMICAL_DESC2
          ,T.FAM_UNIT
          ,T.FAM_TARGET
          ,T.FAM_LCL
          ,T.FAM_UCL
          ,T.FAM_LSL
          ,T.FAM_USL
          ,T.FAM_STATUS
          ,T.FAM_UPDATE_DATE
          ,T.ROWID
        FROM FPCQ_ANALYSIS_MASTER T
        WHERE 1=1
              AND T.FAM_MC_CODE='${MC_Code}'
              AND TRIM(UPPER(T.FAM_CHEMICAL_DESC)) = TRIM(UPPER('${Chem_Desc}'))`;
    const result = await Conn.execute(query);
    // if(result.rows.length>0){
    //   data=result.rows[0][0]
    // }
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.CheckChemDesc = async function (req, res) {
  var query = "";
  let data = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    // const {MC_Code,Chem_Desc} = req.body
    query += `
                      
     SELECT (SELECT A.FAM_CHEMICAL_ID
            FROM FPCQ_ANALYSIS_MASTER A
            WHERE A.FAM_BATH_ID=T.FAM_BATH_ID
                  AND A.FAM_MC_CODE=T.FAM_MC_CODE
                  AND UPPER(TRIM(A.FAM_CHEMICAL_DESC))=UPPER(TRIM(T.FAM_FORMULA_REFER_ID))) AS FORMULA_REFER_ID1
           ,(SELECT A.FAM_CHEMICAL_ID
            FROM FPCQ_ANALYSIS_MASTER A
            WHERE A.FAM_BATH_ID=T.FAM_BATH_ID
                  AND A.FAM_MC_CODE=T.FAM_MC_CODE
                  AND UPPER(TRIM(A.FAM_CHEMICAL_DESC))=UPPER(TRIM(T.FAM_FORMULA_REFER_ID2))) AS FORMULA_REFER_ID2
           ,(SELECT A.FAM_CHEMICAL_ID
            FROM FPCQ_ANALYSIS_MASTER A
            WHERE A.FAM_BATH_ID=T.FAM_BATH_ID
                  AND A.FAM_MC_CODE=T.FAM_MC_CODE
                  AND UPPER(TRIM(A.FAM_CHEMICAL_DESC))=UPPER(TRIM(T.FAM_REP_REFER_ID1))) AS REP_REFER_ID1
           ,(SELECT A.FAM_CHEMICAL_ID
            FROM FPCQ_ANALYSIS_MASTER A
            WHERE A.FAM_BATH_ID=T.FAM_BATH_ID
                  AND A.FAM_MC_CODE=T.FAM_MC_CODE
                  AND UPPER(TRIM(A.FAM_CHEMICAL_DESC))=UPPER(TRIM(T.FAM_REP_REFER_ID2))) AS REP_REFER_ID2
           ,T.FAM_CHEMICAL_ID,T.FAM_BATH_ID,T.FAM_MC_CODE,T.FAM_CHEMICAL_DESC
           ,T.FAM_FORMULA_REFER_ID,T.FAM_FORMULA_REFER_ID2
           ,T.FAM_REP_REFER_ID1,T.FAM_REP_REFER_ID2
    FROM FPCQ_ANALYSIS_MASTER T
    WHERE (T.FAM_FORMULA_REFER_ID IS NOT NULL
          OR T.FAM_FORMULA_REFER_ID2 IS NOT NULL
          OR T.FAM_REP_REFER_ID1 IS NOT NULL
          OR T.FAM_REP_REFER_ID2 IS NOT NULL)
          AND
              (
                (
                  (SELECT COUNT(T2.FAM_CHEMICAL_DESC)
                   FROM FPCQ_ANALYSIS_MASTER T2
                   WHERE T2.FAM_CHEMICAL_ID=T.FAM_FORMULA_REFER_ID) <=0
                         AND T.FAM_FORMULA_REFER_ID IS NOT NULL
                 )
                 OR
                (
                  (SELECT COUNT(T2.FAM_CHEMICAL_DESC)
                   FROM FPCQ_ANALYSIS_MASTER T2
                   WHERE T2.FAM_CHEMICAL_ID=T.FAM_FORMULA_REFER_ID2) <=0
                         AND T.FAM_FORMULA_REFER_ID2 IS NOT NULL
                 )
                 OR
                (
                  (SELECT COUNT(T2.FAM_CHEMICAL_DESC)
                   FROM FPCQ_ANALYSIS_MASTER T2
                   WHERE T2.FAM_CHEMICAL_ID=T.FAM_REP_REFER_ID1) <=0
                         AND T.FAM_REP_REFER_ID1 IS NOT NULL
                 )
                 OR
                (
                  (SELECT COUNT(T2.FAM_CHEMICAL_DESC)
                   FROM FPCQ_ANALYSIS_MASTER T2
                   WHERE T2.FAM_CHEMICAL_ID=T.FAM_REP_REFER_ID2) <=0
                         AND T.FAM_REP_REFER_ID2 IS NOT NULL
                 )
              )`;
    // console.l
    const result = await Conn.execute(query);
    console.log(result.rows, "test3");
    const jsonData = result.rows.map((row) => ({
      FORMULA_REFER_ID1: row[0],
      FORMULA_REFER_ID2: row[1],
      REP_REFER_ID1: row[2],
      REP_REFER_ID2: row[3],
      CHEMICAL_ID: row[4],
      FAM_BATH_ID: row[5],
      FAM_MC_CODE: row[6],
      FAM_CHEMICAL_DESC: row[7],
      FAM_FORMULA_REFER_ID1: row[8],
      FAM_FORMULA_REFER_ID2: row[9],
      FAM_REP_REFER_ID1: row[10],
      FAM_REP_REFER_ID2: row[11],
    }));

    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};


module.exports.CheckMcChemBath = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { BATH, MACHINE, CHEM } = req.body;
    query += `
    SELECT
      FAM_CHEMICAL_DESC,FAM_SEQ
    FROM
      FPCQ_ANALYSIS_MASTER
    WHERE
      FAM_BATH_ID ='${BATH}'
      AND FAM_MC_CODE ='${MACHINE}'
      AND FAM_CHEMICAL_DESC ='${CHEM}'`;
    const result = await Conn.execute(query);
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.CheckSEQChemBath = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { BATH, MACHINE, SEQ } = req.body;
    query += `
    SELECT
      FAM_CHEMICAL_DESC,FAM_SEQ
    FROM
      FPCQ_ANALYSIS_MASTER
    WHERE
      FAM_BATH_ID ='${BATH}'
      AND FAM_MC_CODE ='${MACHINE}'
      AND FAM_SEQ ='${SEQ}'`;
    const result = await Conn.execute(query);
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.Change_ChemID = async function (req, res) {
  let query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { data, Machine, loginID } = req.body;
    // console.log(loginID, 'test');
    // let ChemID = await GetChecmID(data.CHEMICAL,Machine)
    console.log(data, "data");
    query = `
          UPDATE FPCQ_ANALYSIS_MASTER T
          SET T.FAM_FORMULA_REFER_ID=NVL(:FORMULA_REFER_ID1,T.FAM_FORMULA_REFER_ID)
              ,T.FAM_FORMULA_REFER_ID2=NVL(:FORMULA_REFER_ID2,T.FAM_FORMULA_REFER_ID2)
              ,T.FAM_REP_REFER_ID1=NVL(:REP_REFER_ID1,T.FAM_REP_REFER_ID1)
              ,T.FAM_REP_REFER_ID2=NVL(:REP_REFER_ID2,T.FAM_REP_REFER_ID2)
          WHERE T.FAM_CHEMICAL_ID=:CHEMICAL_ID
          `;

    const binds = {
      FORMULA_REFER_ID1: data.FORMULA_REFER_ID1,
      FORMULA_REFER_ID2: data.FORMULA_REFER_ID2,
      REP_REFER_ID1: data.REP_REFER_ID1,
      REP_REFER_ID2: data.REP_REFER_ID2,
      CHEMICAL_ID: data.CHEMICAL_ID,
    };

    console.log(binds, "binds");
    const result = await Conn.execute(query, binds, { autoCommit: true });
    // console.warn(result.rows);
    res.status(200).json(result.rows);
    await DisconnectOracleDB(Conn);
  } catch (error) {
    console.error(error.message);
    writeLogError(error.message, query);
    res.status(200).json(error.message);
  }
};

module.exports.DeleteChem = async function (req, res) {
  var query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { BATH, MACHINE, CHEM } = req.body;
    query += `
    DELETE FROM FPCQ_ANALYSIS_MASTER
    WHERE
      FAM_BATH_ID =:BATH
      AND FAM_MC_CODE =:MACHINE
      AND FAM_CHEMICAL_DESC =:CHEM `;
    // console.log(query)
    const binds = {
      BATH: BATH,
      MACHINE: MACHINE,
      CHEM: CHEM,
    };
    const result = await Conn.execute(query, binds, { autoCommit: true });
    // const result = await Conn.execute(query);
    res.status(200).json(result.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};


module.exports.Merge_Chem = async function (req, res) {
  let query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { data, Machine, loginID } = req.body;
    let ChemID = await GetChecmID(data.CHEMICAL,Machine)
    query = `
      MERGE INTO FPCQ_ANALYSIS_MASTER T
      USING (
        SELECT :ChemID AS ChemID, :CHEMICAL AS CHEMICAL, :BATH AS BATH, :Machine AS Machine, :SEQ AS SEQ, :UNIT AS UNIT, 
               :TARGET AS TARGET, :USL AS USL, :LSL AS LSL, :UCL AS UCL, :LCL AS LCL, :INPUT AS INPUT, 
               :FORMULA AS FORMULA, :FORMULA_REFER1 AS FORMULA_REFER1, :FORMULA_REFER2 AS FORMULA_REFER2, 
               :REPLENISHER AS REPLENISHER, :REPLENISHER_REFER1 AS REPLENISHER_REFER1, 
               :REPLENISHER_REFER2 AS REPLENISHER_REFER2, :UPDATE_BY AS UPDATE_BY
        FROM DUAL
      ) S
      ON (T.FAM_CHEMICAL_ID = S.ChemID)
      WHEN MATCHED THEN
        UPDATE SET 
          T.FAM_CHEMICAL_DESC = S.CHEMICAL,
          T.FAM_CHEMICAL_DESC2 = S.CHEMICAL,
          T.FAM_SEQ = S.SEQ,
          T.FAM_UNIT = S.UNIT,
          T.FAM_TARGET = S.TARGET,
          T.FAM_USL = S.USL,
          T.FAM_LSL = S.LSL,
          T.FAM_UCL = S.UCL,
          T.FAM_LCL = S.LCL,
          T.FAM_FORMULA = S.FORMULA,
          T.FAM_FORMULA_REFER_ID = S.FORMULA_REFER1,
          T.FAM_FORMULA_REFER_ID2 = S.FORMULA_REFER2,
          T.FAM_INPUT = S.INPUT,
          T.FAM_STATUS = 'A',
          T.FAM_REPLENISHER = S.REPLENISHER,
          T.FAM_REP_REFER_ID1 = S.REPLENISHER_REFER1,
          T.FAM_REP_REFER_ID2 = S.REPLENISHER_REFER2,
          T.FAM_UPDATE_DATE = SYSDATE,
          T.FAM_UPDATE_BY = S.UPDATE_BY
      WHEN NOT MATCHED THEN
        INSERT (
          FAM_CHEMICAL_ID, FAM_BATH_ID, FAM_CHEMICAL_DESC, FAM_CHEMICAL_DESC2,
          FAM_MC_CODE, FAM_SEQ, FAM_STATUS,
          FAM_UNIT, FAM_TARGET, FAM_USL, FAM_LSL, FAM_UCL, FAM_LCL,
          FAM_INPUT,
          FAM_FORMULA, FAM_FORMULA_REFER_ID, FAM_FORMULA_REFER_ID2,
          FAM_REPLENISHER, FAM_REP_REFER_ID1, FAM_REP_REFER_ID2, FAM_UPDATE_DATE, FAM_UPDATE_BY
        ) VALUES (
          ( SELECT 'C'  || TRIM(TO_CHAR(MAX(TO_NUMBER(SUBSTR(FAM_CHEMICAL_ID,2,4))) + 1,'0000')) 
          AS CHEMICALID
          FROM FPCQ_ANALYSIS_MASTER
          ), 
          :BATH, :CHEMICAL, :CHEMICAL,
          :Machine, :SEQ, 'A',
          :UNIT, :TARGET, :USL, :LSL, :UCL, :LCL,
          :INPUT,
          :FORMULA, :FORMULA_REFER1, :FORMULA_REFER2,
          :REPLENISHER, :REPLENISHER_REFER1, :REPLENISHER_REFER2, SYSDATE, :UPDATE_BY
        )
    `;

    const binds = {
      ChemID: ChemID,
      BATH: data.BATH_ID,
      CHEMICAL: data.CHEMICAL,
      Machine: Machine,
      SEQ: data.SEQ,
      UNIT: data.UNIT,
      TARGET: data.TARGET,
      USL: data.USL,
      LSL: data.LSL,
      UCL: data.UCL,
      LCL: data.LCL,
      INPUT: data.INPUT,
      FORMULA: data.FORMULA,
      FORMULA_REFER1: data.FORMULA_REFER1,
      FORMULA_REFER2: data.FORMULA_REFER2,
      REPLENISHER: data.REPLENISHER,
      REPLENISHER_REFER1: data.REPLENISHER_REFER1,
      REPLENISHER_REFER2: data.REPLENISHER_REFER2,
      UPDATE_BY: loginID,
    };

    const result = await Conn.execute(query, binds, { autoCommit: true });
    res.status(200).json(result.rows);
    await DisconnectOracleDB(Conn);
  } catch (error) {
    console.error(error.message);
    writeLogError(error.message, query);
    res.status(200).json(error.message);
  }
};
//-------------------DeleteChem-----------------------------------
// module.exports.Check_UseChem = async function (req, res) {
//   let query = "";
//   try {
//     const Conn = await ConnectOracleDB("FPC");
//     const { data, Machine, loginID } = req.body;
//     // console.log(loginID, 'test');
//     // let ChemID = await GetChecmID(data.CHEMICAL,Machine)
//     console.log(data, "data");
//     query = `
//         SELECT COUNT(T.FAR_DATE) AS F_COUNT
//         FROM FPCQ_ANALYSIS_RECORD T
//         WHERE T.FAR_CHEMICAL_ID = '${Chem_Id}'
//           `;

//     const result = await Conn.execute(query);
//     // console.warn(result.rows);
//     res.status(200).json(result.rows);
//     await DisconnectOracleDB(Conn);
//   } catch (error) {
//     console.error(error.message);
//     writeLogError(error.message, query);
//     res.status(200).json(error.message);
//   }
// }


module.exports.Check_UseChem = async function (req, res) {
  let query = "";
  try {
    const Conn = await ConnectOracleDB("FPC");
    const { Chem_ID } = req.body;
    // let Chem_ID = await GetChecmID(Chem_DESC,Machine)
    console.log(Chem_ID, "Chem_ID");
    query = `
        SELECT COUNT(T.FAR_DATE) AS F_COUNT
        FROM FPCQ_ANALYSIS_RECORD T
        WHERE T.FAR_CHEMICAL_ID = '${Chem_ID}'
          `;
    const result = await Conn.execute(query);
    res.status(200).json(result.rows);
    await DisconnectOracleDB(Conn);
  } catch (error) {
    console.error(error.message);
    writeLogError(error.message, query);
    res.status(200).json(error.message);
  }
}


//---Back up ก่อน Delete 
module.exports.Delete_Chemical_And_Backup = async function (req, res) {
  let Conn;
  let query;
  try {
    Conn = await ConnectOracleDB("FPC");
    const { Chem_ID,login_ID } = req.body;
    const query1 = `
        INSERT INTO FPC.FPCQ_ANALYSIS_MASTER_DEL_HIST(FAM_CHEMICAL_ID, FAM_BATH_ID, FAM_CHEMICAL_DESC
                                , FAM_UNIT, FAM_TARGET, FAM_USL, FAM_LSL, FAM_UCL, FAM_LCL
                                , FAM_FORMULA, FAM_FORMULA_REFER_ID, FAM_REPLENISHER, FAM_INPUT
                                , FAM_STATUS, FAM_SEQ, FAM_CHEMICAL_DESC2, FAM_FORMULA_REFER_ID2
                                , FAM_FORMULA1, FAM_FORMULA2, FAM_MC_CODE, FAM_REP_REFER_ID1
                                , FAM_REP_REFER_ID2, FAM_UPDATE_DATE, FAM_UPDATE_BY
                                , FAM_DALETE_DATE, FAM_DALETE_BY)
        SELECT FAM_CHEMICAL_ID, FAM_BATH_ID, FAM_CHEMICAL_DESC
            , FAM_UNIT, FAM_TARGET, FAM_USL, FAM_LSL, FAM_UCL, FAM_LCL
            , FAM_FORMULA, FAM_FORMULA_REFER_ID, FAM_REPLENISHER, FAM_INPUT
            , FAM_STATUS, FAM_SEQ, FAM_CHEMICAL_DESC2, FAM_FORMULA_REFER_ID2
            , FAM_FORMULA1, FAM_FORMULA2, FAM_MC_CODE, FAM_REP_REFER_ID1
            , FAM_REP_REFER_ID2, FAM_UPDATE_DATE, FAM_UPDATE_BY
            , SYSDATE , :login_ID
        FROM FPC.FPCQ_ANALYSIS_MASTER M
        WHERE M.FAM_CHEMICAL_ID = :Chem_ID
      `;
      const params1 = {
        login_ID: login_ID,
        Chem_ID: Chem_ID
      };
      const query2= `
        DELETE FROM FPC.FPCQ_ANALYSIS_MASTER M
        WHERE M.FAM_CHEMICAL_ID = :Chem_ID
      `;
      const params2 = {
        Chem_ID: Chem_ID
      };
      
    const result1 = await Conn.execute(query1, params1, { autoCommit: true });
    const result2 = await Conn.execute(query2, params2, { autoCommit: true });
    console.log("-----------------------");
    console.log(result1, "result2");
    console.log("-----------------------");
    console.log(result2, "result3");
    console.log("-----------------------");
    res.status(200).json(result2.rows);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
    console.error(error.message);
  }
};


// module.exports.Ins_Chem = async function (req, res) {
//   let query = "";
//   try {
//     const Conn = await ConnectOracleDB("FPC");
//     const { data, Machine, loginID } = req.body;
//     console.log(loginID, "test");

//     query = `
//             INSERT INTO FPCQ_ANALYSIS_MASTER (
//                 FAM_CHEMICAL_ID, FAM_BATH_ID, FAM_CHEMICAL_DESC, FAM_CHEMICAL_DESC2,
//                 FAM_MC_CODE, FAM_SEQ, FAM_STATUS,
//                 FAM_UNIT, FAM_TARGET, FAM_USL, FAM_LSL, FAM_UCL, FAM_LCL,
//                 FAM_INPUT,
//                 FAM_FORMULA, FAM_FORMULA_REFER_ID, FAM_FORMULA_REFER_ID2,
//                 FAM_REPLENISHER, FAM_REP_REFER_ID1, FAM_REP_REFER_ID2, FAM_UPDATE_DATE,FAM_UPDATE_BY
//             ) VALUES (
//                 (SELECT A.F_ID AS CHEMICALID
//                 FROM (
//                     SELECT DISTINCT 'C' || TRIM(TO_CHAR(FAM_CHEMICAL_ID, '0000')) AS F_ID
//                     FROM (
//                         SELECT LEVEL + 1 AS FAM_CHEMICAL_ID
//                         FROM DUAL
//                         CONNECT BY LEVEL <= 4000
//                     ) NUMBERS
//                     WHERE FAM_CHEMICAL_ID NOT IN (
//                         SELECT SUBSTR(FAM_CHEMICAL_ID, 2, 4)
//                         FROM FPCQ_ANALYSIS_MASTER
//                     )
//                     ORDER BY 1
//                 ) A
//                 WHERE ROWNUM = 1
//                 ), 
//                 :BATH, :CHEMICAL, :CHEMICAL,
//                 :Machine, :SEQ, 'A',
//                 :UNIT, :TARGET, :USL, :LSL, :UCL, :LCL,
//                 :INPUT,
//                 :FORMULA, :FORMULA_REFER1, :REPLENISHER_REFER2,
//                 :REPLENISHER, :REPLENISHER_REFER1, :REPLENISHER_REFER2, SYSDATE, :UPDATE_BY
//             )`;

//     const binds = {
//       BATH: data.BATH_ID,
//       CHEMICAL: data.CHEMICAL,
//       Machine: Machine,
//       SEQ: data.SEQ,
//       UNIT: data.UNIT,
//       TARGET: data.TARGET,
//       USL: data.USL,
//       LSL: data.LSL,
//       UCL: data.UCL,
//       LCL: data.LCL,
//       INPUT: data.INPUT,
//       FORMULA: data.FORMULA,
//       FORMULA_REFER1: data.FORMULA_REFER1,
//       REPLENISHER_REFER2: data.REPLENISHER_REFER2,
//       REPLENISHER: data.REPLENISHER,
//       REPLENISHER_REFER1: data.REPLENISHER_REFER1,
//       UPDATE_BY: loginID,
//     };

//     const result = await Conn.execute(query, binds, { autoCommit: true });
//     // console.warn(result.rows);
//     res.status(200).json(result.rows);
//     await DisconnectOracleDB(Conn);
//   } catch (error) {
//     console.error(error.message);
//     writeLogError(error.message, query);
//     res.status(200).json(error.message);
//   }
// };
//--------------------------------------------------------------------------------------------------
// module.exports.Update_Chem = async function (req, res) {
//   let query = "";
//   try {
//     const Conn = await ConnectOracleDB("FPC");
//     const { data, Machine, loginID } = req.body;
//     // console.log(loginID, 'test');
//     let ChemID = await GetChecmID(data.CHEMICAL, Machine);
//     console.log(ChemID, "Checm");
//     query = `
//           UPDATE FPCQ_ANALYSIS_MASTER T
//             SET T.FAM_CHEMICAL_DESC=:CHEMICAL
//                 ,T.FAM_CHEMICAL_DESC2=:CHEMICAL
//                 ,T.FAM_SEQ=:SEQ
//                 ,T.FAM_UNIT=:UNIT
//                 ,T.FAM_TARGET=:TARGET
//                 ,T.FAM_USL=:USL
//                 ,T.FAM_LSL=:LSL
//                 ,T.FAM_UCL=:UCL
//                 ,T.FAM_LCL=:LCL
//                 ,T.FAM_FORMULA=:FORMULA
//                 ,T.FAM_FORMULA_REFER_ID=:FORMULA_REFER1
//                 ,T.FAM_FORMULA_REFER_ID2=:FORMULA_REFER2
//                 ,T.FAM_INPUT=:INPUT
//                 ,T.FAM_STATUS='A'
//                 ,T.FAM_REPLENISHER=:REPLENISHER
//                 ,T.FAM_REP_REFER_ID1=:REPLENISHER_REFER1
//                 ,T.FAM_REP_REFER_ID2=:REPLENISHER_REFER2
//                 ,T.FAM_UPDATE_DATE=SYSDATE
//                 ,T.FAM_UPDATE_BY=:UPDATE_BY
//             WHERE T.FAM_CHEMICAL_ID=:CHEMICAL_ID`;

//     const binds = {
//       CHEMICAL: data.CHEMICAL,
//       SEQ: data.SEQ,
//       UNIT: data.UNIT,
//       TARGET: data.TARGET,
//       USL: data.USL,
//       LSL: data.LSL,
//       UCL: data.UCL,
//       LCL: data.LCL,
//       FORMULA: data.FORMULA,
//       FORMULA_REFER1: data.FORMULA_REFER1,
//       FORMULA_REFER2: data.FORMULA_REFER2,
//       INPUT: data.INPUT,
//       REPLENISHER: data.REPLENISHER,
//       REPLENISHER_REFER1: data.REPLENISHER_REFER1,
//       REPLENISHER_REFER2: data.REPLENISHER_REFER2,
//       UPDATE_BY: loginID,
//       CHEMICAL_ID: ChemID,
//     };

//     console.log(binds, "bimnd");
//     const result = await Conn.execute(query, binds, { autoCommit: true });
//     // console.warn(result.rows);
//     res.status(200).json(result.rows);
//     await DisconnectOracleDB(Conn);
//   } catch (error) {
//     console.error(error.message);
//     writeLogError(error.message, query);
//     res.status(200).json(error.message);
//   }
// };
