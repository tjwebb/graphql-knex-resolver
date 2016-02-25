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
    this.ast = graphql.parse(gql)

    assert.equal(this.ast.kind, 'Document', 'The GraphQL query must be a complete Document')
  }

  /**
   * Construct a knex query
   */
  toKnexQuery (knex, args) {
    const sql = lib.QueryBuilder.buildSQL(this.ast, knex)
    return knex.raw(sql, args)
  }
}
