const { camelize } = require('inflection');
const { buildClientSchema, isScalarType, isEnumType, isInputObjectType, parse: sdlParse } = require('graphql');
const { wrapTypename, getAstTypeMetadata } = require('../../../shared/utils/wrappingTypeUtils')
const { inbuiltTypes } = require('../../../shared/utils/hasuraCustomTypeUtils')
const {
  getMutationType,
  getTypeFields,
  getHasuraMutationMetadata,
  getUnderlyingType,
  getFieldArgs
} = require('../../../shared/utils/graphqlSchemaUtils');

const deriveMutationString = (mutationString, introspectionSchema, actionName=null) => {

  // parse mutation string
  let mutationAst;
  try {
    mutationAst = sdlParse(mutationString)
  } catch (e) {
    throw Error('invalid SDL')
  }

  // throw error if the AST is empty  
  if (!mutationAst.definitions.length) {
    throw Error('could not find any operation')
  }
  if (mutationAst.definitions[0].kind !== 'OperationDefinition') {
    throw Error('could not find any operation in the given mutation')
  }

  // filter schema specific fields from the operation
  mutationAst.definitions[0].selectionSet.selections = mutationAst.definitions[0].selectionSet.selections.filter(s => {
    return s.name.value.indexOf('__') !== 0
  });

  // throw error if no mutation is being made
  if (!mutationAst.definitions[0].selectionSet.selections.length) {
    throw Error('the given mutation must ask for one root field')
  }

  // get the mutation variables
  const variables = mutationAst.definitions[0].variableDefinitions;

  // get mutation name
  const mutationDefinition = mutationAst.definitions[0].selectionSet.selections[0];
  const mutationName = mutationDefinition.name.value;

  // get action name if not provided
  if (!actionName) {
    actionName = mutationAst.definitions[0].name.value || camelize(`${mutationName}_${derived}`)
  }

  // function to prefix typename with the action name
  const prefixTypename = (typename) => {
    return camelize(`${actionName}_${typename}`);
  }

  // parse the introspection schema
  const clientSchema = buildClientSchema(introspectionSchema);
  const allHasuraTypes = clientSchema._typeMap;
  const mutationType = clientSchema._mutationType;

  const actionArguments = [];
  const newTypes = {}

  const handleType = (type, typename) => {
    if (newTypes[typename]) { return; }
    const newType = {};
    newType.name = typename;

    if (isScalarType(type)) {
      if (!inbuiltTypes[type.name]) {
        newType.kind = 'scalar';
        newTypes[typename] = newType;
      }
      return;
    }

    if (isEnumType(type)) {
      newType.kind = 'enum',
      newType.values = type._values.map(v => ({ value: v.value, description: v.description}));
      newTypes[typename] = newType;
      return;
    }

    if (isInputObjectType(type)) {
      newType.kind = 'input_object';
      newType.fields = [];
      const typeFields = getTypeFields(type);
      newTypes[typename] = true;
      Object.values(typeFields).forEach(tf => {
        const _tf = { name: tf.name };
        const { type: underLyingType, wraps: fieldTypeWraps } = getUnderlyingType(tf.type);
        const subFields = getTypeFields(underLyingType);
        if (
          Object.keys(subFields).length === 2 &&
          Object.keys(subFields)[0] === 'data' &&
          Object.keys(subFields)[1] === 'on_conflict'
        ) {
          const { type: relType, wraps } = getUnderlyingType(Object.values(subFields)[0].type);
          _tf.type = wrapTypename(prefixTypename(relType), wraps);
          handleType(relType, prefixTypename(relType.name));
        } else {
          if (inbuiltTypes[underLyingType.name]) {
            _tf.type = wrapTypename(underLyingType.name, fieldTypeWraps);
          } else {
            _tf.type = wrapTypename(prefixTypename(underLyingType.name), fieldTypeWraps);
          }

          handleType(underLyingType, prefixTypename(underLyingType.name))
        }
        newType.fields.push(_tf);
      })
      newTypes[typename] = newType;
      return;
    }
  }

  variables.forEach(v => {
    const generatedArg = {
      name: v.variable.name.value,
    }
    const argTypeMetadata = getAstTypeMetadata(v.type);
    generatedArg.typename = argTypeMetadata.typename;
    if (!inbuiltTypes[generatedArg.typename]) {
      const argTypename = prefixTypename(argTypeMetadata.typename);
      generatedArg.type = wrapTypename(argTypename, argTypeMetadata.stack);
      const typeInSchema = allHasuraTypes[argTypeMetadata.typename];
      handleType(typeInSchema, argTypename)
    }
    actionArguments.push(generatedArg)
  })

  const refMutationOutputType = getUnderlyingType(getTypeFields(mutationType)[mutationName].type).type;
  const actionOutputTypename = prefixTypename(refMutationOutputType.name);
  const actionOutputType = {
    name: actionOutputTypename,
    kind: 'object',
    fields: []
  };

  Object.values(getTypeFields(refMutationOutputType)).forEach(outputTypeField => {
    const fieldTypeMetadata = getUnderlyingType(outputTypeField.type);
    if (isScalarType(fieldTypeMetadata.type)) {
      actionOutputType.fields.push({
        name: outputTypeField.name,
        type: wrapTypename(fieldTypeMetadata.type.name, fieldTypeMetadata.wraps)
      })
    }
  })

  newTypes[actionOutputTypename] = actionOutputType;

  return {
    types: Object.values(newTypes),
    action: {
      name: actionName,
      arguments: actionArguments,
      output_type: actionOutputTypename
    }
  }

}

module.exports = deriveMutationString;
