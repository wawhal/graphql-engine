import defaultState from './state';

const SET_ACTION_PERMISSIONS = 'Actions/Permissions/SET_ACTION_PERMISSIONS';

export const setActionPermissiosn = perms => ({
  type: SET_ACTION_PERMISSIONS,
  perms,
});

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_ACTION_PERMISSIONS:
      console.log('Set permission types');
      return;
    default:
      return state;
  }
};

export default reducer;
