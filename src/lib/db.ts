const oracledb = require('oracledb');

interface QueryParams {
  query: string;
  values?: any[];
}

export const query = async ({ query, values = [] }: QueryParams) => {
  const dbconnection = await oracledb.getConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || ''),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  });

  try {
    const [results] = await dbconnection.execute(query, values);
    dbconnection.end();
    return results;
  } catch (error: any) {
    throw Error(error.message);
  }
};
