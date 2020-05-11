import React from 'react';
import STContainer from '../../Containers/ScheduledTriggerContainer';
import { Triggers } from '../../Types';
import { MapReduxToProps, ComponentReduxConnector } from '../../../../../Types';
import PendingEvents from './PendingEvents';

type Props = {
  allTriggers: Triggers;
  params?: {
    triggerName: string;
  };
  dispatch: any;
  readOnlyMode: boolean;
};

const PendingEventsContainer: React.FC<Props> = props => {
  const { dispatch, allTriggers, params } = props;
  const triggerName = params ? params.triggerName : '';
  return (
    <STContainer
      tabName="pending"
      dispatch={dispatch}
      triggerName={triggerName}
      allTriggers={allTriggers}
    >
      <PendingEvents dispatch={dispatch} />
    </STContainer>
  );
};

const mapStateToProps: MapReduxToProps = state => {
  return {
    allTriggers: state.events.triggers,
    readOnlyMode: state.main.readOnlyMode,
  };
};

const connector: ComponentReduxConnector = connect =>
  connect(mapStateToProps)(PendingEventsContainer);

export default connector;
