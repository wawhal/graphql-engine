import React from 'react';

const Info = ({ triggerName, tableName, schemaName, triggerId, styles }) => (
  <div className={styles.container}>
    <div className={styles.modifySection}>
      <h4 className={styles.modifySectionHeading}>Info</h4>
      <div className={styles.infoContent}>
        {/*
        <KeyValues keyname="Trigger name" value={triggerName} styles={styles} />
        <KeyValues keyname="Trigger ID" value={triggerId} styles={styles} />
        <KeyValues keyname="Table" value={tableName} styles={styles} />
        <KeyValues keyname="Schema" value={schemaName} styles={styles} />
        */}
        <table className="table table-striped table-bordered">
          <thead />
          <tbody>
            <tr>
              <td>Trigger name</td>
              <td>{triggerName}</td>
            </tr>
            <tr>
              <td>Trigger ID</td>
              <td>{triggerId}</td>
            </tr>
            <tr>
              <td>Table</td>
              <td>{tableName}</td>
            </tr>
            <tr>
              <td>Schema</td>
              <td>{schemaName}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const KeyValues = ({ keyname, value, styles }) => (
  <div className={styles.info}>
    <p> {keyname}: </p>
    <input
      className={`${styles.input} form-control ${styles.add_mar_right} ${
        styles.modifyHeaderCollapsedInput
      }`}
      value={value}
      disabled
    />
  </div>
);

export default Info;
