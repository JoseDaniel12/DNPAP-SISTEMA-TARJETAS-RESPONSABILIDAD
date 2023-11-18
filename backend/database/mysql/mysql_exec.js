const conn = require('./mysql_conn');


const mysql_exec_query = async (query) => {
    try {
        const [result] = await conn.promise().execute(query);
        return result;
    } catch (err) {
        return {err};
    }
}
  
  
const mysql_exec_proc = async (name, params) => {
    try {
        let proc;
        if (params.length > 0) {
            const formated_params = params.join(`', '`);
            proc = `CALL ${name}('${formated_params}');`;
        } else {
            proc = `CALL ${name}();`;
        }
        const [result] = await conn.promise().execute(proc);
        return result[0];
    } catch (err) {
        return {err};
    }
}


// const mysql_promise_exec_query = async (query) => {
//     return new Promise((resolve, reject) => {
//         conn.query(query, (error, result) => {
//             if (error) {
//                 reject(error);
//             }
//             resolve(result);
//         });
//     })
// }
  
  
// const mysql_promise_exec_proc = async (name, params) => {
//     let proc = `CALL ${name}();`;
//     if (params.length > 0) {
//         const formated_params = params.join(`', '`);
//         proc = `CALL ${name}('${formated_params}');`;
//     }
//     return mysql_exec_query(proc);
// }

  
module.exports = {
    mysql_exec_query,
    mysql_exec_proc,
}