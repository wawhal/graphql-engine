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
              <b>{rel_name}</b>
              &nbsp;
            </h5>
          </div>
        </div>
      </div>
    );

    const expandedLabel = () => {
      return (
        <div>
          <div className="container-fluid">
            <div className="row">
              <h5 className={styles.padd_bottom}>
                <b>{rel_name}</b>
                &nbsp;
              </h5>
            </div>
          </div>
        </div>
      );
    };

    const expanded = () => {
      return (
        <div className={styles.add_mar_bottom_mid}>
          {getRemoteRelDef(rel_def)}
          &nbsp;
        </div>
      );
    };

    const expandButtonText = 'View';

    return (
      <ExpandableEditor
        editorExpanded={expanded}
        expandButtonText={expandButtonText}
        expandedLabel={expandedLabel}
        service="remote-relationship"
        property="view"
        collapsedLabel={collapsedLabel}
        toggled={false}
      />
    );
  });
};

export default ListRemoteRelationships;
