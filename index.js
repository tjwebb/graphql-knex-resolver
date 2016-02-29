'use strict'

const knex = require('knex')
const assert = require('assert')
const graphql = require('graphql')
const lib = require('./lib')

module.exports = class Resolver {

  constructor (knex) {
    this.knex = knex
  }

  relation (relation) {
    const knex = this.knex
    return (parent, args, options) => {
      const query = lib.QueryBuilder.buildSelect(options.fieldASTs, knex, options)
        .where({ [relation.foreignKey]: parent.id })

      /*
      console.log('relation args: ', args)
      console.log('relation options: ', options)
      */

      return knex.raw(query.toString(), args)
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

  object () {
    const knex = this.knex
    return (parent, args, options) => {
      const query = lib.QueryBuilder.buildSelect(options.fieldASTs, knex, options)

      /*
      console.log('object parent: ', parent)
      console.log('object args: ', args)
      console.log('object options: ', options)
      */

      return knex.raw(query.toString(), args)
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

  static toSQL(gql, dialect, args) {
    let ast
    try {
      ast = graphql.parse(gql)
    }
    catch (e) {
      throw e
    }

    assert.equal(ast.kind, 'Document', 'The GraphQL query must be a complete Document')

    const query = knex({ client: dialect })
    const doc = ast.definitions[0].selectionSet.selections
    const options = {
      operation: {
        variableDefinitions: ast.definitions[0].variableDefinitions
      }
    }

    const sql = lib.QueryBuilder.buildSelect(doc, query, options)
    return query.raw(sql.toString(), args || { }).toString()
  }
}
