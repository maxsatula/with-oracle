# with-oracle

Simple interface to run oracle queries.

## Description

This package is a wrapper over
[oracledb](https://oracle.github.io/node-oracledb).

Autocommit is turned on by default, and `outFormat` is set to
`OUT_FORMAT_OBJECT`.

Connection pooling is used.

## Usage

### Import

```js
import withOracle, { connect, disconnect, execute, dbms_output } from 'with-oracle';
```

### Connect

Initialize a connection pool. Options will be passed as is to
`oracledb.createPool()`.

```js
await connect({
    user: 'admin',
    password: '<very_secure_password>',
    connectionString: 'mydb1',
    configDir: '/home/user/wallet',
    walletLocation: '/home/user/wallet',
    walletPassword: '<very_secure_password>',
});
```

### Run a query

`execute` is for a single set of bind values, `executeMany` is for an
array of sets of bind values.

```js
const { rows } = await execute('select * from dual connect by level <= :lev', { lev: 8 });
```

### Read from DBMS_OUTPUT

```js
await dbms_output.enable();

for await (const line of dbms_output) {
    console.log(line);
}
```

### Run custom functions on an oracle connection

The module default export function opens an oracle connection in a
pool and provides it as a callback function argument. After callback
function finishes, the connection is automatically closed.

```js
console.log(await withOracle(connection => connection.execute('select * from dual')));
```

### Disconnect

Destroy a connection pool.

```js
await disconnect();
```
