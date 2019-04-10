import React, { useState, useEffect } from 'react';
import ExpandableEditor from '../../../Common/Layout/ExpandableEditor/Editor';
import Endpoints from '../../../../Endpoints';
import requestAction from '../../../../utils/requestAction';
import styles from '../TableModify/ModifyTable.scss';

const loadRemoteSchemasQuery = {
  type: 'get_remote_schema_info',
  args: {},
};

const loadRemoteSchemas = cb => {
  return (dispatch, getState) => {
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
        cb({
          error: error,
        });
      }
    );
  };
};

const useRemoteSchemas = (dispatch, reset) => {
  const [remoteSchemas, setRemoteSchemas] = useState({});
  useEffect(() => {
    dispatch(loadRemoteSchemas, r => setRemoteSchemas(r));
  }, []);
  return remoteSchemas;
};

const useRemoteSchemasEdit = () => {
  const [rsState, setRsState] = useState({
    schemaName: '',
    fieldName: '',
    relFrom: '',
    relTo: '',
  });

  const { schemaName, fieldName, inputField, tableColumn } = rsState;

  const setSchemaName = e => {
    setRsState({
      ...rsState,
      schemaName: e.target.value,
    });
  };
  const setFieldName = e => {
    setRsState({
      ...rsState,
      fieldName: e.target.value,
    });
  };
  const setInputField = e => {
    setRsState({
      ...rsState,
      relFrom: e.target.value,
    });
  };
  const setTableColumn = e => {
    setRsState({
      ...rsState,
      relTo: e.target.value,
    });
  };
  return {
    schemaName,
    setSchemaName,
    fieldName,
    setFieldName,
    inputField,
    setInputField,
    tableColumn,
    setTableColumn,
  };
};

const AddRemoteRelationship = ({ dispatch }) => {
  const schemaInfo = useRemoteSchemas(dispatch).schemas || {};
  const {
    schemaName,
    setSchemaName,
    fieldName,
    setFieldName,
    inputField,
    setInputField,
    tableColumn,
    setTableColumn,
  } = useRemoteSchemasEdit();
  const remoteSchemas = Object.keys(schemaInfo).filter(s => s !== 'hasura');
  const types = ['type1', 'type2'];
  const inputFields = ['if1', 'if2'];
  const columns = ['col1', 'col2'];
  const expanded = () => {
    return (
      <div>
        <div className={`${styles.add_mar_bottom}`}>
          <div className={`${styles.add_mar_bottom_mid}`}>
            <b> Remote schema </b>
          </div>
          <div>
            <select
              className={`form-control ${styles.wd150px}`}
              defaultValue=""
              onChange={setSchemaName}
            >
              <option key="empty_key" value="" disabled>
                -- remote schema --
              </option>
              {remoteSchemas.map(rs => {
                return (
                  <option key={rs} value={rs}>
                    {rs}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className={`${styles.add_mar_bottom}`}>
          <div className={`${styles.add_mar_bottom_mid}`}>
            <b>Field name</b>
          </div>
          <div>
            <select
              className={`form-control ${styles.wd150px}`}
              defaultValue=""
              onChange={setFieldName}
            >
              <option key="empty_key" value="" disabled>
                -- field type --
              </option>
              {types.map(t => {
                return (
                  <option key={t} value={t}>
                    {t}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className={`${styles.add_mar_bottom}`}>
          <div className={`${styles.add_mar_bottom_mid}`}>
            <b>Mapping</b>
          </div>
          <div className={'row'}>
            <div className={`col-md-3 ${styles.add_mar_right}`}>
              <select
                className={`form-control ${styles.wd150px}`}
                defaultValue=""
                onChange={setInputField}
              >
                <option key="select_type" value="" disabled>
                  -- input field --
                </option>
                {inputFields.map(inpF => {
                  return (
                    <option key={inpF} value={inpF}>
                      {inpF}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={'col-md-6'}>
              <select
                className={`form-control ${styles.wd150px}`}
                defaultValue=""
                onChange={setTableColumn}
              >
                <option key="select_type" value="">
                  -- table column --
                </option>
                {columns.map(c => {
                  return (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const expandButtonText = '+ Add a remote relationship';
  const saveFunc = () => null;

  return (
    <div>
      <ExpandableEditor
        expandButtonText={expandButtonText}
        editorExpanded={expanded}
        collapseButtonText="Cancel"
        saveFunc={saveFunc}
      />
    </div>
  );
};

export default AddRemoteRelationship;
