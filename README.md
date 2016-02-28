# graphql-knex-resolver

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

GraphQL Resolver built with Knex. Can be used to parse GraphQL ASTs into
SQL, and as a resolver method standin in a GraphQL schema.

## Install

```sh
$ npm install --save graphql-knex-resolver
```

## Usage

Do the stuff you'd normally do, but use the provided resolver method in your
GraphQL schema.

### 1. Initialize the Resolver

```js
const Resolver = require('graphql-knex-resolver')

// setup knex
const gql = require('graphql')
const knex = require('knex')({
  client: 'pg',
  connection: {
    // ...
  }
})
const resolver = Resolver.getResolver(knex)
```

### 2. Define the Schema

```js
// create the GraphQL schema using the resolver
const userObject = new gql.GraphQLObjectType({
  name: 'User',
  fields: () => ({
    username: {
      type: gql.GraphQLString
    }
  })
})
const userQuery = new gql.GraphQLObjectType({
  name: 'UserQuery',
  fields: () => ({
    user: {
      type: userObject,
      resolve: resolver // <-------- use the resolver method
    }
  })
})
const userSchema = new gql.GraphQLSchema({
  query: userQuery
})
```js

### 3. Execute a Query
```
const findUserByUsername = `{
  user (username: $username) {
    id
    username
  }
}`
return gql.graphql(userSchema, findUserByUsername, {
    username: "tjwebb"
  })
  .then(results => {
    console.log(results)
  })
```

## API

### `getResolver(engine)`

Prepare a new GraphQL Query Resolver

### `.toSQL(query, dialect, args)`

Translates a GraphQL query into SQL, irrespective of schema. Uses the
root field name as the table.

Dialect is one of:
- `pg`
- `mysql`
- `sqlite3`

#### Example

Using the `findUserByUsername` query above.


##### Simple Select Statement
```js
const sql = resolver.toSQL(findUserByUsername, 'pg', {
  username: 'tjwebb'
})
// sql = select "username", from "user" where "name" = 'tjwebb'
```

##### Select Where In List Statement

```js
const sql = resolver.toSQL(queries.parameterizedWithListType, 'pg', {
  username: [ 'tjwebb', 'admin' ]
})
// sql = select "username" from "user" where "name" = ANY ('{"tjwebb","admin"}')
```

Table name is inferred to be `user` since the root field is `user`. The following
query would use the table name "foo":

```js
const findUserByUsername = `{
  foo (username: $username) {
    id
    username
  }
}`
```

[npm-image]: https://img.shields.io/npm/v/graphql-knex.svg?style=flat-square
[npm-url]: https://npmjs.org/package/graphql-knex
[ci-image]: https://img.shields.io/travis/tjwebb/graphql-knex/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/tjwebb/graphql-knex
[daviddm-image]: http://img.shields.io/david/tjwebb/graphql-knex.svg?style=flat-square
[daviddm-url]: https://david-dm.org/tjwebb/graphql-knex
[codeclimate-image]: https://img.shields.io/codeclimate/github/tjwebb/graphql-knex.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/tjwebb/graphql-knex

