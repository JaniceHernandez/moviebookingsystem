require("dotenv").config();
//const path = require("path");
const ibmdb = require("ibm_db");

const connStr =
  "DATABASE=" + process.env.DB_NAME +
  ";HOSTNAME=" + process.env.DB_HOST +
  ";PORT=" + process.env.DB_PORT +
  ";PROTOCOL=TCPIP" +
  ";UID=" + process.env.DB_USER +
  ";PWD=" + process.env.DB_PASS +
  ";SECURITY=SSL" +
  ";SSLServerCertificate=" + process.env.DB_CERT_PATH;

async function openConnection() {
  return ibmdb.open(connStr);
}

module.exports = { openConnection };
