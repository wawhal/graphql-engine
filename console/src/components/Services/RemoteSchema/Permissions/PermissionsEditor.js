import React, { useEffect } from 'react';
import styles from '../RemoteSchema.scss';
import { getTypeFields } from '../graphqlUtils';
import GraphQLType from './GraphQLType';
import ExpandableEditor from '../../../Common/Layout/ExpandableEditor/Editor';
import {
  setPermissionRole,
  setPermissionTypes,
  createRemoteSchemaPermission,
} from './Actions';

const PermissionsEditor = ({
  editState,
  objectTypes,
  nonObjectTypes,
  rootTypes,
  isLast,
  dispatch,
}) => {

  if (!editState.isEditing) {
    return null;
  }

  const allowedTypes = Object.keys(editState.allowedTypes).map(at => {
    const fieldToggleCallback = (fieldName, isChecked) => {
      const newAllowedTypes = JSON.parse(
        JSON.stringify(editState.allowedTypes)
      );
      newAllowedTypes[at][fieldName].isChecked = isChecked;
      if (!newAllowedTypes[at][fieldName].isScalar) {
        if (!newAllowedTypes[newAllowedTypes[at][fieldName].typeName]) {
          const childFields = getTypeFields(
            newAllowedTypes[at][fieldName].typeName,
            objectTypes,
            nonObjectTypes
          );
          newAllowedTypes[
            newAllowedTypes[at][fieldName].typeName
          ] = childFields;
        }
      }
      dispatch(setPermissionTypes(newAllowedTypes));
    };

    const isRootType = ['query', 'mutation', 'subscription'].some(
      rt => rootTypes[rt] === at
    );

    const typeRemovalCallback = () => {
      const newAllowedTypes = JSON.parse(
        JSON.stringify(editState.allowedTypes)
      );
      delete newAllowedTypes[at];
      Object.keys(editState.allowedTypes).forEach(_at => {
        Object.keys(editState.allowedTypes[_at]).forEach(field => {
          if (editState.allowedTypes[_at][field].typeName === at) {
            newAllowedTypes[_at][field].isChecked = false;
          }
        });
      });
      dispatch(setPermissionTypes(newAllowedTypes));
    };

    return (
      <div className={styles.add_mar_bottom_mid} key={at} id={at}>
        <GraphQLType
          typeName={at}
          fields={editState.allowedTypes[at]}
          fieldToggleCallback={fieldToggleCallback}
          isRootType={isRootType}
          isTypeExpanded={!isRootType}
          typeRemovalCallback={typeRemovalCallback}
        />
      </div>
    );
  });

  const permSelector = (
    <div>
      <div className={`${styles.add_mar_bottom_small}`}>
        <b>Allowed Types:</b>
      </div>
      <div
        className={`${styles.remoteSchemaPermSelector} ${styles.add_padding}`}
      >
        {allowedTypes}
      </div>
    </div>
  );

  return (
    <div>
      {permSelector}
    </div>
  );
};

export default PermissionsEditor;
