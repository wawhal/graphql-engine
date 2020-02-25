import { parse as sdlParse } from 'graphql/language/parser';
import { getAstTypeMetadata, wrapTypename } from './wrappingTypeUtils';
import {
  reformCustomTypes,
  parseCustomTypes,
  hydrateTypeRelationships,
} from './hasuraCustomTypeUtils';

const getUnsupporedTypesError = unsupportedType => {
  return `Encountered ${unsupportedType} type while parsing the type definition. Please use only object, scalar, enum and input types.`;
};

const getAstEntityDescription = def => {
  return def.description ? def.description.value.trim() : null;
};

const getEntityDescriptionSdl = def => {
  let entityDescription = def.description;
  entityDescription = entityDescription ? `""" ${entityDescription} """ ` : '';
  return entityDescription;
};

export const getTypeFromAstDef = astDef => {
  const handleScalar = def => {
    return {
      name: def.name.value,
      description: getAstEntityDescription(def),
      kind: 'scalar',
    };
  };

  const handleEnum = def => {
    return {
      name: def.name.value,
      kind: 'enum',
      description: getAstEntityDescription(def),
      values: def.values.map(v => ({
        value: v.name.value,
        description: getAstEntityDescription(v),
      })),
    };
  };

  const handleInputObject = def => {
    return {
      name: def.name.value,
      kind: 'input_object',
      description: getAstEntityDescription(def),
      fields: def.fields.map(f => {
        const fieldTypeMetadata = getAstTypeMetadata(f.type);
        return {
          name: f.name.value,
          type: wrapTypename(
            fieldTypeMetadata.typename,
            fieldTypeMetadata.stack
          ),
          description: getAstEntityDescription(f),
        };
      }),
    };
  };

  const handleObject = def => {
    return {
      name: def.name.value,
      kind: 'object',
      description: getAstEntityDescription(def),
      fields: def.fields.map(f => {
        const fieldTypeMetadata = getAstTypeMetadata(f.type);
        return {
          name: f.name.value,
          type: wrapTypename(
            fieldTypeMetadata.typename,
            fieldTypeMetadata.stack
          ),
          description: getAstEntityDescription(f),
        };
      }),
    };
  };

  switch (astDef.kind) {
    case 'ScalarTypeDefinition':
      return handleScalar(astDef);
    case 'EnumTypeDefinition':
      return handleEnum(astDef);
    case 'InputObjectTypeDefinition':
      return handleInputObject(astDef);
    case 'ObjectTypeDefinition':
      return handleObject(astDef);
    case 'SchemaDefinition':
      return {
        error: getUnsupporedTypesError('schema definition'),
      };
    case 'InterfaceTypeDefinition':
      return {
        error: getUnsupporedTypesError('interface'),
      };
    case 'UnionTypeDefinition':
      return {
        error: getUnsupporedTypesError('union'),
      };
    default:
      return;
  }
};

export const getTypesFromSdl = sdl => {
  const typeDefinition = {
    types: [],
    error: null,
  };

  if (!sdl || (sdl && sdl.trim() === '')) {
    return typeDefinition;
  }

  const schemaAst = sdlParse(sdl);

  for (let i = schemaAst.definitions.length - 1; i >= 0; i--) {
    const typeDef = getTypeFromAstDef(schemaAst.definitions[i]);
    if (typeDef.error) {
      typeDefinition.error = typeDef.error;
      break;
    } else {
      typeDefinition.types.push(typeDef);
    }
  }

  return typeDefinition;
};

const getActionFromMutationAstDef = astDef => {
  const definition = {
    name: '',
    arguments: [],
    outputType: '',
    comment: getAstEntityDescription(astDef),
    error: null,
  };

  definition.name = astDef.name.value;
  const outputTypeMetadata = getAstTypeMetadata(astDef.type);
  definition.outputType = wrapTypename(
    outputTypeMetadata.typename,
    outputTypeMetadata.stack
  );
  definition.arguments = astDef.arguments.map(a => {
    const argTypeMetadata = getAstTypeMetadata(a.type);
    return {
      name: a.name.value,
      type: wrapTypename(argTypeMetadata.typename, argTypeMetadata.stack),
      description: getAstEntityDescription(a),
    };
  });

  return definition;
};

export const getActionDefinitionFromSdl = sdl => {
  const schemaAst = sdlParse(sdl);
  const definition = {
    name: '',
    arguments: [],
    outputType: '',
    comment: '',
    error: null,
  };
  if (schemaAst.definitions.length > 1) {
    definition.error = 'Action must be defined under a single "Mutation" type';
    return definition;
  }

  const sdlDef = schemaAst.definitions[0];

  if (sdlDef.name.value !== 'Mutation') {
    definition.error = 'Action must be defined under a "Mutation" type';
    return definition;
  }

  if (sdlDef.fields.length > 1) {
    const definedActions = sdlDef.fields
      .map(f => `"${f.name.value}"`)
      .join(', ');
    definition.error = `You have defined multiple actions (${definedActions}). Please define only one.`;
    return definition;
  }

  return {
    ...definition,
    ...getActionFromMutationAstDef(sdlDef.fields[0]),
  };
};

const getArgumentsSdl = args => {
  if (!args.length) return '';

  const argsSdl = args.map(a => {
    return `    ${getEntityDescriptionSdl(a)}${a.name}: ${a.type}`;
  });

  return `(\n${argsSdl.join('\n')}\n  )`;
};

const getFieldsSdl = fields => {
  const fieldsSdl = fields.map(f => {
    const argSdl = f.arguments ? getArgumentsSdl(f.arguments) : '';
    return `  ${getEntityDescriptionSdl(f)}${f.name} ${argSdl}: ${f.type}`;
  });
  return fieldsSdl.join('\n');
};

const getObjectTypeSdl = type => {
  return `${getEntityDescriptionSdl(type)}type ${type.name} {
${getFieldsSdl(type.fields)}
}\n\n`;
};

const getInputTypeSdl = type => {
  return `${getEntityDescriptionSdl(type)}input ${type.name} {
${getFieldsSdl(type.fields)}
}\n\n`;
};

const getScalarTypeSdl = type => {
  return `${getEntityDescriptionSdl(type)}scalar ${type.name}\n\n`;
};

const getEnumTypeSdl = type => {
  const enumValuesSdl = type.values.map(v => {
    return `  ${getEntityDescriptionSdl(v)}${v.value}`;
  });
  return `${getEntityDescriptionSdl(type)}enum ${type.name} {
${enumValuesSdl.join('\n')}
}\n\n`;
};

const getTypeSdl = type => {
  switch (type.kind) {
    case 'scalar':
      return getScalarTypeSdl(type);
    case 'enum':
      return getEnumTypeSdl(type);
    case 'input_object':
      return getInputTypeSdl(type);
    case 'object':
      return getObjectTypeSdl(type);
    default:
      return '';
  }
};

export const getTypesSdl = _types => {
  let types = _types;
  if (types.constructor.name !== 'Array') {
    types = parseCustomTypes(_types);
  }
  let sdl = '';
  types.forEach(t => {
    sdl += getTypeSdl(t);
  });
  return sdl;
};

export const getActionDefinitionSdl = (name, args, outputType, description) => {
  return getObjectTypeSdl({
    name: 'Mutation',
    fields: [
      {
        name,
        arguments: args,
        type: outputType,
        description,
      },
    ],
  });
};

export const getServerTypesFromSdl = (sdl, existingTypes) => {
  const { types: typesFromSdl, error } = getTypesFromSdl(sdl);
  return {
    types: reformCustomTypes(
      hydrateTypeRelationships(typesFromSdl, parseCustomTypes(existingTypes))
    ),
    error,
  };
};

export const getAllActionsFromSdl = sdl => {
  const ast = sdlParse(sdl);
  ast.definitions = ast.definitions.filter(d => d.name.value === 'Mutation');
  const actions = [];

  ast.definitions.forEach(d => {
    d.fields.forEach(f => {
      const action = getActionFromMutationAstDef(f);
      actions.push({
        name: action.name,
        definition: {
          arguments: action.arguments,
          output_type: action.outputType,
        },
      });
    });
  });
  return actions;
};

export const getAllTypesFromSdl = sdl => {
  const ast = sdlParse(sdl);
  ast.definitions = ast.definitions.filter(d => d.name.value !== 'Mutation');
  const types = ast.definitions.map(d => {
    return getTypeFromAstDef(d);
  });
  return reformCustomTypes(types);
};

export const getSdlComplete = (allActions, allTypes) => {
  let sdl = '';
  allActions.forEach(a => {
    sdl += `extend ${getActionDefinitionSdl(
      a.action_name,
      a.action_defn.arguments,
      a.action_defn.output_type,
      a.comment
    )}`;
  });

  sdl += getTypesSdl(allTypes);
  return sdl;
};
