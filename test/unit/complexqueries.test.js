'use strict'

const util = require('util')
const assert = require('assert')
const gql = require('graphql')
const lib = require('../../lib')
const Resolver = require('../../')

describe('Schema-Dependent GraphQL Queries', () => {
  const knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: 'testdb.sqlite3'
    },
    debug: true
  })

  const resolver = new Resolver(knex)

  before(done => {
    return knex.schema.dropTableIfExists('user')
      .then(() => {
        return knex.schema.dropTableIfExists('role')
      })
      .then(() => {
        return knex.schema.createTableIfNotExists('user', table => {
          table.increments()
          table.string('username')
          table.timestamps()
        })
      })
      .then(() => {
        return knex.schema.createTableIfNotExists('role', table => {
          table.increments()
          table.string('name')
          table.integer('user')
          table.foreign('user').references('user.id')
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
      .then(() => {
        return knex.insert([
          { name: 'root', user: 1 },
          { name: 'test', user: 1 },
          { name: 'othergroup', user: 2 },
          { name: 'managers', user: 3 }
        ]).into('role')
      })
      .then(() => done())
  })

  const roleObject = new gql.GraphQLObjectType({
    name: 'Role',
    fields: () => ({
      id: {
        type: gql.GraphQLID
      },
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
        type: new gql.GraphQLList(roleObject),
        resolve: resolver.relation({
          foreignKey: 'user'
        })
      }
    })
  })

  const userQuery = new gql.GraphQLObjectType({
    name: 'UserQuery',
    fields: () => ({
      userList: {
        type: new gql.GraphQLList(userObject),
        resolve: resolver.object()
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
        resolve: resolver.object()
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
    }`,
    userWithRoles: `query userWithRoles ($username: String) {
      user (username: $username) {
        id
        username
        roles {
          id
          name
        }
      }
    }`
  }

  it('single user query should return single user', () => {
    return gql.graphql(userSchema, queries.user).then(results => {
      console.log('gql results', results.data)
      assert.equal(results.data.user.username, 'tjwebb')
    })
  })

  it('list user query should return many users', () => {
    return gql.graphql(userSchema, queries.userList).then(results => {
      console.log('gql results', results.data)
      assert.equal(results.data.userList.length, 4)
    })
  })

  it('user query with roles should return roles sublist', () => {
    return gql.graphql(userSchema, queries.userWithRoles, null, { username: 'tjwebb' }).then(results => {
      console.log('gql results', results.data.user)
      assert.equal(results.data.user.username, 'tjwebb')
      assert.equal(results.data.user.roles.length, 2)
    })
  })

  after(() => {
    return knex.destroy()
  })
})

