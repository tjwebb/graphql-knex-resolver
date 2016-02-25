module.exports = {
  /**
   * Construct SQL query from the GQL AST (graphql abstract syntax tree)
   */
  buildSQL (ast, knex) {
    return buildKnexQuery(ast, knex).toString()
  }
}

function buildKnexQuery (ast, knex) {

}
