const assert = require('assert')
const kinds = require('graphql').Kind

module.exports = {
  /**
   * Construct SQL query from the GQL AST (graphql abstract syntax tree)
   */
  buildSQL (ast, query) {
    handleDocument(ast, query)

    return query.toString()
  }
}

/**
 * Visit Document Node (kind=Document)
 */
function handleDocument (ast, query) {
  delete ast.loc
  console.log('handleDocument', ast)
  ast.definitions
    .filter(def => def.kind == kinds.OPERATION_DEFINITION)
    .map(def => {
      handleDefinition(def, query)
    })
}

function handleDefinition (def, query) {
  delete def.loc
  console.log('handleDefinition', def)
  switch (def.operation) {
    case 'query':
      return handleQueryOperation(def, query)
    case 'mutation':
      return handleMutationOperation(def, query)
    case 'subscription':
      return handleSubscriptionOperation(def, query)
  }
}

function handleQueryOperation (def, query) {
  delete def.loc
  console.log('handleQueryOperation', def)

  const variableDefinitions = def.variableDefinitions.map(e => handleVariableDefinition(e, query))
  const selectionSet = def.selectionSet.selections.map(e => handleQuerySelectionSet(e, query))

}

function handleMutationOperation (def, query) {

}

function handleSubscriptionOperation (def, query) {

}

function handleVariableDefinition (def, query) {
  delete def.loc
  console.log('handleVariableDefinitions', def)
}

function handleQuerySelectionSet (field, query) {
  delete field.loc
  console.log('handleQuerySelectionSet', field)

  field.arguments.map(arg => handleArgument(arg, query))
  field.selectionSet.selections.map(set => handleFieldSelectionSet(set, query))

  query.from(field.name.value)
}

function handleFieldSelectionSet (set, query) {
  delete set.loc
  console.log('handleFieldSelectionSet', set)

  query.select(set.name.value)
}

/**
 *  name: $nameArg
 *  arg.name.value = name, arg.value.name.value = nameArg
 */
function handleArgument (arg, query) {
  delete arg.loc
  console.log('handleArgument', arg)

  query.whereRaw(`${arg.name.value} = :${arg.value.name.value}:`)
}

