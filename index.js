'use strict'

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
  }

  /**
   * Construct a knex query
   */
  toKnexQuery (knex, args) {
    const sql = lib.QueryBuilder.buildSQL(this.ast, knex)
    return knex.raw(sql, args)
  }
}
