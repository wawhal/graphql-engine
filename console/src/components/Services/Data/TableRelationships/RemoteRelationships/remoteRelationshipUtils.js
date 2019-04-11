import { useState, useEffect } from 'react';
import Endpoints from '../../../../../Endpoints';
import requestAction from '../../../../../utils/requestAction';

const loadRemoteSchemasQuery = {
  type: 'get_remote_schema_info',
  args: {},
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

  const { relName, schemaName, fieldNamePath, inputField, tableColumn } = rsState;
  const setRelName = e => {
    setRsState({
      ...rsState,
      relName: e.target.value
    })
  };
  const setSchemaName = e => {
    setRsState({
      ...defaultState,
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
      ...defaultState
    });
  }

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
    reset
  };
};
