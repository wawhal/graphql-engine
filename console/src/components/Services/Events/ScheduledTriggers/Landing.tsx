import React from 'react';
import Button from '../../../Common/Button/Button';
import styles from '../Events.scss';
import { push } from 'react-router-redux';
import { getAddSTRoute } from '../../../Common/utils/routesUtils';

const Landing = ({ dispatch }: { dispatch: any }) => {
  return (
    <div
      className={`${styles.padd_left_remove} container-fluid ${styles.padd_top}`}
    >
      <div className={styles.padd_left}>
        <div className={styles.display_flex}>
          <h2 className={`${styles.headerText} ${styles.inline_block}`}>
            Scheduled Triggers
          </h2>
          <Button
            color="yellow"
            size="sm"
            onClick={() => dispatch(push(getAddSTRoute()))}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

export default (connect: any) => connect()(Landing);