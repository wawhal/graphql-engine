import {
  loadAdminSecretState,
  clearAdminSecretState,
  CONSOLE_ADMIN_SECRET,
} from '../components/AppState';
import globals from '../Globals';
import Endpoints, { globalCookiePolicy } from '../Endpoints';

import requestAction from './requestActionPlain';

import { verifyLogin } from '../components/Login/Actions';
import { UPDATE_DATA_HEADERS } from '../components/Services/Data/DataActions';
import { changeRequestHeader } from '../components/Services/ApiExplorer/Actions';

import { SERVER_CONSOLE_MODE } from '../constants';

const checkValidity = adminSecret => {
  return dispatch => {
    const url = Endpoints.getSchema;
    const currentSchema = 'public';
    const headers = {
      'content-type': 'application/json',
      [`x-hasura-${globals.adminSecretLabel}`]: adminSecret,
    };
    const options = {
      credentials: globalCookiePolicy,
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        type: 'select',
        args: {
          table: {
            name: 'hdb_table',
            schema: 'hdb_catalog',
          },
          columns: ['table_schema'],
          where: { table_schema: currentSchema },
          limit: 1,
        },
      }),
    };
    return dispatch(requestAction(url, options));
  };
};

const validateLogin = ({ dispatch }) => {
  return (nextState, replaceState, cb) => {
    // care about admin secret only if it is set
    if (globals.isAdminSecretSet || globals.adminSecret) {

      const validationSuccessCallback = () => {
        if (nextState.location.pathname === '/login') {
          replaceState('/');
        }
        cb();
      }

      const validationFailureCallback = () => {
        clearAdminSecretState();
        if (nextState.location.pathname !== '/login') {
          replaceState('/login');
        }
        cb();
      };

      let adminSecret = globals.consoleMode === SERVER_CONSOLE_MODE ? loadAdminSecretState() : globals.adminSecret;

      verifyLogin({
        adminSecret,
        successCallback: validationSuccessCallback,
        errorCallback: validationFailureCallback,
        dispatch
      });

    } else {
      cb();
      return;
    }
  };
};

export default validateLogin;
