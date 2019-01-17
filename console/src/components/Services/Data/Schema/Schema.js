/* eslint-disable space-infix-ops */
/* eslint-disable no-loop-func  */

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { push } from 'react-router-redux';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

import { untrackedTip, untrackedRelTip } from './Tooltips';
import Button from '../../Layout/Button/Button';
import {
  setTableName,
  addExistingTableSql,
  addAllUntrackedTablesSql,
} from '../Add/AddExistingTableViewActions';
import { fetchDataInit, LOAD_UNTRACKED_RELATIONS } from '../DataActions';
import { getAllUnTrackedRelations } from '../TableRelationships/Actions';
import AutoAddRelationsConnector from './AutoAddRelations';
import globals from '../../../../Globals';

const appPrefix = globals.urlPrefix + '/data';

class Schema extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExporting: false,
    };
    // Initialize this table
    const dispatch = this.props.dispatch;
    dispatch(fetchDataInit());
    const untrackedRelations = getAllUnTrackedRelations(
      this.props.schema,
      this.props.currentSchema
    ).bulkRelTrack;
    this.props.dispatch({
      type: LOAD_UNTRACKED_RELATIONS,
      untrackedRelations,
    });
  }

  componentDidMount() {
    const untrackedRelations = getAllUnTrackedRelations(
      this.props.schema,
      this.props.currentSchema
    ).bulkRelTrack;
    this.props.dispatch({
      type: LOAD_UNTRACKED_RELATIONS,
      untrackedRelations,
    });
  }

  render() {
    const {
      schema,
      untracked,
      migrationMode,
      untrackedRelations,
      currentSchema,
      dispatch,
    } = this.props;
    const styles = require('../PageContainer/PageContainer.scss');
    let relationships = 0;
    schema.map(t => (relationships += t.relationships.length));

    // find which tables are untracked
    const ids1 = schema.map(item => item.table_name);
    const ids2 = untracked.map(item => item.table_name);

    const untrackedTables = ids1
      .map((id, index) => {
        if (ids2.indexOf(id) < 0) {
          return schema[index];
        }
      })
      .concat(
        ids2.map((id, index) => {
          if (ids1.indexOf(id) < 0) {
            return untracked[index];
          }
        })
      )
      .filter(item => item !== undefined)
      .sort((a, b) => {
        return a.table_name === b.table_name
          ? 0
          : +(a.table_name > b.table_name) || -1;
      });

    const untrackedHtml = [];
    for (let i = 0; i < untrackedTables.length; i++) {
      untrackedHtml.push(
        <div className={styles.padd_bottom} key={`${i}untracked`}>
          <div className={`${styles.display_inline} ${styles.padd_right}`}>
            <Button
              dataTest={`add-track-table-${untrackedTables[i].table_name}`}
              className={`${styles.display_inline}`}
              color="white"
              size="xs"
              onClick={e => {
                e.preventDefault();
                dispatch(setTableName(untrackedTables[i].table_name));
                dispatch(addExistingTableSql());
              }}
            >
              Add
            </Button>
          </div>
          <div className={`${styles.padd_right} ${styles.inline_block}`}>
            {untrackedTables[i].table_name}
          </div>
        </div>
      );
    }
    if (!untrackedHtml.length) {
      untrackedHtml.push(
        <div key="no-untracked">There are no untracked tables or views</div>
      );
    }

    return (
      <div
        className={`${styles.padd_left_remove} container-fluid ${
          styles.padd_top
        }`}
      >
        <div className={styles.padd_left}>
          <Helmet title="Schema - Data | Hasura" />
          <div>
            <h2 className={`${styles.heading_text} ${styles.inline_block}`}>
              {' '}
              Schema{' '}
            </h2>
            {migrationMode ? (
              <Button
                dataTest="data-create-table"
                color="yellow"
                onClick={e => {
                  e.preventDefault();
                  dispatch(
                    push(`${appPrefix}/schema/${currentSchema}/table/add`)
                  );
                }}
              >
                Create Table
              </Button>
            ) : null}
          </div>
          <hr />
          <div className={styles.add_pad_bottom}>
            <div>
              <h4
                className={`${styles.subheading_text} ${
                  styles.heading_tooltip
                }`}
              >
                Untracked tables or views
              </h4>
              <OverlayTrigger placement="right" overlay={untrackedTip}>
                <i className="fa fa-info-circle" aria-hidden="true" />
              </OverlayTrigger>
              {untrackedTables.length > 0 ? (
                <Button
                  className={`${styles.display_inline} ${styles.addAllBtn}`}
                  color="white"
                  size="xs"
                  onClick={e => {
                    e.preventDefault();
                    dispatch(addAllUntrackedTablesSql(untrackedTables));
                  }}
                >
                  Add all
                </Button>
              ) : null}
            </div>
            <div className={`${styles.padd_left_remove} col-xs-12`}>
              {untrackedHtml}
            </div>
          </div>
          <hr />
          <div>
            <div>
              <h4
                className={`${styles.subheading_text} ${
                  styles.heading_tooltip
                }`}
              >
                Untracked foreign-key relations
              </h4>
              <OverlayTrigger placement="right" overlay={untrackedRelTip}>
                <i className="fa fa-info-circle" aria-hidden="true" />
              </OverlayTrigger>
              <div className={`${styles.padd_left_remove} col-xs-12`}>
                <div>
                  <AutoAddRelationsConnector
                    untrackedRelations={untrackedRelations}
                    schema={schema}
                    dispatch={dispatch}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Schema.propTypes = {
  schema: PropTypes.array.isRequired,
  untracked: PropTypes.array.isRequired,
  untrackedRelations: PropTypes.array.isRequired,
  migrationMode: PropTypes.bool.isRequired,
  currentSchema: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  schema: state.tables.allSchemas,
  schemaList: state.tables.schemaList,
  untracked: state.tables.untrackedSchemas,
  migrationMode: state.main.migrationMode,
  untrackedRelations: state.tables.untrackedRelations,
  currentSchema: state.tables.currentSchema,
});

const schemaConnector = connect => connect(mapStateToProps)(Schema);

export default schemaConnector;
