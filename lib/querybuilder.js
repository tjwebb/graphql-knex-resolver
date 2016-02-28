'use strict'

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

  def.selectionSet.selections.map(e => handleQuerySelectionSet(e, query, def.variableDefinitions))
}

function handleMutationOperation (def, query) {

}

function handleSubscriptionOperation (def, query) {

}

function handleVariableDefinition (def, query) {
  delete def.loc
  console.log('handleVariableDefinitions', def)
}

function handleQuerySelectionSet (field, query, vardefs) {
  delete field.loc
  console.log('handleQuerySelectionSet', field)

  field.arguments.map(arg => handleArgument(arg, query, vardefs))
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
function handleArgument (arg, query, vardefs) {
  delete arg.loc
  console.log('handleArgument', arg)

  const vardef = findArgumentVariableDefinition(arg, vardefs)
  console.log('vardef: ', vardef)
  const kind = vardef ? (vardef.type.name ? vardef.type.name.value : vardef.type.type.name.value) : 'String'

  console.log('KIND: ', kind)

  const rhs = arg.value.name && arg.value.name.value || 'rhs'
  let clause

  // http://facebook.github.io/graphql/#sec-Input-Values
  switch (kind) {
    case 'StringValue':
    case 'String':
    case 'NonNullType':
    case 'NamedType':
    case 'IntValue':
    case 'FloatValue':
    case 'BooleanValue':
      if (arg.value.value) {
        query.whereRaw('?? = ?', [ arg.name.value, arg.value.value ])
      }
      else {
        query.whereRaw(`"${arg.name.value}" = :${rhs}`)
      }
      break

    case 'List':
    case 'ListValue':
      if (arg.value.value) {
        query.whereRaw('?? in (?)', [ arg.name.value, arg.value.value ])
      }
      else {
        query.whereRaw(`"${arg.name.value}" in ( :${rhs} )`)
      }
      break
  }
}

function findArgumentVariableDefinition (arg, vardefs) {
  return (vardefs || [ ]).find(vardef => {
    return vardef.variable.name.value == arg.name.value
  })
}

