'use strict'

const Knex = require('knex')
const assert = require('assert')
const graphql = require('graphql')
const lib = require('./lib')

exports.Resolver = class Resolver {
  constructor (knex) {
    this.knex = knex
  }

  getResolver () {
    const knex = this.knex

    return function (parent, args, options) {
      console.log('getObjectResolver parent', parent)
      console.log('getObjectResolver args', args)
      console.log('getObjectResolver options', options)

      return lib.QueryBuilder.buildQuery(options, knex)
        .then(result => {
          if (options.returnType instanceof graphql.GraphQLList) {
            return result
          }
          else {
            return result[0]
          }

        })
    }
  }
}

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
  toSQL (knex, args) {
    const sql = lib.QueryBuilder.buildSQL(this.ast, knex.select())
    return knex.raw(sql, args).toString()
  }

  getObjectResolver (knex) {
    return (_, args, options) => {
      console.log('getObjectResolver args', args)
      console.log('getObjectResolver options', options)
      return lib.QueryBuilder.buildQueryForOperation(options.operation, knex)
    }
  }
}
