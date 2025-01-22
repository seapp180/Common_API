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
	DISTINCT T.WORK_LOCATION AS WORK_TEXT,
    T.WORK_LOCATION AS WORK_LABEL
FROM
	CUSR.CU_USER_HUMANTRIX T
WHERE
	T.STATUS = 'Active'
	AND T.WORK_LOCATION NOT IN ('L1', 'N2', 'N3')
ORDER BY
	T.WORK_LOCATION `;
          const result = await Conn.execute(query);
          const jsonData = result.rows.map((row) => ({
               value: row[0],
               label: row[1]
          }));

          res.status(200).json(jsonData);
          DisconnectOracleDB(Conn);
     } catch (error) {
          writeLogError(error.message, query);
          res.status(500).json({ message: error.message });
     }
};

module.exports.GetDataMFG = async function (req, res) {
     var query = "";
     try {
          const Conn = await ConnectOracleDB("QAD");
          query += `
SELECT A.*	
FROM	
(	
  SELECT T.EMPCODE AS EMP_CODE,T.ETITLE || ' ' || T.ENAME || ' ' || T.ESURNAME AS EMP_ENG_NAME	
         ,T.TTITLE || ' ' || T.TNAME || ' ' || T.TSURNAME AS EMP_THA_NAME	
         ,TO_CHAR(T.JOIN_DATE,'DD/MM/YYYY') AS EMP_JOIN_DATE,TO_CHAR(T.TERM_DATE,'DD/MM/YYYY') AS EMP_TERM_DATE,T.POS_GRADE AS EMP_LEVEL	
         ,T.COST_CENTER AS EMP_COST_CENTER	
         ,NVL((SELECT C.CC_DESC FROM CC_MSTR C WHERE C.CC_CTR =T.COST_CENTER AND C.CC_DOMAIN ='9000'),T.PROCESS) AS EMP_COST_CENTER_NAME	
         ,T.WORKTYPE AS EMP_TYPE	
         ,CASE WHEN UPPER(T.FACTORY) LIKE '%AYUTTHAYA%' THEN 'AYUTTHAYA FACTORY 1 (A1)'	
                WHEN UPPER(T.FACTORY) LIKE '%NAVANAKORN%' THEN 'NAVANAKORN FACTORY 1 (N1)'	
                WHEN UPPER(T.FACTORY) LIKE '%PRACHIBURI%' THEN 'PRACHINBURI FACTORY 1 (P1)'	
                WHEN UPPER(T.FACTORY) LIKE '%KABINBURI%' THEN 'KABINBURI FACTORY 1 (K1)'	
               ELSE T.FACTORY END AS EMP_FACTORY                         	
         ,(SELECT DISTINCT RTRIM(XMLAGG(XMLELEMENT(E, UPPER(T.USR_USERID) || ',')).EXTRACT('//text()'), ',')	
           FROM QAD.USR_MSTR T	
           WHERE T.USR_ACTIVE ='1'	
                 AND T.USR_REMARK LIKE '%' || T.EMPCODE || '%'	
                 AND	
                    (	
                                 T.USR_REMARK NOT LIKE '%BA1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BN1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BP1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BK1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BHQ%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NA1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NN1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NP1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NK1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NHQ%' || T.EMPCODE	
                    )	
          ) AS USER_QAD_LOGIN	
         ,(SELECT DISTINCT RTRIM(XMLAGG(XMLELEMENT(E, UPPER(T.usr_name) || ',')).EXTRACT('//text()'), ',')	
           FROM QAD.USR_MSTR T	
           WHERE T.USR_ACTIVE ='1'	
                 AND T.USR_REMARK LIKE '%' || T.EMPCODE || '%'	
                 AND	
                    (	
                                 T.USR_REMARK NOT LIKE '%BA1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BN1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BP1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BK1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BHQ%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NA1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NN1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NP1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NK1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NHQ%' || T.EMPCODE	
                    )	
          ) AS USER_QAD_NAME	
         ,(SELECT DISTINCT RTRIM(XMLAGG(XMLELEMENT(E, UPPER(T.usr_remark) || ',')).EXTRACT('//text()'), ',')	
           FROM QAD.USR_MSTR T	
           WHERE T.USR_ACTIVE ='1'	
                 AND T.USR_REMARK LIKE '%' || T.EMPCODE || '%'	
                 AND	
                    (	
                                 T.USR_REMARK NOT LIKE '%BA1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BN1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BP1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BK1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%BHQ%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NA1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NN1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NP1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NK1%' || T.EMPCODE	
                                 AND T.USR_REMARK NOT LIKE '%NHQ%' || T.EMPCODE	
                    )	
          ) AS USER_QAD_REMARK	
  FROM CUSR.CU_USER_HUMANTRIX T	
  WHERE 1=1	
      --  AND (T.TERM_DATE IS NOT NULL AND T.TERM_DATE <= SYSDATE + 1)--comment if get data all	
        AND UPPER(T.WORKTYPE)  <> 'SD,SUBCONTRACT DAILY'	
  ORDER BY 1	
) A	
WHERE A.USER_QAD_LOGIN IS NOT NULL	
ORDER BY A.EMP_CODE `;
          const result = await Conn.execute(query);
          const jsonData = result.rows.map((row) => ({
               EMP_CODE: row[0],
               EMP_ENG_NAME: row[1],
               EMP_THA_NAME: row[2],
               EMP_JOIN_DATE: row[3],
               EMP_TERM_DATE: row[4],
               EMP_LEVEL: row[5],
               EMP_COST_CENTER: row[6],
               EMP_COST_CENTER_NAME: row[7],
               EMP_TYPE: row[8],
               EMP_FACTORY: row[9],
               USER_QAD_LOGIN: row[10],
               USER_QAD_NAME: row[11],
               USER_QAD_REMARK: row[12]
          }));

          res.status(200).json(jsonData);
          DisconnectOracleDB(Conn);
     } catch (error) {
          writeLogError(error.message, query);
          res.status(500).json({ message: error.message });
     }
};

module.exports.GetDataMFGList = async function (req, res) {
     var query = "";
     try {
          const Conn = await ConnectOracleDB("QAD");
          query += `
SELECT
	Usr_remark AS Dept,
	(CASE
		WHEN substr(substr(Usr_remark, LENGTH(Usr_remark) - 11 + 1, 11),		
                     1,		
                     1) = 'B'
		OR		
              substr(substr(Usr_remark, LENGTH(Usr_remark) - 11 + 1, 11),		
                     1,		
                     1) = 'N' THEN		
          substr(Usr_remark, LENGTH(Usr_remark) - 11 + 1, 11)
		ELSE		
          NULL
	END) AS RequestNo,
	Usr_userid AS LoginID,
	Usr_name AS UserName,
	decode(usr_active, '1', 'Active', 'InActive') AS Status,
	udd_domain AS DOMAIN,
	to_date(udd_mod_date, 'dd/MM/yy') AS UpdateDate,
	to_date(Usr_logon_date, 'dd/MM/yy') AS LastLogonDate,
	Decode(instr(upper(udd_groups), 'QAD'), 0, NULL, 'O') AS QAD,
	Decode(instr(upper(udd_groups), 'SEADMIN'), 0, NULL, 'O') AS SEADMIN,
	Decode(instr(upper(udd_groups), 'SEMS'), 0, NULL, 'O') AS SEMS,
	Decode(instr(upper(udd_groups), 'SEAPP'), 0, NULL, 'O') AS SEAPP,
	Decode(instr(upper(udd_groups), 'ACADMIN'), 0, NULL, 'O') AS ACADMIN,
	Decode(instr(upper(udd_groups), 'GL'), 0, NULL, 'O') AS GL,
	CASE
		WHEN instr(upper(udd_groups), 'AP,') = 1 THEN		
          'O'
		WHEN substr(upper(udd_groups), LENGTH(udd_groups) - 2, 3) = ',AP' THEN		
          'O'
		WHEN instr(upper(udd_groups), ',AP,') > 0 THEN		
          'O'
		WHEN upper(udd_groups) = 'AP' THEN		
          'O'
		ELSE		
          NULL
	END AS AP,
	Decode(instr(upper(udd_groups), 'APMS'), 0, NULL, 'O') AS APMS,
	CASE
		WHEN instr(upper(udd_groups), 'AR,') = 1 THEN		
          'O'
		WHEN substr(upper(udd_groups), LENGTH(udd_groups) - 2, 3) = ',AR' THEN		
          'O'
		WHEN instr(upper(udd_groups), ',AR,') > 0 THEN		
          'O'
		WHEN upper(udd_groups) = 'AR' THEN		
          'O'
		ELSE		
          NULL
	END AS AR,
	Decode(instr(upper(udd_groups), 'ARMS'), 0, NULL, 'O') AS ARMS,
	Decode(instr(upper(udd_groups), 'FA'), 0, NULL, 'O') AS FA,
	Decode(instr(upper(udd_groups), 'CT'), 0, NULL, 'O') AS CT,
	CASE
		WHEN instr(upper(udd_groups), 'SL,') = 1 THEN		
          'O'
		WHEN substr(upper(udd_groups), LENGTH(udd_groups) - 2, 3) = ',SL' THEN		
          'O'
		WHEN instr(upper(udd_groups), ',SL,') > 0 THEN		
          'O'
		WHEN upper(udd_groups) = 'SL' THEN		
          'O'
		ELSE		
          NULL
	END AS SL,
	Decode(instr(upper(udd_groups), 'SLMS'), 0, NULL, 'O') AS SLMS,
	Decode(instr(upper(udd_groups), 'PL'), 0, NULL, 'O') AS PL,
	Decode(instr(upper(udd_groups), 'SP'), 0, NULL, 'O') AS SP,
	CASE
		WHEN instr(upper(udd_groups), 'BY,') = 1 THEN		
          'O'
		WHEN substr(upper(udd_groups), LENGTH(udd_groups) - 2, 3) = ',BY' THEN		
          'O'
		WHEN instr(upper(udd_groups), ',BY,') > 0 THEN		
          'O'
		WHEN upper(udd_groups) = 'BY' THEN		
          'O'
		ELSE		
          NULL
	END AS Buyer,
	Decode(instr(upper(udd_groups), 'BYMS'), 0, NULL, 'O') AS BYMS,
	CASE
		WHEN instr(upper(udd_groups), 'STWH,') = 1 THEN		
          'O'
		WHEN substr(upper(udd_groups), LENGTH(udd_groups) - 4, 5) = ',STWH' THEN		
          'O'
		WHEN instr(upper(udd_groups), ',STWH,') > 0 THEN		
          'O'
		WHEN upper(udd_groups) = 'STWH' THEN		
          'O'
		ELSE		
          NULL
	END AS STWH,
	Decode(instr(upper(udd_groups), 'QA'),		
              0,		
              NULL,		
              Decode(instr(upper(udd_groups), 'QAD'), 0, 'O', NULL)) AS QA,
	CASE
		WHEN instr(upper(udd_groups), 'PROD,') = 1 THEN		
          'O'
		WHEN substr(upper(udd_groups), LENGTH(udd_groups) - 4, 5) = ',PROD' THEN		
          'O'
		WHEN instr(upper(udd_groups), ',PROD,') > 0 THEN		
          'O'
		WHEN upper(udd_groups) = 'PROD' THEN		
          'O'
		ELSE		
          NULL
	END AS PROD,
	decode(instr(upper(udd_groups), 'PRODSTWH'), 0, NULL, 'O') AS PRODSTWH,
	CASE
		WHEN instr(upper(udd_groups), 'EN,') = 1 THEN		
          'O'
		WHEN substr(upper(udd_groups), LENGTH(udd_groups) - 2, 3) = ',EN' THEN		
          'O'
		WHEN instr(upper(udd_groups), ',EN,') > 0 THEN		
          'O'
		WHEN upper(udd_groups) = 'EN' THEN		
          'O'
		ELSE		
          NULL
	END AS EN,
	Decode(instr(upper(udd_groups), 'GENERAL'), 0, NULL, 'O') AS GENERAL,
	Decode(instr(upper(udd_groups), '1100'), 0, NULL, 'O') AS Site1100,
	Decode(instr(upper(udd_groups), '1200'), 0, NULL, 'O') AS Site1200,
	Decode(instr(upper(udd_groups), '2200'), 0, NULL, 'O') AS Site2200,
	Decode(instr(upper(udd_groups), '3200'), 0, NULL, 'O') AS SITE3200,
	Decode(instr(upper(udd_groups), '5100'), 0, NULL, 'O') AS SITE5100,
	Decode(instr(upper(udd_groups), '5200'), 0, NULL, 'O') AS SITE5200,
	Decode(instr(upper(udd_groups), '9200'), 0, NULL, 'O') AS SITE9200,
	Decode(instr(upper(udd_groups), '9400'), 0, NULL, 'O') AS SITE9400,
	Decode(instr(upper(NVL(ENT.code_cmmt, ' ')), '1000'), 0, NULL, 'O') AS Entity1000,
	Decode(instr(upper(NVL(ENT.code_cmmt, ' ')), '2000'), 0, NULL, 'O') AS Entity2000,
	Decode(instr(upper(NVL(ENT.code_cmmt, ' ')), '3000'), 0, NULL, 'O') AS Entity3000,
	Decode(instr(upper(NVL(ENT.code_cmmt, ' ')), '5000'), 0, NULL, 'O') AS Entity5000,
	Decode(instr(upper(NVL(ENT.code_cmmt, ' ')), '9000'), 0, NULL, 'O') AS Entity9000
FROM
	qad.usr_mstr,
	qad.udd_det,
	(
	SELECT
		code_domain,
		code_value,
		code_cmmt
	FROM
		qad.code_mstr
	WHERE
		upper(code_fldname) = 'GLUSERID'
		AND upper(code_cmmt) <> ' ') ENT
WHERE
	upper(usr_userid) = upper(udd_userid(+))
	AND (upper(udd_domain) = upper(ENT.code_domain(+))
		AND		
        upper(udd_userid) = upper(ENT.code_value(+)))
	AND usr_active = 1
ORDER BY
	updatedate DESC,
	Usr_remark,
	Usr_userid,
	udd_domain `;
          const result = await Conn.execute(query);
          const jsonData = result.rows.map((row) => ({
               DEPT: row[0],
               REQUEST_NO: row[1],
               LOGIN_ID: row[2],
               USER_NAME: row[3],
               STATUS: row[4],
               DOMAIN: row[5],
               UPDATE_DATE: row[6],
               LAST_LOGON_DATE: row[7],
               QAD: row[8],
               SEADMIN: row[9],
               SEMS: row[10],
               SEAPP: row[11],
               ACADMIN: row[12],
               GL: row[13],
               AP: row[14],
               APMS: row[15],
               AR: row[16],
               ARMS: row[17],
               FA: row[18],
               CT: row[19],
               SL: row[20],
               SLMS: row[21],
               PL: row[22],
               SP: row[23],
               BUYER: row[24],
               BYMS: row[25],
               STWH: row[26],
               QA: row[27],
               PROD: row[28],
               PRODSTWH: row[29],
               EN: row[30],
               GENERAL: row[31],
               SITE2200: row[34],
               SITE9200: row[38],
               SITE9400: row[39],
               ENTITY2000: row[41],
               ENTITY9000: row[44]
          }));

          res.status(200).json(jsonData);
          DisconnectOracleDB(Conn);
     } catch (error) {
          writeLogError(error.message, query);
          res.status(500).json({ message: error.message });
     }
};


module.exports.DataSearch = async function (req, res) {
     var query = "";
     try {
          const Conn = await ConnectOracleDB("QAD");
          const { 
               FormMonth,
               ToMonth,
               FormDate,
               ToDate,
               Factory,
               EmpID,
               Name,
               Surname
          } = req.body;
          query += `
  SELECT 
       T.WORK_LOCATION,			
       T.EMPCODE,			
       T.ETITLE || ' ' || T.ENAME || ' ' || T.ESURNAME AS ENG_NAME,			
       T.TTITLE || ' ' || T.TNAME || ' ' || T.TSURNAME AS THAI_NAME,			
       T.TERM_DATE AS TERMINATE_DATE,			
       T.POS_GRADE,			
       T.POSITION,			
       T.COST_CENTER,			
       T.PROCESS,			
       T.V_SECTION,			
       T.DIVISION,			
       T.WORKTYPE			
  FROM 
       CUSR.CU_USER_HUMANTRIX T			
  WHERE 
       T.STATUS = 'Terminate'
       AND ('${FormMonth}' IS NULL OR TO_CHAR(T.TERM_DATE, 'yyyyMM') >= '${FormMonth}')
       AND ('${ToMonth}' IS NULL OR TO_CHAR(T.TERM_DATE, 'yyyyMM') <= '${ToMonth}')
       AND ('${FormDate}' IS NULL OR TO_CHAR(T.TERM_DATE, 'yyyyMMdd') >= '${FormDate}')
       AND ('${ToDate}' IS NULL OR TO_CHAR(T.TERM_DATE, 'yyyyMMdd') <= '${ToDate}') 
       AND ('${Factory}' IS NULL OR T.WORK_LOCATION = '${Factory}') 
       AND ('${EmpID}' IS NULL OR T.EMPCODE = '${EmpID}') 
       AND ('${Name}' IS NULL OR T.ENAME LIKE '${Name}' || '%') 
       AND ('${Surname}' IS NULL OR T.ESURNAME LIKE '${Surname}' || '%') `;
          const result = await Conn.execute(query);
          const jsonData = result.rows.map((row) => ({
               WORK_LOCATION: row[0],
               EMPCODE: row[1],
               ENG_NAME: row[2],
               THAI_NAME: row[3],
               TERMINATE_DATE: row[4],
               POS_GRADE: row[5],
               POSITION: row[6],
               COST_CENTER: row[7],
               PROCESS: row[8],
               V_SECTION: row[9],
               DIVISION: row[10],
               WORKTYPE: row[11]
          }));

          res.status(200).json(jsonData);
          DisconnectOracleDB(Conn);
     } catch (error) {
          writeLogError(error.message, query);
          res.status(500).json({ message: error.message });
     }
};
