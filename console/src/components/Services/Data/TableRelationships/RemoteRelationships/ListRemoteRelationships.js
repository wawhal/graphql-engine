import React from 'react';
import styles from '../../TableModify/ModifyTable.scss';
import ExpandableEditor from '../../../../Common/Layout/ExpandableEditor/Editor';
import { getRemoteRelDef } from './remoteRelationshipUtils';

const ListRemoteRelationships = props => {
  const { dispatch, remoteRels } = props;
  return remoteRels.map(rel => {
    const { table_name, rel_def, rel_name } = rel;
    const collapsedLabel = () => (
      <div>
        <div className="container-fluid">
          <div className="row">
            <h5 className={styles.padd_bottom}>
              <b>{rel_name}</b>: {getRemoteRelDef(rel_def)}
              &nbsp;
            </h5>
          </div>
        </div>
      </div>
    );

    const expanded = () => {
      return (
        <div className={styles.add_mar_bottom_mid}>
          <b>{rel_name}</b>: {getRemoteRelDef(rel_def)}
          &nbsp;
        </div>
      );
    };

    const expandButtonText = 'View';

    const removeFunc = () => null;

    return (
      <ExpandableEditor
        removeFunc={removeFunc}
        editorExpanded={expanded}
        expandButtonText={expandButtonText}
        service="remote-relationship"
        property="view"
        collapsedLabel={collapsedLabel}
      />
    );
  });
};

export default ListRemoteRelationships;
