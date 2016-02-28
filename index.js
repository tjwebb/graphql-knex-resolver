'use strict'

const Knex = require('knex')
const assert = require('assert')
const graphql = require('graphql')
const lib = require('./lib')

module.exports = {

  getResolver (knex) {
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
  },

  toSQL(gql, dialect, args) {
    let ast
    try {
      ast = graphql.parse(gql)
    }
    catch (e) {
      throw e
    }

    assert.equal(ast.kind, 'Document', 'The GraphQL query must be a complete Document')

    const knex = Knex({ client: dialect })

    const sql = lib.QueryBuilder.buildSQL(ast, knex)
    return knex.raw(sql, args || { }).toString()
  }
}
