import React from 'react';
import AddRemoteRelationship from './AddRemoteRelationship'
import ListRemoteRelationships from './ListRemoteRelationships'
import styles from '../../TableModify/ModifyTable.scss';

const remoteRels = [
  {
    schema: 'schema1',
    rel: 'rel1',
  },
  {
    schema: 'schema2',
    rel: 'rel2'
  },
  {
    schema: 'schema2',
    rel: 'rel3'
  },
];

const RemoteRelationships = (props) => {
  // const remoteRels = props.remoteRels;
  const noRemoteRelsMessage = (
    <div className={styles.activeEdit}>
      <div className={`${styles.remove_margin_bottom} form-group`}>
        <label>
          {' '}
          You have not added any relationships with remote schemas
          {' '}
        </label>
      </div>
    </div>
  );

  const remoteRelList = <ListRemoteRelationships {...props}  remoteRels={remoteRels}/>

  const remoteRelContent = remoteRels.length > 0 ? remoteRelList : noRemoteRelsMessage;

  return (
    <div>
      {remoteRelContent}
      <AddRemoteRelationship {...props}/>
    </div>
  );
}

export default RemoteRelationships;