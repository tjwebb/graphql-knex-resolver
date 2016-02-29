'use strict'

const assert = require('assert')
const Query = require('../../').Query

describe.skip('Query', () => {
  let knex

  before(() => {
    knex = require('knex')({
      client: 'sqlite3',
      useNullAsDefault: true
    })
  })
  const gqlA = `
    query favoriteColorQuery ($nameArg: String!) {
      person(name: $nameArg) {
        name
        favoriteColor
      }
    }`

  describe('#constructor', () => {
    it('should set ast for valid gql query', () => {
      const query = new Query(gqlA)
      assert(query.ast)
    })
  })

  describe('#toSQL', () => {
    describe('SQL correctness', () => {
      it('should generate correct SQL for basic query', () => {
        const query = new Query(gqlA)
        const kql = query.toSQL(knex, {
          nameArg: 'tjwebb'
        })

        assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where name = \'tjwebb\'')
      })
    })
  })

  after(() => {
    return knex.destroy()
  })
})
