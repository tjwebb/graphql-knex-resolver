'use strict'

const Knex = require('knex')
const assert = require('assert')
const graphql = require('graphql')
const lib = require('./lib')

module.exports = class Resolver {

  constructor (knex) {
    this.knex = knex
  }

  relation (relation) {
    return (parent, args, options) => {
      console.log('getRelationResolver parent', parent)
      console.log('getRelationResolver args', args)
      //console.log('getRelationResolver options', options)
      console.log('getRelationResolver fieldASTs', options.fieldASTs)

      const doc = options.fieldASTs
      const query = lib.QueryBuilder.buildSelect(doc, this.knex, options)
        .where({ [relation.foreignKey]: parent.id })

      return this.knex.raw(query.toString(), args)
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
    return (parent, args, options) => {
      console.log('getObjectResolver parent', parent)
      console.log('getObjectResolver args', args)
      //console.log('getObjectResolver options', options)
      //console.log('getObjectResolver fieldASTs', options.fieldASTs)

      const doc = options.fieldASTs
      const query = lib.QueryBuilder.buildSelect(doc, this.knex, options)

      console.log('object query', query.toString())

      return this.knex.raw(query.toString(), args)
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

    const knex = Knex({ client: dialect })

    const sql = lib.QueryBuilder.buildSQL(ast, knex)
    return knex.raw(sql, args || { }).toString()
  }
}
