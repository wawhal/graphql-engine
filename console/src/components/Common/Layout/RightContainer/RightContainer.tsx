import React from 'react';
import styles from './RightContainer.scss';

const RightContainer: React.FC<React.ComponentProps<'div'>> = ({ children }) => {

  return (
    <div className={styles.container + ' container-fluid'}>
      <div className="row">
        <div
          className={
            styles.main + ' ' + styles.padd_left_remove + ' ' + styles.padd_top
          }
        >
          <div className={styles.rightBar + ' '}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    schema: state.tables.allSchemas,
  };
};

const rightContainerConnector = (connect: any) =>
  connect(mapStateToProps)(RightContainer);

export default rightContainerConnector;