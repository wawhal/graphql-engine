import React from 'react';
import Helmet from 'react-helmet';
import { useScheduledTrigger, LocalScheduledTriggerState } from '../state';
import styles from '../ScheduledTriggers.scss';
import Button from '../../../../Common/Button/Button';
import ScheduledTriggerForm from '../../Common/Components/ScheduledTriggerForm';
import { getReactHelmetTitle } from '../../../../Common/utils/reactUtils';
import { addScheduledTrigger } from '../../ServerIO';
import { EVENTS_SERVICE_HEADING, CRON_TRIGGER } from '../../constants';
import { MapReduxToProps, ComponentReduxConnector } from '../../../../../Types';

type Props = {
  dispatch: any;
  initState?: LocalScheduledTriggerState;
};

const Main: React.FC<Props> = props => {
  const { dispatch, initState } = props;
  const { state, setState } = useScheduledTrigger(initState);

  const callback = () => setState.loading(false);
  const onSave = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setState.loading(true);
    dispatch(addScheduledTrigger(state, callback, callback));
  };

  return (
    <div className={styles.add_mar_bottom}>
      <Helmet
        title={getReactHelmetTitle(
          `Create ${CRON_TRIGGER}`,
          EVENTS_SERVICE_HEADING
        )}
      />
      <div className={`${styles.heading_text} ${styles.add_mar_bottom}`}>
        Create a cron trigger
      </div>
      <ScheduledTriggerForm state={state} setState={setState} />
      <Button
        onClick={onSave}
        color="yellow"
        size="sm"
        disabled={state.loading}
        className={`${styles.add_mar_right}`}
      >
        {state.loading ? 'Creating...' : 'Create'}
      </Button>
    </div>
  );
};

const mapStateToProps: MapReduxToProps = state => {
  return {
    ...state.events,
  };
};

const connector: ComponentReduxConnector = (connect: any) =>
  connect(mapStateToProps)(Main);

export default connector;
