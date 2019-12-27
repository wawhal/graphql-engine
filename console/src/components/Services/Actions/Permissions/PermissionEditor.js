import React from 'react';
import Button from '../../../Common/Button/Button';
import styles from '../../../Common/Permissions/PermissionStyles.scss';
import { saveActionPermission, removeActionPermission } from '../ServerIO';
import { permCloseEdit } from './reducer';

const PermissionEditor = ({
  permissionEdit,
  isEditing,
  isFetching,
  dispatch,
}) => {
  if (!isEditing) return null;

  const permRole = permissionEdit.newRole || permissionEdit.role;

  let permText = (
    <div>
      This action is allowed for role: <b>{permRole}</b>
      <br />
      Remove the permission for this role if you want to disallow it
    </div>
  );
  if (permissionEdit.isNewPerm) {
    permText = (
      <div>
        Click save to allow this action for role: <b>{permRole}</b>
      </div>
    );
  }

  const buttonStyle = styles.add_mar_right;

  const closeEditor = () => {
    dispatch(permCloseEdit());
  };

  const getSaveButton = () => {
    const saveFunc = () => {
      dispatch(saveActionPermission(closeEditor));
    };
    return (
      <Button
        onClick={saveFunc}
        color="yellow"
        className={buttonStyle}
        disabled={isFetching}
      >
        Save
      </Button>
    );
  };

  const getRemoveButton = () => {
    if (permissionEdit.isNewRole || permissionEdit.isNewPerm) return;
    const removeFunc = () => {
      dispatch(removeActionPermission(closeEditor));
    };
    return (
      <Button
        onClick={removeFunc}
        color="red"
        className={buttonStyle}
        disabled={isFetching}
      >
        Remove
      </Button>
    );
  };

  const getCancelButton = () => {
    return (
      <Button color="white" className={buttonStyle} onClick={closeEditor}>
        Cancel
      </Button>
    );
  };

  return (
    <div className={styles.activeEdit}>
      <div className={styles.add_mar_bottom}>{permText}</div>
      {getSaveButton()}
      {getRemoveButton()}
      {getCancelButton()}
    </div>
  );
};

export default PermissionEditor;