import React from 'react';
import { Header, defaultHeader } from '../../../../Common/Headers/Headers';
import { ScheduleTriggerType, URLType, URLConf, RetryConf } from '../../Types';

export const defaultCronExpr = '2 * * * *';

export type LocalScheduledTriggerState = {
  name: string;
  webhook: URLConf;
  schedule: {
    type: ScheduleTriggerType;
    value?: string;
  };
  payload: string;
  headers: Array<Header>;
  loading: boolean;
  retryConf: RetryConf;
  showScheduleModal?: boolean;
};

const defaultState: LocalScheduledTriggerState = {
  name: '',
  webhook: {
    type: 'static',
    value: '',
  },
  schedule: {
    type: 'cron',
    value: defaultCronExpr,
  },
  payload: '',
  headers: [defaultHeader],
  loading: false,
  showScheduleModal: false,
  retryConf: {
    timeout_sec: 60,
    num_retries: 0,
    interval_sec: 10,
    tolerance_sec: 21600,
  },
};

export const useScheduledTriggerAdd = (
  initState?: LocalScheduledTriggerState
) => {
  const [state, setState] = React.useState(initState || defaultState);

  return {
    state,
    setState: {
      name: (name: string) => {
        setState(s => ({ ...s, name }));
      },
      setWebhookType: (type: URLType) => {
        setState(s => ({ ...s, webhook: { type, value: '' } }));
      },
      setWebhookValue: (value: string) => {
        setState(s => ({ ...s, webhook: { ...s.webhook, value } }));
      },
      scheduleType: (type: ScheduleTriggerType) => {
        setState(s => ({
          ...s,
          schedule: {
            type,
            value: '',
          },
        }));
      },
      scheduleValue: (scheduleValue: string) => {
        setState(s => ({
          ...s,
          schedule: {
            ...s.schedule,
            value: scheduleValue,
          },
        }));
      },
      payload: (jsonString: string) => {
        setState(s => ({
          ...s,
          payload: jsonString,
        }));
      },
      headers: (headers: Array<Header>) => {
        setState(s => ({
          ...s,
          headers,
        }));
      },
      loading: (isLoading: boolean) => {
        setState(s => ({
          ...s,
          loading: isLoading,
        }));
      },
      toggleScheduleModal: () => {
        setState(s => ({
          ...s,
          showScheduleModal: !s.showScheduleModal,
        }));
      },
      retryConf: (r: RetryConf) => {
        setState(s => ({
          ...s,
          retryConf: r,
        }));
      },
      bulk: setState,
    },
  };
};