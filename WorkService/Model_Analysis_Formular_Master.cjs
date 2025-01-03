const {
    ConnectPG_DB,
    DisconnectPG_DB,
    ConnectOracleDB,
    DisconnectOracleDB,
  } = require("../Conncetion/DBConn.cjs");
  const oracledb = require("oracledb");
  const { writeLogError } = require("../Common/LogFuction.cjs");


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
      const jsonData = result.rows.map(row => ({
        value: row[0] ?? '',
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
      const {PARAMETER_UNIT} = req.body
      query += `
                SELECT T.FAPM_PROCESS_ID AS F_VAL, T.FAPM_PROCESS_DESC AS F_TXT,1 AS SEQ
                FROM FPCQ_ANALYSIS_PROCESS_M T
                WHERE T.FAPM_UNIT = '${PARAMETER_UNIT}' AND T.FAPM_STATUS = 'A'
                UNION ALL
                SELECT '','ALL',0 FROM DUAL
                ORDER BY 3,2 `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        value: row[0] ?? '',
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
      const {PARAMETER_PROCESS} = req.body
      query += `
              SELECT DISTINCT T.FAMM_MC_ID AS F_VAL, T.FAMM_MC_DESC AS F_TXT,1 AS SEQ
                FROM FPCQ_ANALYSIS_MC_M T
                WHERE T.FAMM_STATUS = 'A'
                AND T.FAMM_PROC = '${PARAMETER_PROCESS}'
                UNION ALL
                SELECT '','ALL',0 FROM DUAL
                ORDER BY 3,2 `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        value: row[0] ?? '',
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
      const {PARAMETER_MC} = req.body
      query += `
               SELECT DISTINCT T.FABM_FAB_BATH_ID AS F_VAL, B.FAB_BATH_DESC AS F_TXT,B.FAB_SEQ,1 AS SEQ
          FROM FPCQ_ANALYSIS_BAHT_MC T, FPCQ_ANALYSIS_BATH B
          WHERE T.FABM_FAB_BATH_ID = B.FAB_BATH_ID
          AND T.FABM_FAMM_MC_ID = '${PARAMETER_MC}'
          AND B.FAB_STATUS = 'A'
          UNION ALL
          SELECT '','ALL',0,0 FROM DUAL
		  ORDER BY 4,3,2`;

      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        value: row[0] ?? '',
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
      const {PARAMETER_MC,PARAMETER_BATH} = req.body
      query += `
      SELECT T.FAM_CHEMICAL_ID AS F_VAL,T.FAM_CHEMICAL_DESC2 AS F_TXT,T.FAM_SEQ,1 AS SEQ
      FROM FPCQ_ANALYSIS_MASTER T
      WHERE T.FAM_STATUS='A'
      AND T.FAM_MC_CODE = '${PARAMETER_MC}'
      AND T.FAM_BATH_ID='${PARAMETER_BATH}'
      UNION ALL
      SELECT '','ALL',0,0 FROM DUAL
      ORDER BY 4,3,2
              `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        value: row[0] ?? '',
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
      const {PARAMETER_UNIT,PARAMETER_PROCESS,PARAMETER_MC,PARAMETER_BATH,PARAMETER_CHEMICAL} = req.body
      console.log('Search',PARAMETER_UNIT,PARAMETER_PROCESS,PARAMETER_MC,PARAMETER_BATH,PARAMETER_CHEMICAL)
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
        T.FAM_USL --19
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
      const jsonData = result.rows.map(row => ({
        FAUM_UNIT_DESC: row[0] ,
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
      const jsonData = result.rows.map(row => ({
        value: row[0] ,
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
      const {PARAMETER_UNIT} = req.body
      query += `
        SELECT T.FAPM_PROCESS_ID AS F_VAL, T.FAPM_PROCESS_DESC AS F_TXT
        FROM FPCQ_ANALYSIS_PROCESS_M T
        WHERE T.FAPM_UNIT = '${PARAMETER_UNIT}'
        ORDER BY 2
              `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        value: row[0] ,
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
      const {PARAMETER_PROCESS} = req.body
      query += `
        SELECT DISTINCT T.FAMM_MC_ID AS F_VAL, T.FAMM_MC_DESC AS F_TXT
        FROM FPCQ_ANALYSIS_MC_M T
        WHERE T.FAMM_STATUS = 'A'
              AND T.FAMM_PROC = '${PARAMETER_PROCESS}'
        ORDER BY 2
              `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        value: row[0] ,
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
    let Conn
    try {
      Conn = await ConnectOracleDB("FPC");
      query += `
         SELECT T.CMT_FILE_FORMAT
        FROM FPCC_CONTROL_MASTER_TYPE T
        WHERE T.CMT_CODE ='0038'	`;

      const result = await Conn.execute(query);
      console.log(result.rows)
      if (result.rows.length > 0) {
        const blobData = result.rows[0][0]; 
        
     
        if (blobData) {
      
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Disposition', 'attachment; filename="yourfile.ext"');
          
        
          const buffer = await readBlobData(blobData);
          
          res.send(buffer);
          
        } else {
          res.status(404).json({ message: "No BLOB data found." });
        }
    }else {
      res.status(404).json({ message: "File not found." });
    }
   
   } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
      console.error(error.message)
    }
    finally {
      DisconnectOracleDB(Conn); 
    }
  };
  
  async function readBlobData(blobData) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      blobData.on('data', chunk => chunks.push(chunk));
      blobData.on('end', () => resolve(Buffer.concat(chunks)));
      blobData.on('error', err => reject(err));
    });
  }
  
   
  module.exports.GetBathValue = async function (req, res) {
    var query = "";
    let data=''
    try {
      const Conn = await ConnectOracleDB("FPC");
      const {Bath} = req.body
      query += `
          SELECT DISTINCT T.FABM_FAB_BATH_ID AS F_VAL, B.FAB_BATH_DESC AS F_TXT
          FROM FPCQ_ANALYSIS_BAHT_MC T, FPCQ_ANALYSIS_BATH B
          WHERE T.FABM_FAB_BATH_ID = B.FAB_BATH_ID
          AND B.FAB_BATH_DESC = '${Bath}'
          AND B.FAB_STATUS = 'A'`;
      const result = await Conn.execute(query);
      if(result.rows.length>0){
        data=result.rows[0][0]
      }
      res.status(200).json(data);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };