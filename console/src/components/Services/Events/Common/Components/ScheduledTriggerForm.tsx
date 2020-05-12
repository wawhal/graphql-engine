import React from 'react';
import DateTimePicker from 'react-datetime';
import { Moment } from 'moment';
import './ReactDateTime.css';
import {
  useScheduledTrigger,
  defaultCronExpr,
} from '../../ScheduledTriggers/state';
import { ScheduleTriggerType } from '../../Types';
import AceEditor from '../../../../Common/AceEditor/BaseEditor';
import { getEventTargetValue } from '../../../../Common/utils/jsUtils';
import styles from '../../Events.scss';
import Tooltip from '../../../../Common/Tooltip/Tooltip';
import Headers from '../../../../Common/Headers/Headers';
import RetryConf from './RetryConfEditor';

type Props = ReturnType<typeof useScheduledTrigger>;

const Form: React.FC<Props> = props => {
  const { state, setState } = props;

  const { name, webhook, schedule, payload, headers } = state;

  const setName = (e: React.BaseSyntheticEvent) =>
    setState.name(getEventTargetValue(e));
  const setWebhookValue = (e: React.BaseSyntheticEvent) =>
    setState.setWebhookValue(getEventTargetValue(e));
  const setTriggerType = (e: React.BaseSyntheticEvent) => {
    const type: ScheduleTriggerType = getEventTargetValue(e);
    switch (type) {
      case 'adhoc': {
        setState.schedule({
          type,
          value: new Date(),
        });
        break;
      }
      case 'cron': {
        setState.schedule({
          type,
          value: defaultCronExpr,
        });
        break;
      }
      default:
        break;
    }
  };
  const setScheduleValue = (e: React.BaseSyntheticEvent) =>
    setState.schedule({
      ...schedule,
      value: getEventTargetValue(e),
    });

  const setAdhocTriggerValue = (value: string | Moment) => {
    if (typeof value === 'string') {
      setState.schedule({
        type: 'adhoc',
        value: new Date(value),
      });
    } else {
      setState.schedule({
        type: 'adhoc',
        value: value.toDate(),
      });
    }
  };

  const sectionize = (section: JSX.Element) => (
    <div className={styles.add_mar_bottom}>{section}</div>
  );

  const getNameInput = () =>
    sectionize(
      <React.Fragment>
        <h2
          className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
        >
          Name
          <Tooltip
            id="trigger-name"
            message="Name of the trigger"
            className={styles.add_mar_left_mid}
          />
        </h2>
        <input
          type="text"
          placeholder="name"
          className={`form-control ${styles.inputWidthLarge}`}
          value={name}
          onChange={setName}
        />
      </React.Fragment>
    );

  const getWebhookInput = () =>
    sectionize(
      <React.Fragment>
        <h2
          className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
        >
          Webhook
          <Tooltip
            id="trigger-webhook"
            message="The HTTP endpoint that must be triggered"
            className={styles.add_mar_left_mid}
          />
        </h2>
        <input
          type="text"
          placeholder="webhook"
          className={`form-control ${styles.inputWidthLarge}`}
          value={webhook.value}
          onChange={setWebhookValue}
        />
      </React.Fragment>
    );

  const getTriggerTypeInput = () => {
    return sectionize(
      <React.Fragment>
        <h2
          className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
        >
          Trigger Type
          <Tooltip
            id="trigger-type"
            message="Scheduled triggers could be scheduled with a cron and adhoc triggers can be invoked manually"
            className={styles.add_mar_left_mid}
          />
        </h2>
        <select
          className={`form-control ${styles.inputWidthLarge}`}
          value={schedule.type}
          onChange={setTriggerType}
        >
          <option key="cron" value="cron">
            Cron
          </option>
          <option key="adhoc" value="adhoc">
            Adhoc
          </option>
        </select>
      </React.Fragment>
    );
  };

  const getScheduleInput = () => {
    if (schedule.type === 'adhoc') {
      return sectionize(
        <React.Fragment>
          <h2
            className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
          >
            Ad-hoc Trigger Time
            <Tooltip
              id="trigger-timestamp"
              message="Time to invoke the ad-hoc trigger at. You can also invoke ad-hoc triggers manually after it is created"
              className={styles.add_mar_left_mid}
            />
          </h2>
          <div
            className={`${styles.add_mar_bottom_mid} ${styles.display_flex}`}
          >
            <DateTimePicker
              onChange={setAdhocTriggerValue}
              inputProps={{
                className: `form-control ${styles.inputWidthLarge}`,
              }}
            />
            {/* <a
              onClick={setState.toggleScheduleModal}
              className={styles.cursorPointer}
            >
              Build a cron expression
            </a> */}
          </div>
        </React.Fragment>
      );
    }

    const getScheduleInputText = (disabled: boolean, className: string) => (
      <input
        type="text"
        placeholder={defaultCronExpr}
        className={`form-control ${styles.inputWidthLarge} ${className}`}
        value={schedule.value}
        onChange={setScheduleValue}
        disabled={disabled}
      />
    );

    return sectionize(
      <React.Fragment>
        <h2
          className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
        >
          Cron schedule
          <Tooltip
            id="trigger-schedule"
            message="Schedule for your cron"
            className={styles.add_mar_left_mid}
          />
        </h2>
        <div className={`${styles.add_mar_bottom_mid} ${styles.display_flex}`}>
          {getScheduleInputText(false, styles.add_mar_right_mid)}
          <a
            className={styles.cursorPointer}
            href="https://crontab.guru/#*_*_*_*_*"
            target="_blank"
            rel="noopener noreferrer"
          >
            Build a cron expression
          </a>
        </div>
      </React.Fragment>
    );
  };

  // TODO make JSONEditor component
  const getPayloadInput = () =>
    sectionize(
      <React.Fragment>
        <h2
          className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
        >
          Payload
          <Tooltip
            id="trigger-payload"
            message="The request payload for the HTTP trigger"
            className={styles.add_mar_left_mid}
          />
        </h2>
        <AceEditor
          mode="json"
          value={payload}
          onChange={setState.payload}
          height="200px"
        />
      </React.Fragment>
    );

  const getHeadersInput = () =>
    sectionize(
      <React.Fragment>
        <h2
          className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
        >
          Headers
          <Tooltip
            id="trigger-headers"
            message="Configure headers for the request to the webhook"
            className={styles.add_mar_left_mid}
          />
        </h2>
        <Headers headers={headers} setHeaders={setState.headers} />
      </React.Fragment>
    );

  const getRetryConfInput = () => {
    return sectionize(
      <div className={styles.add_mar_bottom}>
        <h2 className={`${styles.subheading_text}`}>
          Retry configuration
          <Tooltip
            id="trigger-headers"
            message="Retry configuration if the call to the webhook fails"
            className={styles.add_mar_left_mid}
          />
        </h2>
        <RetryConf
          retryConf={state.retryConf}
          setRetryConf={setState.retryConf}
        />
      </div>
    );
  };

  return (
    <React.Fragment>
      {getNameInput()}
      {getWebhookInput()}
      {getTriggerTypeInput()}
      {getScheduleInput()}
      {getPayloadInput()}
      {getHeadersInput()}
      {getRetryConfInput()}
    </React.Fragment>
  );
};

export default Form;
