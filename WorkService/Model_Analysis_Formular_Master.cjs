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
      query += `
      SELECT
        U.FAUM_UNIT_DESC,
        P.FAPM_PROCESS_DESC,
        M.FAMM_MC_ID,
        B.FAB_BATH_DESC,
        T.FAM_CHEMICAL_ID,
        T.FAM_CHEMICAL_DESC,
        T.FAM_SEQ,
        T.FAM_INPUT,
        T.FAM_FORMULA,
        T.FAM_FORMULA_REFER_ID,
        T.FAM_FORMULA_REFER_ID2,
        T.FAM_REPLENISHER,
        T.FAM_REP_REFER_ID1,
        T.FAM_REP_REFER_ID2,
        T.FAM_UNIT,
        T.FAM_TARGET,
        T.FAM_LCL,
        T.FAM_UCL,
        T.FAM_LSL,
        T.FAM_USL
    FROM FPCQ_ANALYSIS_MASTER T INNER JOIN FPCQ_ANALYSIS_MC_M M ON T.FAM_MC_CODE = M.FAMM_MC_ID
                  INNER JOIN FPCQ_ANALYSIS_PROCESS_M P ON P.FAPM_PROCESS_ID = M.FAMM_PROC
                  INNER JOIN FPCQ_ANALYSIS_UNIT_M U ON U.FAUM_UNIT_ID = P.FAPM_UNIT
                  INNER JOIN FPCQ_ANALYSIS_BATH B ON B.FAB_BATH_ID = T.FAM_BATH_ID
    WHERE (U.FAUM_UNIT_ID = '${PARAMETER_UNIT}' OR '${PARAMETER_UNIT}' IS NULL)
        AND (P.FAPM_PROCESS_ID = '${PARAMETER_PROCESS}' OR '${PARAMETER_PROCESS}' IS NULL)
        AND (M.FAMM_MC_ID = '${PARAMETER_MC}' OR '${PARAMETER_MC}' IS NULL)
        AND (B.FAB_BATH_ID = '${PARAMETER_BATH}' OR '${PARAMETER_BATH}' IS NULL)
        AND (T.FAM_CHEMICAL_ID = '${PARAMETER_CHEMICAL}' OR '${PARAMETER_CHEMICAL}' IS NULL)
    ORDER BY U.FAUM_UNIT_DESC,P.FAPM_PROCESS_DESC,M.FAMM_MC_ID,B.FAB_BATH_DESC,T.FAM_SEQ
                  `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        FAUM_UNIT_DESC: row[0] ,
        FAPM_PROCESS_DESC: row[1],
        FAMM_MC_ID: row[2],
        FAB_BATH_DESC: row[3],
        FAM_CHEMICAL_ID: row[4],
        FAM_CHEMICAL_DESC: row[5],
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
        UNIT_F_VAL: row[0] ,
        UNIT_F_TXT: row[1],
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
        PROCESS_F_VAL: row[0] ,
        PROCESS_F_TXT: row[1],
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
        MACHINE_F_VAL: row[0] ,
        MACHINE_F_TXT: row[1],
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
    try {
      const Conn = await ConnectOracleDB("FPC");
      query += `
       SELECT T.CMT_FILE_FORMAT
        FROM FPCC_CONTROL_MASTER_TYPE T
        WHERE T.CMT_CODE ='0038'

              `;
      const result = await Conn.execute(query);
      const jsonData = result.rows.map(row => ({
        CMT_FILE_FORMAT: row[0] 
      }));
      
     
      res.status(200).json(jsonData);
      DisconnectOracleDB(Conn);
    } catch (error) {
      writeLogError(error.message, query);
      res.status(500).json({ message: error.message });
    }
  };
  
   