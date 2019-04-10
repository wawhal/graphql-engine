import React from 'react';
import ExpandableEditor from '../../../Common/Layout/ExpandableEditor/Editor';
import styles from '../TableModify/ModifyTable.scss';

const AddRemoteRelationship = () => {
  const remoteSchemas = ['schema1', 'schema2'];
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
