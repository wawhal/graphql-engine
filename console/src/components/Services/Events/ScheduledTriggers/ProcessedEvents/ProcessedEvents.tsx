import React from 'react';
import FilterQuery from '../../../../Common/FilterQuery/FilterQuery';
import {
  FilterRenderProp,
  makeValueFilter,
} from '../../../../Common/FilterQuery/Types';
import { stEventsTable } from '../utils';
import { ScheduledTrigger } from '../../Types';
import EventsTable from '../../Common/Components/EventsTable';
import { makeOrderBy } from '../../../../Common/utils/v1QueryUtils';

type Props = {
  dispatch: any;
  currentTrigger?: ScheduledTrigger;
};

const ProcessedEvents: React.FC<Props> = props => {
  const { dispatch, currentTrigger } = props;

  const triggerName = currentTrigger ? currentTrigger.name : '';

  const renderRows: FilterRenderProp = (
    rows,
    count,
    filterState,
    setFilterState,
    runQuery
  ) => (
    <EventsTable
      rows={rows}
      count={count}
      filterState={filterState}
      setFilterState={setFilterState}
      runQuery={runQuery}
      columns={['id', 'status', 'scheduled_time', 'created_at', 'tries']}
      identifier={triggerName}
    />
  );

  return (
    <div>
      <FilterQuery
        table={stEventsTable}
        dispatch={dispatch}
        render={renderRows}
        presets={{
          filters: [
            makeValueFilter('trigger_name', '$eq', triggerName),
            makeValueFilter('status', '$ne', 'scheduled'),
          ],
          sorts: [makeOrderBy('created_at', 'desc')],
        }}
        relationships={['cron_event_logs']}
      />
    </div>
  );
};

export default ProcessedEvents;
