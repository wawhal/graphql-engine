import { useState, useEffect } from 'react';
import Endpoints from '../../../../../Endpoints';
import requestAction from '../../../../../utils/requestAction';
import {
  showSuccessNotification,
  showErrorNotification,
} from '../../Notification';
import gqlPattern, { gqlRelErrorNotif } from '../../Common/GraphQLValidation';
import { LOAD_REMOTE_RELATIONSHIPS } from '../Actions';

const genLoadRemoteRelationshipsQuery = tableName => {
  return {
    type: 'select',
    args: {
      table: {
        schema: 'hdb_catalog',
        name: 'hdb_remote_relationship',
      },
      columns: ['table_name', 'rel_name', 'rel_def'],
      where: {
        table_name: tableName,
      },
    },
  };
};

const loadRemoteSchemasQuery = {
  type: 'get_remote_schema_info',
  args: {},
};

const generateCreateRemoteRelationshipQuery = (
  name,
  tableName,
  fieldName,
  inputField,
  columnName
) => {
  return {
    type: 'create_remote_relationship',
    args: {
      name,
      table: tableName,
      using: {
        table: tableName,
        remote_field: fieldName,
        input_field: inputField,
        column: columnName,
      },
    },
  };
};

export const loadRemoteRelationships = tableName => {
  return dispatch => {
    return dispatch(
      requestAction(Endpoints.query, {
        method: 'POST',
        body: JSON.stringify(genLoadRemoteRelationshipsQuery(tableName)),
      })
    ).then(
      data => {
        dispatch({
          type: LOAD_REMOTE_RELATIONSHIPS,
          data,
        });
      },
      error => {
        console.error(error);
      }
    );
  };
};

const loadRemoteSchemas = cb => {
  return dispatch => {
    return dispatch(
      requestAction(Endpoints.query, {
        method: 'POST',
        body: JSON.stringify(loadRemoteSchemasQuery),
      })
    ).then(
      data => {
        cb({
          schemas: data,
        });
      },
      error => {
        console.log(error);
        cb({
          error: error,
        });
      }
    );
  };
};

export const useRemoteSchemas = dispatch => {
  const [remoteSchemas, setRemoteSchemas] = useState({});
  useEffect(() => {
    dispatch(loadRemoteSchemas(r => setRemoteSchemas(r)));
  }, []);
  return remoteSchemas;
};

export const useRemoteSchemasEdit = () => {
  const defaultState = {
    relName: '',
    schemaName: '',
    fieldNamePath: [],
    inputField: '',
    tableColumn: '',
  };
  const [rsState, setRsState] = useState(defaultState);

  const {
    relName,
    schemaName,
    fieldNamePath,
    inputField,
    tableColumn,
  } = rsState;
  const setRelName = e => {
    setRsState({
      ...rsState,
      relName: e.target.value,
    });
  };
  const setSchemaName = e => {
    setRsState({
      ...defaultState,
      relName: rsState.relName,
      schemaName: e.target.value,
    });
  };
  const setFieldNamePath = list => {
    setRsState({
      ...rsState,
      inputField: '',
      tableColumn: '',
      fieldNamePath: list,
    });
  };
  const setInputField = e => {
    setRsState({
      ...rsState,
      inputField: e.target.value,
    });
  };
  const setTableColumn = e => {
    setRsState({
      ...rsState,
      tableColumn: e.target.value,
    });
  };

  const reset = () => {
    setRsState({
      ...defaultState,
    });
  };

  return {
    relName,
    setRelName,
    schemaName,
    setSchemaName,
    fieldNamePath,
    setFieldNamePath,
    inputField,
    setInputField,
    tableColumn,
    setTableColumn,
    reset,
  };
};

export const saveRemoteRelQuery = (
  name,
  tableName,
  fieldName,
  inputField,
  columnName,
  successCb,
  errorCb
) => {
  return dispatch => {
    if (!name) {
      return dispatch(
        showErrorNotification('Relationship name cannot be empty')
      );
    }
    if (!gqlPattern.test(name)) {
      return dispatch(
        showErrorNotification(
          gqlRelErrorNotif[0],
          gqlRelErrorNotif[1],
          gqlRelErrorNotif[2],
          gqlRelErrorNotif[3]
        )
      );
    }
    if (!fieldName) {
      return dispatch(showErrorNotification('Please select a field'));
    }
    if (!inputField) {
      return dispatch(showErrorNotification('Please select an input field'));
    }
    if (!columnName) {
      return dispatch(showErrorNotification('Please select a table column'));
    }
    dispatch(
      requestAction(Endpoints.query, {
        method: 'POST',
        body: JSON.stringify(
          generateCreateRemoteRelationshipQuery(
            name,
            tableName,
            fieldName,
            inputField,
            columnName
          )
        ),
      })
    ).then(
      data => {
        if (successCb) {
          successCb();
        }
        dispatch(loadRemoteRelationships(tableName));
        dispatch(showSuccessNotification('Remote relationship created'));
      },
      err => {
        console.error(err);
        if (errorCb) {
          errorCb();
        }
        dispatch(showErrorNotification('Failed creating remote relationship'));
      }
    );
  };
};

export const getRemoteRelDef = relDef => {
  const { table, column, input_field, remote_field } = relDef;
  return ` ${table} . ${column} → ${remote_field} ( ${input_field} )`;
};
