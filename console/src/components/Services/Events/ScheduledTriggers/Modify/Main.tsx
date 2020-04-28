import React from 'react';
import STContainer from '../../Containers/ScheduledTriggerContainer';
import { Triggers } from '../../Types';
import { ReduxState } from '../../../../../Types';
import Modify from './Modify';

type ModifyProps = {
  allTriggers: Triggers;
  params?: {
    triggerName: string;
  };
  dispatch: any;
};

const ModifyContainer = ({ dispatch, allTriggers, params }: ModifyProps) => {
  const triggerName = params ? params.triggerName : '';
  return (
    <STContainer
      tabName="modify"
      dispatch={dispatch}
      triggerName={triggerName}
      allTriggers={allTriggers}
    >
      <Modify dispatch={dispatch} />
    </STContainer>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    allTriggers: state.events.triggers,
  };
};

export default (connect: any) => connect(mapStateToProps)(ModifyContainer);
