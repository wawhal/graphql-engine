import React from 'react';
import FilterQuery from '../../../../Common/FilterQuery/FilterQuery';
import {
  FilterRenderProp,
  makeValueFilter,
  makeRelationshipFilter,
} from '../../../../Common/FilterQuery/Types';
import { stInvocationLogsTable } from '../utils';
import { makeOrderBy } from '../../../../Common/utils/v1QueryUtils';
import InvocationLogsTable from '../../Common/Components/InvocationLogsTable';
import { ScheduledTrigger } from '../../Types';

type Props = {
  currentTrigger?: ScheduledTrigger;
  dispatch: any;
};

const InvocationLogs: React.FC<Props> = props => {
  const { dispatch, currentTrigger } = props;
  const triggerName = currentTrigger ? currentTrigger.name : '';

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
      columns={['id', 'status', 'event_id', 'created_at']}
      identifier={triggerName}
    />
  );

  return (
    <div>
      <FilterQuery
        table={stInvocationLogsTable}
        dispatch={dispatch}
        render={renderRows}
        relationships={['cron_event']}
        presets={{
          sorts: [makeOrderBy('created_at', 'desc')],
          filters: [
            makeRelationshipFilter(
              'cron_event',
              makeValueFilter('trigger_name', '$eq', triggerName)
            ),
          ],
        }}
      />
    </div>
  );
};

export default InvocationLogs;
