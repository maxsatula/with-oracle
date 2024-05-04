import oracledb from 'oracledb';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let connectionPool;
let logger_ = console;

const f = async callback => {
    let connection;
    try {
        connection = await connectionPool.getConnection();
        return await callback(connection);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                logger_.error(err, ...(err.message ? [err.message] : []));
            }
        }
    }
};

export async function connect(options, logger) {
    if (logger) {
        logger_ = logger;
    }
    try {
        connectionPool = await oracledb.createPool(options);
    } catch (err) {
        logger_.error(err, ...(err.message ? [err.message] : []));
    }
};

export function disconnect() {
    return connectionPool.close();
}

export function execute(...args) {
    return f(c => c.execute(...args))
};

export function executeMany(...args) {
    return f(c => c.executeMany(...args))
};

export const dbms_output = {
    enable() {
        return execute('begin dbms_output.enable(null); end;');
    },

    [Symbol.asyncIterator]() {
        return {
            async next() {
                const {
                    outBinds: { line, status },
                } = await execute('begin dbms_output.get_line(:line, :status); end;', {
                    line: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
                    status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                });

                return status === 0 ? { done: false, value: line } : { done: true };
            },
        };
    },
};

export default f;
