'use strict'

const util = require('util')
const assert = require('assert')
const Query = require('../../').Query

describe('Query', () => {
  const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './testdb.sqlite'
    }
  })

  const gqlA = `
    query favoriteColorQuery ($name: String!) {
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

  describe('#toKnexQuery', () => {
    describe('SQL correctness', () => {
      it('should generate correct SQL for basic query', () => {
        const query = new Query(gqlA)
        const kql = query.toKnexQuery(knex, {
          nameArg: 'tjwebb'
        })

        assert.equal(kql.toString(), 'select "name", "favoriteColor" from "person" where name = "tjwebb"')
      })
    })

    describe('results correctness', () => {

    })
  })

  after(() => {
    return knex.destroy()
  })
})
