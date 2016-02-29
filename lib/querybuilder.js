'use strict'

//const kinds = require('graphql').Kind
const graphql = require('graphql')

module.exports = {
  /**
   * Construct SQL query from the GQL AST (graphql abstract syntax tree)
   */
  buildSelect (fields, query, options) {
    //console.log('buildSelect options', options)
    query = query.select()
    fields.map(f => handleQuerySelectionSet(f, query, options.operation.variableDefinitions, options))

    return query
  }
}

/**
 * Visit Document Node (kind=Document)
function handleDocument (ast, query, options) {
  delete ast.loc

  return ast.definitions
    .filter(def => def.kind == kinds.OPERATION_DEFINITION)
    .map(def => {
      return handleOperation(def, query, options)
    })[0]
}

function handleOperation (def, query, options) {
  delete def.loc
  switch (def.operation) {
    case 'query':
      return handleQueryOperation(def, query, options)
    case 'mutation':
      return handleMutationOperation(def, query)
    case 'subscription':
      return handleSubscriptionOperation(def, query)
  }
}

function handleQueryOperation (def, query, options) {
  delete def.loc

  query = query.select()

  def.selectionSet.selections.map(e => handleQuerySelectionSet(e, query, def.variableDefinitions, options))

  return query
}
 */

/*
function handleMutationOperation (def, query) {

}

function handleSubscriptionOperation (def, query) {

}

function handleVariableDefinition (def, query) {
  delete def.loc
}
*/

function handleQuerySelectionSet (field, query, vardefs, options) {
  delete field.loc
  let objectName

  field.arguments.map(arg => handleArgument(arg, query, vardefs))
  field.selectionSet.selections.map(set => handleFieldSelectionSet(set, query))

  if (options.returnType instanceof graphql.GraphQLList) {
    objectName = options.returnType.ofType.name
  }
  else {
    objectName = options.returnType ? options.returnType.name : field.name.value
  }

  query.from(objectName.toLowerCase())
}

function handleFieldSelectionSet (set, query) {
  delete set.loc

  if (set.selectionSet) {
    set.selectionSet.selections.map(set => {
      handleFieldSelectionSet(set, query)
    })
  }
  else {
    query.select(set.name.value)
  }
}

/**
 *  name: $nameArg
 *  arg.name.value = name, arg.value.name.value = nameArg
 */
function handleArgument (arg, query, vardefs) {
  delete arg.loc

  const vardef = findArgumentVariableDefinition(arg, vardefs)
  const kind = vardef ? (vardef.type.name ? vardef.type.name.value : vardef.type.type.name.value) : 'String'

  const rhs = arg.value.name && arg.value.name.value || 'rhs'

  // http://facebook.github.io/graphql/#sec-Input-Values
  switch (kind) {
    case 'StringValue':
    case 'String':
    case 'NonNullType':
    case 'NamedType':
    case 'IntValue':
    case 'Int':
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
        query.whereRaw(`"${arg.name.value}" = ANY ( :${rhs} )`)
      }
      break
  }
}

function findArgumentVariableDefinition (arg, vardefs) {
  return (vardefs || [ ]).find(vardef => {
    return vardef.variable.name.value == arg.name.value
  })
}

