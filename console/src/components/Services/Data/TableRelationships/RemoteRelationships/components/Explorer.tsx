import React from 'react';
import globals from '../../../../../../Globals';
import { useIntrospectionSchemaRemote } from '../../../../RemoteSchema/graphqlUtils';
import {
  RemoteRelationship,
  TreeArgElement,
  ArgValueType,
  TreeFieldElement,
  buildSchemaTree,
} from '../types';
import { LoadingSkeleton, NoRemoteSchemaPlaceholder } from './PlaceHolder';
import ArgElement from './ArgElement';
import FieldElement from './FieldElement';
import styles from '../SchemaExplorer.scss';

type Props = {
  relationship: RemoteRelationship;
  toggleArg: (a: TreeArgElement) => void;
  toggleField: (f: TreeFieldElement) => void;
  handleArgValueTypeChange: (a: TreeArgElement, type: ArgValueType) => void;
  handleArgValueChange: (a: TreeArgElement, value: string) => void;
  remoteSchemaName: string;
  columns: string[];
};

const Explorer: React.FC<Props> = ({
  relationship,
  toggleArg,
  toggleField,
  handleArgValueChange,
  handleArgValueTypeChange,
  remoteSchemaName,
  columns,
}) => {
  const { loading, error, schema, introspect } = useIntrospectionSchemaRemote(
    remoteSchemaName,
    {
      'x-hasura-admin-secret': globals.adminSecret,
    }
  );

  if (!remoteSchemaName) {
    return <NoRemoteSchemaPlaceholder />;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !schema) {
    return (
      <div>
        Error introspecting remote schema.{' '}
        <a onClick={introspect} className={styles.cursorPointer} role="button">
          {' '}
          Try again{' '}
        </a>
      </div>
    );
  }

  const tree = buildSchemaTree(relationship, schema || undefined);

  return (
    <div className={styles.schemaExplorerContainer}>
      {tree.map(element => {
        switch (element.kind) {
          case 'argument': {
            const el: TreeArgElement = element;
            return (
              <ArgElement
                arg={el}
                handleToggle={toggleArg}
                handleArgValueChange={handleArgValueChange}
                handleArgValueTypeChange={handleArgValueTypeChange}
                columns={columns}
              />
            );
          }
          case 'field': {
            const el: TreeFieldElement = element;
            return <FieldElement field={el} handleToggle={toggleField} />;
          }
          default:
            return null;
        }
      })}
    </div>
  );
};

export default Explorer;
