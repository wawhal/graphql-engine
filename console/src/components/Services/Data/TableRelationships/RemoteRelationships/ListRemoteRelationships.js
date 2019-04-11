import React from 'react';
import styles from '../../TableModify/ModifyTable.scss';
import ExpandableEditor from '../../../../Common/Layout/ExpandableEditor/Editor';

const ListRemoteRelationships = (props) => {
  const { dispatch, remoteRels } = props;

  return props.remoteRels.map(rel => {

    const collapsedLabel = () => (
      <div>
        <div className="container-fluid">
          <div className="row">
            <h5 className={styles.padd_bottom}>
              {rel.schema}
              &nbsp;
            </h5>
          </div>
        </div>
      </div>
    ); 

    const expanded = () => {
      return (
        <div>
          {rel.rel}
        </div>
      )
    }

    const expandButtonText = "View"; 

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
    )

  })
}

export default ListRemoteRelationships;