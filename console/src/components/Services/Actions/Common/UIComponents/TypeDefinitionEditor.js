import React from 'react';
import { parse as sdlParse } from 'graphql/language/parser';
import styles from './Styles.scss';
import Tooltip from './Tooltip';
import CrossIcon from '../../../../Common/Icons/Cross';
import SDLEditor from '../../../../Common/AceEditor/SDLEditor';

const editorLabel = 'Type Definition';
const editorTooltip = 'Define your action as a GraphQL mutation using SDL';

let parseDebounceTimer = null;

const ActionDefinitionEditor = ({
  value,
  onChange,
  className,
  placeholder,
  error,
}) => {
  const onChangeWithError = v => {
    if (parseDebounceTimer) {
      clearTimeout(parseDebounceTimer);
    }
    parseDebounceTimer = setTimeout(() => {
      if (!v.trim()) return;
      let _e = null;
      try {
        sdlParse(v);
      } catch (e) {
        _e = e;
      }
      if (_e) {
        onChange(v, _e);
      }
    }, 1000);

    onChange(v);
  };

  const errorMessage =
    error && (error.message || 'This is not valid GraphQL SDL');

  let markers = [];
  if (error && error.locations) {
    markers = error.locations.map(l => ({
      line: l.line,
      column: l.column,
      type: 'error',
      message: errorMessage,
      className: styles.errorMarker,
    }));
  }

  return (
    <div className={`${className || ''}`}>
      <h2
        className={`${styles.subheading_text} ${styles.add_mar_bottom_small}`}
      >
        {editorLabel}
        <Tooltip
          id="action-name"
          text={editorTooltip}
          className={styles.add_mar_left_mid}
        />
      </h2>
      {error && (
        <div className={styles.add_mar_bottom_small}>
          <CrossIcon />
          <i style={{ color: 'red' }}>{errorMessage}</i>
        </div>
      )}
      <SDLEditor
        name="sdl-editor"
        width={'600px'}
        height={'200px'}
        value={value}
        onChange={onChangeWithError}
        placeholder={placeholder}
        markers={markers}
      />
    </div>
  );
};

export default ActionDefinitionEditor;