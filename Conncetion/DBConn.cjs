const { Client } = require('pg');
const oracledb = require("oracledb");
require("dotenv").config();
oracledb.initOracleClient({
    // tnsAdmin: "D:\\app\\\Chayanon.I\\product\\11.2.0\\client_2\\network\\admin",
    tnsAdmin: process.env.TNS_ADMIN,
});

const ConnectPG_DB= async () => {
    const Pg_FETL_A1_Service ={
        user: process.env.FETLSQLA1_USER,
        host: process.env.FETLSQLA1_HOST,
        database: process.env.FETLSQLA1_DATABASE,
        password: process.env.FETLSQLA1_PASSWORD,
        port: process.env.FETLSQLA1_PORT,
    }
    const client = new Client(Pg_FETL_A1_Service);
    await client.connect(); 
    await client.query('SET timezone = \'Asia/Bangkok\'');

    return client;
};

const DisconnectPG_DB = async (client) => {
    await client.end(); 
    // console.log("Disconnected from PostgreSQL");
}

const ConnectOracleDB = async (ConnType) => {
    const oracledb = require("oracledb");

    if (ConnType === "FPC"){
        const FPC = {
            user: process.env.FPC_USER,
            password: process.env.FPC_PASSWORD,
            connectString : process.env.FPC_CONNECTION_STRING,
        };
        const connection = await oracledb.getConnection(FPC);
        return connection;
    }else if (ConnType === "SMT"){
        const SMT = {
            user: process.env.SMT_USER,
            password: process.env.SMT_PASSWORD,
            connectString : process.env.SMT_CONNECTION_STRING,
        };
        console.log(process.env.SMT_USER,process.env.SMT_PASSWORD,process.env.SMT_CONNECTION_STRING)
        const connection = await oracledb.getConnection(SMT);
        return connection;
    }else if (ConnType === 'PCTTTEST'){
        const PCTTTEST = {
            user: process.env.PCTTTEST_USER,
            password: process.env.PCTTTEST_PASSWORD,
            connectString : process.env.PCTTTEST_CONNECTION_STRING,
        };
        const connection = await oracledb.getConnection(PCTTTEST);
        return connection;
    }
    else if (ConnType === 'QAD'){
        const PCTTTEST = {
            user: process.env.QAD_USER,
            password: process.env.QAD_PASSWORD,
            connectString : process.env.QAD_CONNECTION_STRING,
        };
        const connection = await oracledb.getConnection(PCTTTEST);
        return connection;
    }
};

const DisconnectOracleDB = async (connection) => {
    await connection.close();
    // console.log("Disconnected from Oracle");
}


module.exports = { ConnectPG_DB, DisconnectPG_DB ,ConnectOracleDB,DisconnectOracleDB};

