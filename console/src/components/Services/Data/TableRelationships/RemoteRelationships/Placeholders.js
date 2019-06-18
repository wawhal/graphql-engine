import React from 'react';
import styles from './SchemaExplorer.scss';

export const NoRemoteSchemaPlaceholder = () => {
  return (
    <div
      className={`${styles.schemaExplorerContainer}`}
      style={{ overflow: 'auto' }}
    >
      <i>Select a remote schema first</i>
    </div>
  );
};

export const LoadingSkeleton = () => {
  const skeletonItem = (
    <div className={`${styles.display_flex} ${styles.skeletonItem}`}>
      <div className={styles.skeletonCheckbox} />
      <div className={styles.skeletonLabel} />
    </div>
  );
  return (
    <div className={`${styles.schemaExplorerContainer} ${styles.overflowAuto}`}>
      {Array(5)
        .fill()
        .map(() => skeletonItem)}
    </div>
  );
};
