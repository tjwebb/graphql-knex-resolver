'use strict'

const util = require('util')
const assert = require('assert')
const Query = require('../../').Query

describe('Basic/Parameterized GraphQL Queries', () => {
  let knex
  before(() => {
    knex = require('knex')({ client: 'pg' })
  })

  const queries = {
    basic: `query favoriteColorQuery {
      person(name: "tjwebb") {
        name
        favoriteColor
      }
    }`,
    whereClause: `query favoriteColorQuery {
      person(name: "tjwebb") {
        name
        favoriteColor
      }
    }`,
    parameterized: `query favoriteColorQuery {
      person(name: $nameArg) {
        name
        favoriteColor
      }
    }`,
    parameterizedWithStringType: `query favoriteColorQuery ($name: String!) {
      person(name: $nameArg) {
        name
        favoriteColor
      }
    }`,
    parameterizedWithIntType: `query favoriteColorQuery ($id: Int!) {
      person(id: $id) {
        name
        favoriteColor
      }
    }`,
    parameterizedWithListType: `query favoriteColorQuery ($name: List) {
      person(name: $nameArg) {
        name
        favoriteColor
      }
    }`,
    omitPrefixParameterized: `{
      person(name: $nameArg) {
        name
        favoriteColor
      }
    }`,
    omitPrefix: `{
      person {
        name
        favoriteColor
      }
    }`,

    basicAlias: `{
      tjwebb: person (name: $nameArg) {
        name
        favoriteColor
      }
    }`
  }

  it('should generate correct SQL for basic query without prefix', () => {
    const query = new Query(queries.omitPrefix)
    const kql = query.toSQL(knex)
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person"')
  })

  it('should generate correct SQL for basic query with where clause', () => {
    const query = new Query(queries.whereClause)
    const kql = query.toSQL(knex)
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for basic parameterized query without prefix', () => {
    const query = new Query(queries.omitPrefixParameterized)
    const kql = query.toSQL(knex, {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for parameterized query', () => {
    const query = new Query(queries.parameterized)
    const kql = query.toSQL(knex, {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for parameterized query with String type', () => {
    const query = new Query(queries.parameterizedWithStringType)
    const kql = query.toSQL(knex, {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for parameterized query with Int type', () => {
    const query = new Query(queries.parameterizedWithIntType)
    const kql = query.toSQL(knex, {
      id: 1234
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "id" = \'1234\'')
  })


  it('should generate correct SQL for basic query with alias', () => {
    const query = new Query(queries.basicAlias)
    const kql = query.toSQL(knex, {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for basic query with IN list', () => {
    const query = new Query(queries.parameterizedWithListType)
    const kql = query.toSQL(knex, {
      nameArg: [ 'tjwebb', 'admin' ]
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = ANY ( \'{"tjwebb","admin"}\' )')
  })

  after(() => {
    return knex.destroy()
  })
})

