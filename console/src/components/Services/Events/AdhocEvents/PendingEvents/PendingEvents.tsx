import React from 'react';
import FilterQuery from '../../../../Common/FilterQuery/FilterQuery';
import {
  FilterRenderProp,
  makeValueFilter,
} from '../../../../Common/FilterQuery/Types';
import { adhocEventsTable } from '../utils';
import EventsTable from '../../Common/Components/EventsTable';
import { makeOrderBy } from '../../../../Common/utils/v1QueryUtils';

type Props = {
  dispatch: any;
};

const PendingEvents: React.FC<Props> = props => {
  const { dispatch } = props;

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
      columns={[
        'id',
        'status',
        'scheduled_time',
        'created_at',
        'tries',
        'next_retry_at',
      ]}
      identifier="adhoc-events-processed"
    />
  );

  return (
    <div>
      <FilterQuery
        table={adhocEventsTable}
        dispatch={dispatch}
        render={renderRows}
        presets={{
          filters: [makeValueFilter('status', '$eq', 'scheduled')],
          sorts: [makeOrderBy('scheduled_time', 'desc')],
        }}
        relationships={['scheduled_event_logs']}
      />
    </div>
  );
};

export default PendingEvents;
