'use strict'

const assert = require('assert')
const kinds = require('graphql').Kind
const graphql = require('graphql')

const QueryBuilder = module.exports = {
  /**
   * Construct SQL query from the GQL AST (graphql abstract syntax tree)
   */
  buildSelect (fields, query, options) {
    query = query.select()
    //return handleDocument(ast, query, options || { }).toString()
    console.log('buildSelect fields', fields)
    console.log('buildSelect options', options)
    fields.map(f => handleQuerySelectionSet(f, query, options.operation.variableDefinitions, options))

    return query
  }
}

/**
 * Visit Document Node (kind=Document)
 */
function handleDocument (ast, query, options) {
  delete ast.loc
  //console.log('handleDocument', ast)

  return ast.definitions
    .filter(def => def.kind == kinds.OPERATION_DEFINITION)
    .map(def => {
      return handleOperation(def, query, options)
    })[0]
}

function handleOperation (def, query, options) {
  delete def.loc
  //console.log('handleOperation', def)
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
  //console.log('handleQueryOperation', def)

  query = query.select()

  def.selectionSet.selections.map(e => handleQuerySelectionSet(e, query, def.variableDefinitions, options))

  return query
}

function handleMutationOperation (def, query) {

}

function handleSubscriptionOperation (def, query) {

}

function handleVariableDefinition (def, query) {
  delete def.loc
  //console.log('handleVariableDefinitions', def)
}

function handleQuerySelectionSet (field, query, vardefs, options) {
  delete field.loc
  //console.log('handleQuerySelectionSet', field)
  let objectName

  field.arguments.map(arg => handleArgument(arg, query, vardefs))
  field.selectionSet.selections.map(set => handleFieldSelectionSet(set, query))

  if (options.returnType instanceof graphql.GraphQLList) {
    objectName = options.returnType.ofType.name
  }
  else {
    objectName = options.returnType ? options.returnType.name : field.name.value
  }

  //console.log('objectName', objectName)

  query.from(objectName.toLowerCase())
}

function handleFieldSelectionSet (set, query) {
  delete set.loc
  //console.log('handleFieldSelectionSet', set)

  if (set.selectionSet) {
    //console.log('set.selectionSet', set.selectionSet)
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
  //console.log('handleArgument', arg)

  const vardef = findArgumentVariableDefinition(arg, vardefs)
  //console.log('vardef: ', vardef)
  const kind = vardef ? (vardef.type.name ? vardef.type.name.value : vardef.type.type.name.value) : 'String'

  //console.log('KIND: ', kind)

  const rhs = arg.value.name && arg.value.name.value || 'rhs'
  let clause

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

