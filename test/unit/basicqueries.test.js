'use strict'

const assert = require('assert')
const Resolver = require('../../')

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
    const kql = Resolver.toSQL(queries.omitPrefix, 'pg')
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person"')
  })

  it('should generate correct SQL for basic query with where clause', () => {
    const kql = Resolver.toSQL(queries.whereClause, 'pg')
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for basic parameterized query without prefix', () => {
    const kql = Resolver.toSQL(queries.omitPrefixParameterized, 'pg', {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for parameterized query', () => {
    const kql = Resolver.toSQL(queries.parameterized, 'pg', {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for parameterized query with String type', () => {
    const kql = Resolver.toSQL(queries.parameterizedWithStringType, 'pg', {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for parameterized query with Int type', () => {
    const kql = Resolver.toSQL(queries.parameterizedWithIntType, 'pg', {
      id: 1234
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "id" = \'1234\'')
  })


  it('should generate correct SQL for basic query with alias', () => {
    const kql = Resolver.toSQL(queries.basicAlias, 'pg', {
      nameArg: 'tjwebb'
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = \'tjwebb\'')
  })

  it('should generate correct SQL for basic query with IN list', () => {
    const kql = Resolver.toSQL(queries.parameterizedWithListType, 'pg', {
      nameArg: [ 'tjwebb', 'admin' ]
    })
    assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where "name" = ANY ( \'{"tjwebb","admin"}\' )')
  })

  after(() => {
    return knex.destroy()
  })
})

