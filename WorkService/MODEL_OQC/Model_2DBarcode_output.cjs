const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracleDB,
  DisconnectOracleDB,
} = require("../../Conncetion/DBConn.cjs");
const oracledb = require("oracledb");
const { writeLogError } = require("../../Common/LogFuction.cjs");

module.exports.GetCheckPrdnamewithLot = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;

  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                SELECT T.LOT_PRD_NAME ,T.LOT
                FROM FPC_LOT T
                WHERE T.LOT = '${strLotNo}'
                `;
    const result = await Conn.execute(query);
    if (result.rows.length > 0) {
      jsonData = {
        prdName: result.rows[0][0],
        lot: result.rows[0][1],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetCheckRawData = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                 SELECT T.QOD_SERIAL,COUNT(T.QOD_SERIAL) AS F_COUNT
                    FROM COND.QA_OQC_2D_DATA T
                    WHERE T.QOD_LOT='${strLotNo}'
                    GROUP BY T.QOD_SERIAL

                  `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      let dtData = [];
      for (let i = 0; i < result.rows.length; i++) {
        dtData.push({
          Qod_serial: result.rows[i][0],
          F_count: result.rows[i][1],
        });
      }
      jsonData = dtData;
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetCheckNGRawData = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                 SELECT COUNT(D.QOD_SERIAL) AS F_RESULT                     
                    FROM COND.QA_OQC_2D_DATA D INNER JOIN FPC.FPC_LOT LO ON LO.LOT=D.QOD_LOT                      
                                            LEFT JOIN FPC.FPCC_CONTROL_MASTER_MAINTAIN M                     
                                                    ON M.CMM_TYPE='0041'                     
                                                    AND M.CMM_KEY_1='01'                     
                                                    AND LO.LOT_PRD_NAME LIKE CMM_KEY_2 || '%'                      
                                                    AND M.CMM_STATUS='A'                     
                                                    AND M.CMM_VALUE_CHR_1 LIKE '%' || D.QOD_GRADE || '%'                     
                    WHERE D.QOD_LOT='${strLotNo}'
                        AND (D.QOD_GRADE IS NOT NULL AND M.CMM_VALUE_CHR_1 IS NULL) 
                  `;
    const result = await Conn.execute(query);
    if (result.rows.length > 0) {
      jsonData = {
        ng_count: result.rows[0][0],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetCheckDuplicatedata = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                   SELECT T.*
                        FROM COND.QA_OQC_2D_HEADER T
                        WHERE T.QOH_LOT='${strLotNo}'                
                    `;
    const result = await Conn.execute(query);
    console.log(query);
    if (result.rows.length > 0) {
      jsonData = {
        QOH_LOT: result.rows[0][0],
        QOH_OP: result.rows[0][1],
        QOH_STATE: result.rows[0][2],
        QOH_LOT_SIZE: result.rows[0][3],
        QOH_REJECT: result.rows[0][4],
        QOH_SAMPING_SIZE: result.rows[0][5],
        QOH_BARCODE_TYPE: result.rows[0][6],
        QOH_APERTURE: result.rows[0][7],
        QOH_REMARK: result.rows[0][8],
        QOH_CONFIRM_BY: result.rows[0][9],
        QOH_CONFIRM_DATE: result.rows[0][10],
        QOH_CONFIRM_REMARK: result.rows[0][11],
        QOH_CREATED_BY: result.rows[0][12],
        QOH_CREATED_DATE: result.rows[0][13],
        QOH_MODIFIED_BY: result.rows[0][14],
        QOH_MODIFIED_DATE: result.rows[0][15],
        QOH_DATE: result.rows[0][16],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetcheckUserStatus = async function (req, res) {
  var query = "";
  const { strUserIdCode } = req.query;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
                     SELECT T.EMPCODE,T.TNAME,T.TSURNAME,T.STATUS
                        FROM CUSR.CU_USER_HUMANTRIX@PCTTPROD T
                        WHERE T.EMPCODE ='${strUserIdCode}'             
                      `;
    const result = await Conn.execute(query);
    console.log(result);
    if (result.rows.length > 0) {
      jsonData = {
        emp_code: result.rows[0][0],
        tname: result.rows[0][1],
        tsurname: result.rows[0][2],
        status: result.rows[0][3],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetcheckSameQtywithLot = async function (req, res) {
  var query = "";
  const { strLotNo } = req.query;

  try {
    const Conn = await ConnectOracleDB("FPC");
    console.log(strLotNo);
    query += `
                       SELECT COUNT(D.QOD_SERIAL) AS F_QTY                    
                        FROM COND.QA_OQC_2D_DATA D                
                        WHERE D.QOD_LOT='${strLotNo}' 
                        `;
    const result = await Conn.execute(query);
    if (result.rows.length > 0) {
      jsonData = {
        qty: result.rows[0][0],
      };
    } else {
      jsonData = {
        message: "Not Found Data",
      };
    }
    res.status(200).json(jsonData);
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.InsertOqcoutputData = async function (req, res) {
  var query = "";
  const { dataList } = req.body;
  console.log(dataList);
  try {
    query += `
                MERGE INTO COND.QA_OQC_2D_HEADER FH	
                USING ( SELECT :strLot AS QOH_LOT	
                , :strOP AS QOH_OP	
                , :strState AS QOH_STAGE	
                , :strLotSize AS QOH_LOT_SIZE	
                , :strReject AS QOH_REJECT	
                , :strSamplingSize AS QOH_SAMPLING_SIZE	
                , :strBarcodeType AS QOH_BARCODE_TYPE	
                , :strAperture AS QOH_APERTURE	
                , :strRemark AS QOH_REMARK	
                FROM DUAL	
                ) R	
                ON (	
                FH.QOH_LOT = R.QOH_LOT	
                )	
                WHEN MATCHED THEN	
                UPDATE SET	
                FH.QOH_OP = R.QOH_OP	
                ,FH.QOH_STAGE = R.QOH_STAGE	
                ,FH.QOH_LOT_SIZE = R.QOH_LOT_SIZE	
                ,FH.QOH_REJECT = R.QOH_REJECT	
                ,FH.QOH_SAMPLING_SIZE = R.QOH_SAMPLING_SIZE	
                ,FH.QOH_BARCODE_TYPE = R.QOH_BARCODE_TYPE	
                ,FH.QOH_APERTURE = R.QOH_APERTURE	
                ,FH.QOH_REMARK = R.QOH_REMARK	
                ,FH.QOH_MODIFIED_BY = R.QOH_OP	
                ,FH.QOH_MODIFIED_DATE = SYSDATE	
                WHEN NOT MATCHED THEN	
                INSERT	
                (	
                FH.QOH_LOT	
                , FH.QOH_OP	
                , FH.QOH_STAGE	
                , FH.QOH_LOT_SIZE	
                , FH.QOH_REJECT	
                , FH.QOH_SAMPLING_SIZE	
                , FH.QOH_BARCODE_TYPE	
                , FH.QOH_APERTURE	
                , FH.QOH_REMARK	
                , FH.QOH_CREATED_BY	
                , FH.QOH_MODIFIED_BY)	
                VALUES (	
                R.QOH_LOT	
                , R.QOH_OP	
                , R.QOH_STAGE	
                , R.QOH_LOT_SIZE	
                , R.QOH_REJECT	
                , R.QOH_SAMPLING_SIZE	
                , R.QOH_BARCODE_TYPE	
                , R.QOH_APERTURE	
                , R.QOH_REMARK	
                , R.QOH_OP	
                , R.QOH_OP)	
           `;
    const binds = {
      strLot: dataList.strLotNo,
      strOP: dataList.strOp,
      strState: dataList.strState,
      strLotSize: parseInt(dataList.strLotSize),
      strReject: parseInt(dataList.strReject),
      strSamplingSize: parseInt(dataList.strSampingSize),
      strBarcodeType: dataList.strBarcodeType,
      strAperture: dataList.strAperture,
      strRemark: dataList.strRemark,
    };
    const Conn = await ConnectOracleDB("FPC");
    const result = await Conn.execute(query, binds, { autoCommit: true });
    console.log(result);
    DisconnectOracleDB(Conn);
    res.status(200).json({ message: "Success" });
  } catch (err) {
    writeLogError(err.message, query);
    res.status(500).json({ message: "Cannot save, Error : " + err.message });
  }
};

module.exports.InsertQrcodeTest = async function (req, res) {
  let query = "";
  const { strEmpcode , strName , strContent } = req.body;
  try {
    const Conn = await ConnectOracleDB("FPC");
    query += `
               insert into FPC.TEMP_TABLE_SOMDET
               (FIELD1,FIELD2,FIELD3) 
               VALUES
               (:strEmpcode,:strName,:strContent)
               `;
    const binds = {
      strEmpcode: strEmpcode,
      strName: strName,
      strContent: strContent,
    };
    const result = await Conn.execute(query,binds,{autoCommit:true});
    if(result.rowsAffected>0){
      res.status(200).json({message:"success"});
    }
    DisconnectOracleDB(Conn);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
}


