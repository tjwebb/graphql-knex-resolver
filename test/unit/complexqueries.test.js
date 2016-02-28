'use strict'

const util = require('util')
const assert = require('assert')
const gql = require('graphql')
const lib = require('../../lib')
const Resolver = require('../../').Resolver

describe('Schema-Dependent GraphQL Queries', () => {
  const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: 'testdb.sqlite3'
    },
    debug: true
  })

  let resolver = new Resolver(knex).getResolver()

  before(done => {
    return knex.schema.dropTableIfExists('user')
      .then(() => {
        return knex.schema.createTableIfNotExists('user', table => {
          table.increments()
          table.string('username')
          table.timestamps()
        })
      })
      .then(() => {
        return knex.insert([
          { username: 'tjwebb' },
          { username: 'admin' },
          { username: 'graphy' },
          { username: 'trails' }
        ]).into('user')
      })
      .then(() => done())
  })

  const roleObject = new gql.GraphQLObjectType({
    name: 'Role',
    fields: () => ({
      name: {
        type: gql.GraphQLString
      }
    })
  })

  const userObject = new gql.GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: {
        type: gql.GraphQLID
      },
      username: {
        type: gql.GraphQLString
      },
      roles: {
        type: new gql.GraphQLList(roleObject)
      }
    })
  })

  const userQuery = new gql.GraphQLObjectType({
    name: 'UserQuery',
    fields: () => ({
      userList: {
        type: new gql.GraphQLList(userObject),
        resolve: resolver
      },
      user: {
        type: userObject,
        args: {
          username: {
            type: gql.GraphQLString
          },
          id: {
            type: gql.GraphQLID
          }
        },
        resolve: resolver
      }
    })
  })

  const userSchema = new gql.GraphQLSchema({
    query: userQuery
  })

  const queries = {
    user: `{
      user (username: "tjwebb") {
        username
      }
    }`,
    userList: `{
      userList {
        id
        username
      }
    }`
  }

  it('single user query should return single user', () => {
    return gql.graphql(userSchema, queries.user).then(results => {
      console.log('gql results', results)
      assert.equal(results.data.user.username, 'tjwebb')
    })
  })
  it('list user query should return many users', () => {
    return gql.graphql(userSchema, queries.userList).then(results => {
      console.log('gql results', results)
      assert.equal(results.data.userList.length, 4)
    })
  })

  after(() => {
    return knex.destroy()
  })
})

