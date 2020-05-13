import React from 'react';
import { Header, defaultHeader } from '../../../Common/Headers/Headers';
import { RetryConf } from '../Types';
import { Nullable } from '../../../Common/utils/tsUtils';

export const defaultCronExpr = '* * * * *';

export type LocalScheduledTriggerState = {
  name: string;
  webhook: string;
  schedule: string;
  payload: string;
  headers: Array<Header>;
  loading: boolean;
  retryConf: RetryConf;
  includeInMetadata: boolean;
  comment: Nullable<string>;
};

const defaultState: LocalScheduledTriggerState = {
  name: '',
  webhook: '',
  schedule: '',
  payload: '',
  headers: [defaultHeader],
  loading: false,
  retryConf: {
    timeout_sec: 60,
    num_retries: 0,
    interval_sec: 10,
    tolerance_sec: 21600,
  },
  includeInMetadata: true,
  comment: null,
};

export const useScheduledTrigger = (initState?: LocalScheduledTriggerState) => {
  const [state, setState] = React.useState(initState || defaultState);

  return {
    state,
    setState: {
      name: (name: string) => {
        setState(s => ({ ...s, name }));
      },
      webhook: (webhook: string) => {
        setState(s => ({ ...s, webhook }));
      },
      schedule: (schedule: string) => {
        setState(s => ({
          ...s,
          schedule,
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
      retryConf: (r: RetryConf) => {
        setState(s => ({
          ...s,
          retryConf: r,
        }));
      },
      comment: (comment: string) => {
        setState(s => ({
          ...s,
          comment,
        }));
      },
      includeInMetadata: (include: boolean) => {
        setState(s => ({
          ...s,
          includeInMetadata: include,
        }));
      },
      bulk: setState,
    },
  };
};
