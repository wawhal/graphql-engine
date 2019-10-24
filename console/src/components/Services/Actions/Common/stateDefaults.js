export const defaultArg = {
  name: '',
  type: '',
  description: '',
};

export const defaultField = {
  name: '',
  type: '',
};

export const defaultScalarType = {
  name: '',
  kind: 'scalar',
};

export const defaultObjectType = {
  name: '',
  kind: 'object',
  fields: [{ ...defaultField }],
  arguments: [{ ...defaultArg }],
};

export const defaultInputObjectType = {
  name: '',
  kind: 'input_object',
  fields: [{ ...defaultField }],
};

export const defaultEnumType = {
  name: '',
  kind: 'enum',
  value_definition: {
    values: [
      {
        value: '',
        description: '',
      },
    ],
    is_deprecated: false,
  },
};

export const gqlInbuiltTypes = [
  {
    name: 'Int',
    isInbuilt: true,
  },
  {
    name: 'String',
    isInbuilt: true,
  },
  {
    name: 'Float',
    isInbuilt: true,
  },
  {
    name: 'Boolean',
    isInbuilt: true,
  },
  {
    name: 'ID',
    isInbuilt: true,
  },
];
