import defaultState from './state';

const SET_ACTION_PERMISSIONS = 'Actions/Permissions/SET_ACTION_PERMISSIONS';

export const setActionPermissiosn = perms => ({
  type: SET_ACTION_PERMISSIONS,
  perms,
});

const PERMISSIONS_OPEN_EDIT = 'Actions/PERMISSIONS_OPEN_EDIT';
export const permOpenEdit = (role, isNewRole, isNewPerm) => ({
  type: PERMISSIONS_OPEN_EDIT,
  role,
  isNewRole,
  isNewPerm,
});

const PERMISSIONS_CLOSE_EDIT = 'Actions/PERMISSIONS_CLOSE_EDIT';
export const permCloseEdit = () => ({
  type: PERMISSIONS_CLOSE_EDIT,
});

const SET_ROLE_NAME = 'Actions/SET_ROLE_NAME';
export const permSetRoleName = rolename => ({
  type: SET_ROLE_NAME,
  rolename,
});

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case PERMISSIONS_OPEN_EDIT:
      return {
        ...state,
        isEditing: true,
        permissionEdit: {
          ...state.permissionEdit,
          isNewRole: !!action.isNewRole,
          isNewPerm: !!action.isNewPerm,
          role: action.role,
          filter: {},
        },
      };
    case PERMISSIONS_CLOSE_EDIT:
      return {
        ...state,
        isEditing: false,
        permissionEdit: {
          ...state.permissionEdit,
          isNewRole: false,
          isNewPerm: false,
          role: action.role,
          filter: {},
        },
      };
    case SET_ROLE_NAME:
      return {
        ...state,
        permissionEdit: {
          ...state.permissionEdit,
          newRole: action.rolename,
        },
      };
    default:
      return state;
  }
};

export default reducer;
