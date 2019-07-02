export const remoteSchemaCache = {};

export const cacheGraphQLSchema = (schemaName, graphqlSchema) => {
  remoteSchemaCache[schemaName] = graphqlSchema;
};
