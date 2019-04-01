import React from 'react';
import Button from '../../../Common/Button/Button';
import { dropInconsistentObjects } from './Actions';
const styles = require('./Metadata.scss');
const MetadataStatus = ({ dispatch, metaDataStyles, support, metadata }) => {

  // if (!support) {
    // return null;
  // }

  const inconsistentObjectsTable = () => {
    return (
      <table className={styles.metadataStatusTable} id="t01">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Definition</th>
            <th>Dependent objects</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>author</td>
            <td>object relationship</td>
            <td>article:author_id -> author:id</td>
            <td>some tree</td>
          </tr>
          <tr>
            <td>author</td>
            <td>object relationship</td>
            <td>article:author_id -> author:id</td>
            <td>some tree</td>
          </tr>
          <tr>
            <td>author</td>
            <td>object relationship</td>
            <td>article:author_id -> author:id</td>
            <td>some tree</td>
          </tr>
          <tr>
            <td>author</td>
            <td>object relationship</td>
            <td>article:author_id -> author:id</td>
            <td>some tree</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const verifyAndDropAll = () => {
    const isOk = window.confirm(
      'Are you sure? This will drop all the inconsistent parts of your metadata. This action is irreversible.'
    );
    if (isOk) {
      dispatch(dropInconsistentObjects());
    }
  };

  const content = () => {
    if (metadata.inconsistentObjects.length !== 0) {
      return (
        <div className={metaDataStyles.content_width}>
          GraphQL Engine metadata is consistent with Postgres
        </div>
      );
    }
    return (
      <div>
        <div className={metaDataStyles.content_width}>
          GraphQL Engine metadata is inconsistent with Postgres
        </div>
        <div>{inconsistentObjectsTable()}</div>
        <div>
          <Button
            color="red"
            size="sm"
            className={metaDataStyles.add_mar_top}
            onClick={verifyAndDropAll}
          >
            Drop all inconsistent objects
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={metaDataStyles.intro_note}>
      <h4>Metadata Status</h4>
      {content()}
    </div>
  );
};

export default MetadataStatus;
