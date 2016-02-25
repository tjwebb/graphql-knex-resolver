'use strict'

const util = require('util')
const assert = require('assert')
const Query = require('../../').Query

describe('Query', () => {
  describe('#constructor', () => {
    const gqlA = `
      query favoriteColorQuery ($name: String!) {
        person(name: $name) {
          favoriteColor
        }
      }`
    it('should set ast for valid gql query', () => {
      const query = new Query(gqlA)
      console.log(util.inspect(query.ast, { depth: 4 }))
    })
  })
})
