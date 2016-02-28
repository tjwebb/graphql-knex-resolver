'use strict'

const assert = require('assert')
const graphql = require('graphql')
const lib = require('./lib')

exports.Query = class Query {

  /**
   * Construct a new gql query
   *
   * @param gql String
   */
  constructor (gql) {
    try {
      this.ast = graphql.parse(gql)
    }
    catch (e) {
      this.ast = 'select 1'
      throw e
    }

    assert.equal(this.ast.kind, 'Document', 'The GraphQL query must be a complete Document')
  }

  /**
   * Construct a knex query
   */
  toKnexQuery (knex, args) {
    const sql = lib.QueryBuilder.buildSQL(this.ast, knex.select())
    return knex.raw(sql, args)
  }
}
