const tabNameMap = {
  view: 'Browse Rows',
  insert: 'Insert Row',
  modify: 'Modify',
  relationships: 'Relationships',
  permissions: 'Permissions',
};

const ordinalColSort = (a, b) => {
  if (a.ordinal_position < b.ordinal_position) {
    return -1;
  }
  if (a.ordinal_position > b.ordinal_position) {
    return 1;
  }
  return 0;
};

const findFKConstraint = (curTable, column) => {
  const fkConstraints = curTable.foreign_key_constraints;
  return fkConstraints.find(
    fk =>
      Object.keys(fk.column_mapping).length === column.length &&
      Object.keys(fk.column_mapping).join(',') === column.join(',')
  );
};

const findTableFromRel = (schemas, curTable, rel) => {
  let rtable = null;

  // for view
  if (rel.rel_def.manual_configuration !== undefined) {
    rtable = rel.rel_def.manual_configuration.remote_table;
    if (rtable.schema) {
      rtable = rtable.name;
    }
  }

  // for table
  if (rel.rel_def.foreign_key_constraint_on !== undefined) {
    // for object relationship
    if (rel.rel_type === 'object') {
      const column = [rel.rel_def.foreign_key_constraint_on];
      const fkc = findFKConstraint(curTable, column);
      if (fkc) {
        rtable = fkc.ref_table;
      }
    }

    // for array relationship
    if (rel.rel_type === 'array') {
      rtable = rel.rel_def.foreign_key_constraint_on.table;
      if (rtable.schema) {
        rtable = rtable.name;
      }
    }
  }
  return schemas.find(x => x.table_name === rtable);
};

const findAllFromRel = (schemas, curTable, rel) => {
  let rtable = null;
  let lcol;
  let rcol;

  const foreignKeyConstraintOn = rel.rel_def.foreign_key_constraint_on;

  // for view
  if (rel.rel_def.manual_configuration !== undefined) {
    rtable = rel.rel_def.manual_configuration.remote_table;

    if (rtable.schema) {
      rtable = rtable.name;
    }
    const columnMapping = rel.rel_def.manual_configuration.column_mapping;
    lcol = Object.keys(columnMapping);
    rcol = lcol.map(column => columnMapping[column]);
  }

  // for table
  if (foreignKeyConstraintOn !== undefined) {
    // for object relationship
    if (rel.rel_type === 'object') {
      lcol = [foreignKeyConstraintOn];

      const fkc = findFKConstraint(curTable, lcol);
      if (fkc) {
        rtable = fkc.ref_table;
        rcol = [fkc.column_mapping[lcol]];
      }
    }

    // for array relationship
    if (rel.rel_type === 'array') {
      rtable = foreignKeyConstraintOn.table;
      rcol = [foreignKeyConstraintOn.column];
      if (rtable.schema) {
        // if schema exists, its not public schema
        rtable = rtable.name;
      }

      const rtableSchema = schemas.find(x => x.table_name === rtable);
      const rfkc = findFKConstraint(rtableSchema, rcol);
      lcol = [rfkc.column_mapping[rcol]];
    }
  }
  return { lcol, rtable, rcol };
};

const getIngForm = string => {
  return (
    (string[string.length - 1] === 'e'
      ? string.slice(0, string.length - 1)
      : string) + 'ing'
  );
};

const getEdForm = string => {
  return (
    (string[string.length - 1] === 'e'
      ? string.slice(0, string.length - 1)
      : string) + 'ed'
  );
};

const escapeRegExp = string => {
  return string.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
};

const getTableName = t => {
  const typ = typeof t;
  if (typ === 'string') {
    return t;
  } else if (typ === 'object') {
    return 'name' in t ? t.name : '';
  }
  return '';
};

const getSchemaQuery = schemaName => {
  const runSql = `select 
  COALESCE(
    json_agg(
      row_to_json(info)
    ), 
    '[]' :: JSON
  ) AS tables 
FROM 
  (
    select 
      ist.table_schema, 
      ist.table_name, 
      obj_description(
        (
          ist.table_schema || '.' || ist.table_name
        ):: regclass, 
        'pg_class'
      ) as comment, 
      row_to_json(ist.*) as detail, 
      to_jsonb(
        array_remove(
          array_agg(
            DISTINCT row_to_json(isc) :: JSONB || jsonb_build_object(
              'comment', 
              (
                SELECT 
                  pg_catalog.col_description(
                    c.oid, isc.ordinal_position :: int
                  ) 
                FROM 
                  pg_catalog.pg_class c 
                WHERE 
                  c.oid = (
                    SELECT 
                      ('"' || isc.table_name || '"'):: regclass :: oid
                  ) 
                  AND c.relname = isc.table_name
              )
            )
          ), 
          NULL
        )
      ) AS columns, 
      to_jsonb(
        array_remove(
          array_agg(
            DISTINCT row_to_json(hdb_fkc) :: JSONB
          ), 
          NULL
        )
      ) AS foreign_key_constraints, 
      to_jsonb(
        array_remove(
          array_agg(
            DISTINCT row_to_json(hdb_uc) :: JSONB
          ), 
          NULL
        )
      ) AS unique_constraints, 
      row_to_json(hdb_pk.*) :: JSONB AS primary_key, 
      hdb_table.table_name IS NOT NULL AS is_table_tracked, 
      to_jsonb(
        array_remove(
          array_agg(
            DISTINCT row_to_json(hdb_rel) :: JSONB
          ), 
          NULL
        )
      ) AS relationships, 
      to_jsonb(
        array_remove(
          array_agg(
            DISTINCT row_to_json(hdb_perm) :: JSONB
          ), 
          NULL
        )
      ) AS permissions 
    from 
      information_schema.tables AS ist 
      LEFT OUTER JOIN information_schema.columns AS isc ON isc.table_schema = ist.table_schema 
      and isc.table_name = ist.table_name 
      LEFT OUTER JOIN hdb_catalog.hdb_foreign_key_constraint AS hdb_fkc ON hdb_fkc.table_schema = ist.table_schema 
      and hdb_fkc.table_name = ist.table_name 
      LEFT OUTER JOIN hdb_catalog.hdb_primary_key AS hdb_pk ON hdb_pk.table_schema = ist.table_schema 
      and hdb_pk.table_name = ist.table_name 
      LEFT OUTER JOIN hdb_catalog.hdb_unique_constraint AS hdb_uc ON hdb_uc.table_schema = ist.table_schema 
      and hdb_uc.table_name = ist.table_name 
      LEFT OUTER JOIN hdb_catalog.hdb_table AS hdb_table ON hdb_table.table_schema = ist.table_schema 
      and hdb_table.table_name = ist.table_name 
      LEFT OUTER JOIN hdb_catalog.hdb_relationship AS hdb_rel ON hdb_rel.table_schema = ist.table_schema 
      and hdb_rel.table_name = ist.table_name 
      LEFT OUTER JOIN hdb_catalog.hdb_permission_agg AS hdb_perm ON hdb_perm.table_schema = ist.table_schema 
      and hdb_perm.table_name = ist.table_name 
    where 
      ist.table_schema = '${schemaName}' 
    GROUP BY 
      ist.table_schema, 
      ist.table_name, 
      ist.*, 
      row_to_json(hdb_pk.*):: JSONB, 
      hdb_table.table_name
  ) AS info;
`;
  return {
    type: 'run_sql',
    args: {
      sql: runSql,
    },
  };
};

export {
  ordinalColSort,
  findTableFromRel,
  findAllFromRel,
  getEdForm,
  getIngForm,
  escapeRegExp,
  getTableName,
  tabNameMap,
  getSchemaQuery,
};
