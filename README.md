# graphql-knex-resolver

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

GraphQL Resolver built with Knex. Can be used to parse GraphQL ASTs into
SQL, and as a resolver method standin in a GraphQL schema. Supports whichever
databases are supported by Knex.

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
const resolver = new Resolver(knex)
```

### 2. Define the Schema

```js
// create the GraphQL schema using the resolver
const User = new gql.GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: gql.GraphQLID
    },
    username: {
      type: gql.GraphQLString
    },
    roles: {
      type: new gql.GraphQLList(Role),
      resolve: resolver.relation({
        foreignKey: 'user_id'
      })
    }
  })
})
const Role = new gql.GraphQLObjectType({
  name: 'Role',
  fields: () => ({
    id: {
      type: gql.GraphQLID
    },
    name: {
      type: gql.GraphQLString
    }
  })
})
const schema = new gql.GraphQLSchema({
  query: new gql.GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      user: {
        type: User,
        resolve: resolver.object(),
        args: {
          // ...
        }
      },
      role: {
        type: Role,
        resolve: resolver.object(),
        args: {
          // ...
        }
      }
    })
  })
})
```

### 3. Execute a Query

```js
const findUserByUsername = `{
  user (username: $username) {
    username
    roles {
      name
    }
  }
}`
return gql.graphql(userSchema, findUserByUsername, {
    username: "tjwebb"
  })
  .then(results => {
    console.log(results)
    // results = {
    //   data: {
    //     user: {
    //       username: 'tjwebb',
    //       roles: [
    //         { name: 'admin' }
    //       ]
    //     }
    //   }
    // }
  })
```

## API

### `new Resolver(knex)`

Prepare a new GraphQL Query Resolver

### `object()`

Return an object resolver

### `relation(options)`

Return a relation resolver.

### `static .toSQL(query, dialect, args)`

Translates a GraphQL query into SQL, irrespective of schema. Uses the
root field name as the table.

`dialect` is one of ([docs](http://knexjs.org/#Installation-node)):
- `pg`
- `mysql`
- `sqlite3`
- `oracle`
- `mariasql`

#### Example

Using the `findUserByUsername` query above:

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

[npm-image]: https://img.shields.io/npm/v/graphql-knex-resolver.svg?style=flat-square
[npm-url]: https://npmjs.org/package/graphql-knex-resolver
[ci-image]: https://img.shields.io/travis/tjwebb/graphql-knex-resolver/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/tjwebb/graphql-knex-resolver
[daviddm-image]: http://img.shields.io/david/tjwebb/graphql-knex-resolver.svg?style=flat-square
[daviddm-url]: https://david-dm.org/tjwebb/graphql-knex-resolver
[codeclimate-image]: https://img.shields.io/codeclimate/github/tjwebb/graphql-knex-resolver.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/tjwebb/graphql-knex-resolver

