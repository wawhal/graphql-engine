import { Dispatch } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import React from 'react';
import FilterQuery from '../../../../Common/FilterQuery/FilterQuery';
import {
  FilterRenderProp,
  makeValueFilter,
  makeRelationshipFilter,
} from '../../../../Common/FilterQuery/types';
import { etInvocationLogsTable } from '../utils';
import { ReduxState } from '../../../../../types';
import { makeOrderBy } from '../../../../Common/utils/v1QueryUtils';
import TableHeader from '../TableCommon/TableHeader';
import InvocationLogsTable from '../../Common/Components/InvocationLogsTable';
import { RAEvents } from '../../types';

const InvocationLogs = (props: Props) => {
  const { dispatch, triggerName, readOnlyMode } = props;

  const renderRows: FilterRenderProp = (
    rows,
    count,
    filterState,
    setFilterState,
    runQuery
  ) => (
    <InvocationLogsTable
      rows={rows}
      filterState={filterState}
      count={count}
      setFilterState={setFilterState}
      runQuery={runQuery}
      columns={[
        'id',
        'redeliver',
        'status',
        'event_id',
        // 'operation',
        'created_at',
      ]}
      identifier={triggerName}
      dispatch={dispatch as Dispatch<any>}
    />
  );

  return (
    <div>
      <TableHeader
        count={null}
        triggerName={triggerName}
        tabName="logs"
        readOnlyMode={readOnlyMode}
      />
      <br />
      <FilterQuery
        table={etInvocationLogsTable}
        dispatch={dispatch}
        render={renderRows}
        relationships={['event']}
        presets={{
          sorts: [makeOrderBy('created_at', 'desc')],
          filters: [
            makeRelationshipFilter(
              'event',
              makeValueFilter('trigger_name', '$eq', triggerName)
            ),
          ],
        }}
      />
    </div>
  );
};

type ExternalProps = RouteComponentProps<{ triggerName: string }, {}>;

const mapPropsToState = (state: ReduxState, ownProps: ExternalProps) => {
  return {
    triggerName: ownProps.params.triggerName,
    readOnlyMode: state.main.readOnlyMode,
  };
};

const connector = connect(mapPropsToState, (dispatch: Dispatch<RAEvents>) => ({
  dispatch,
}));

type InjectedProps = ConnectedProps<typeof connector>;

interface Props extends ExternalProps, InjectedProps {}

const ConnectedInvocationLogs = connector(InvocationLogs);
export default ConnectedInvocationLogs;
