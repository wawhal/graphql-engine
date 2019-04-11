import React from 'react';
import ExpandableEditor from '../../../../Common/Layout/ExpandableEditor/Editor';
import styles from '../../TableModify/ModifyTable.scss';
import {
  useRemoteSchemasEdit,
  //  useRemoteSchemas,
} from './remoteRelationshipUtils';

const schemaInfo = {
  hasura: [
    {
      ty: '__Type',
      name: '__type',
    },
    {
      ty: 'String!',
      name: '__typename',
      desc: 'The name of the current Object type at runtime',
    },
    {
      ty: '__Schema!',
      name: '__schema',
    },
  ],
  mah_schema: [
    {
      ty: 'Hello',
      name: 'hello',
      input: [{ name: 'some' }, { name: 'wohoo' }],
      fields: [],
      desc: 'Lolz',
    },
  ],
};

const AddRemoteRelationship = ({ tableSchema }) => {
  // const schemaInfo = useRemoteSchemas(dispatch).schemas || {};
  const {
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
  } = useRemoteSchemasEdit();
  const remoteSchemas = Object.keys(schemaInfo).filter(s => s !== 'hasura');
  let fields = [];
  if (schemaName && schemaInfo[schemaName]) {
    fields = schemaInfo[schemaName]
      ? schemaInfo[schemaName].map(f => f.name)
      : [];
  }
  let inputFields = [];
  if (fieldNamePath.length > 0) {
    const field = schemaInfo[schemaName].find(f => f.name === fieldNamePath[0]);
    if (field) {
      inputFields = field.input.map(f => f.name);
    }
  }

  const setFieldNameInFieldPath = (name, i = 0) => {
    if (i === 0) {
      setFieldNamePath([name]);
    } else {
      setFieldNamePath([...fieldNamePath.slice(0, i - 1), name]);
    }
  };

  const columns = tableSchema.columns.map(c => c.column_name);
  const expanded = () => {
    return (
      <div>
        <div className={`${styles.add_mar_bottom}`}>
          <div className={`${styles.add_mar_bottom_mid}`}>
            <b> Relationship name </b>
          </div>
          <div>
            <input
              className={`form-control ${styles.wd150px}`}
              type="text"
              placeholder="name"
              onChange={setRelName}
            />
          </div>
        </div>
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
              value={fieldNamePath[0] || ''}
              onChange={e => setFieldNameInFieldPath(e.target.value)}
            >
              <option key="empty_key" value="" disabled>
                -- field type --
              </option>
              {fields.map(t => {
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
          <div className={`row ${styles.add_mar_bottom_small}`}>
            <div className="col-md-3">Argument</div>
            <div className="col-md-6">Table column</div>
          </div>
          <div className={'row'}>
            <div className={`col-md-3`}>
              <select
                className={`form-control ${styles.wd150px}`}
                value={inputField || ''}
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
                value={tableColumn || ''}
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
        service="relationships"
        property="remote-add"
        collapseButtonText="Cancel"
        saveFunc={saveFunc}
      />
    </div>
  );
};

export default AddRemoteRelationship;
