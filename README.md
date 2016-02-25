# graphql-knex

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

GraphQL -> Knex.

## Install

```sh
$ npm install --save graphql-knex
```

## Usage

```js
const Query = require('graphql-knex').Query

// setup knex
const knex = require('knex')({
  client: 'pg',
  connection: {
    // ...
  }
})

// create a graphql query
const gqlQuery = new Query(`
  query favoriteColorQuery ($name: String!) {
    person(name: $name) {
      favoriteColor
    }
  }`
)

// transform the graphql query to a knex query
gqlQuery.toKnexQuery(knex, { name: 'tjwebb' })
  .then(person => {
    console.log(person.favoriteColor)
  })
```

## API

#### `new Query(query)`

Prepare a new GraphQL Query.

#### `.toKnexQuery(knex, params)`

Translate the GraphQL query to a [knex query object](http://knexjs.org/#Builder)
and [bind parameters](http://knexjs.org/#Raw-Bindings).

[npm-image]: https://img.shields.io/npm/v/graphql-knex.svg?style=flat-square
[npm-url]: https://npmjs.org/package/graphql-knex
[ci-image]: https://img.shields.io/travis/tjwebb/graphql-knex/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/tjwebb/graphql-knex
[daviddm-image]: http://img.shields.io/david/tjwebb/graphql-knex.svg?style=flat-square
[daviddm-url]: https://david-dm.org/tjwebb/graphql-knex
[codeclimate-image]: https://img.shields.io/codeclimate/github/tjwebb/graphql-knex.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/tjwebb/graphql-knex

