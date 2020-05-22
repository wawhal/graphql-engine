import React from 'react';
import { TreeFieldElement } from '../utils';
import styles from '../SchemaExplorer.scss';

type Props = {
  field: TreeFieldElement;
  handleToggle: (a: TreeFieldElement) => void;
};

const FieldElement: React.FC<Props> = ({ field, handleToggle }) => {
  const style = {
    marginLeft: `${field.depth * 20}px`,
    color: 'rgb(31, 97, 160)',
    fontStyle: 'normal',
  };
  const toggle = () => handleToggle(field);
  return (
    <div
      className={`${styles.display_flex} ${styles.add_mar_bottom_mid}`}
      style={style}
      title={
        field.hasArgs ? undefined : 'Only fields with arguments can be toggled'
      }
    >
      <div className={styles.add_mar_right_small}>
        <input
          checked={field.isChecked}
          type="checkbox"
          disabled={!field.hasArgs}
          className={styles.cursorPointer}
          onChange={toggle}
        />
      </div>
      <div
        className={`${styles.add_mar_right_small} ${styles.cursorPointer}`}
        onClick={toggle}
        role="checkbox"
        aria-checked={field.isChecked}
      >
        {field.name}
      </div>
    </div>
  );
};

export default FieldElement;
