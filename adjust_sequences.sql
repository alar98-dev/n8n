DO $$
DECLARE
  r record;
  seqname text;
  seqreg text;
  maxv bigint;
  is_identity text;
BEGIN
  FOR r IN
    SELECT c.relname as table_name, a.attname as column_name, a.attidentity as is_identity
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN unnest(con.conkey) WITH ORDINALITY AS cols(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = cols.attnum
    JOIN pg_type t ON a.atttypid = t.oid
    WHERE con.contype = 'p' AND n.nspname = 'public' AND t.typname IN ('int2','int4','int8')
    ORDER BY c.relname
  LOOP
  -- Use lowercase sequence names to avoid mismatches caused by quoted identifiers
    -- default lowercase fallback sequence name
    seqname := lower(r.table_name || '_' || r.column_name || '_seq');
    -- Try to find an existing sequence for serial/identity columns
    seqreg := NULL;
    SELECT pg_get_serial_sequence(r.table_name, r.column_name) INTO seqreg;
    IF seqreg IS NULL THEN
      -- try to find a dependent sequence (works for identity columns)
      SELECT ns.nspname || '.' || seq.relname INTO seqreg
      FROM pg_class seq
      JOIN pg_namespace ns ON seq.relnamespace = ns.oid
      JOIN pg_depend d ON seq.oid = d.objid
      JOIN pg_class t ON d.refobjid = t.oid
      JOIN pg_attribute a2 ON d.refobjsubid = a2.attnum AND a2.attrelid = t.oid
      WHERE t.relname = r.table_name AND a2.attname = r.column_name AND seq.relkind = 'S'
      LIMIT 1;
    END IF;
    -- Fallback to generated name in public schema
    IF seqreg IS NULL THEN
      seqreg := 'public.' || seqname;
    END IF;

    -- Ensure the fallback sequence exists (if seqreg points to existing seq this will be a no-op)
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', seqname);

    EXECUTE format('SELECT COALESCE(MAX(%I),0) FROM %I', r.column_name, r.table_name) INTO maxv;
    IF maxv IS NULL THEN maxv := 1; END IF;

    -- Set sequence value using the found/created sequence (cast to regclass)
    EXECUTE format('SELECT setval(%L::regclass, %s)', seqreg, GREATEST(1, maxv));

    -- Only alter default and ownership for non-identity columns
    IF r.is_identity = '' THEN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET DEFAULT nextval(%L)', r.table_name, r.column_name, seqname);
      EXECUTE format('ALTER SEQUENCE %I OWNED BY %I.%I', seqname, r.table_name, r.column_name);
    ELSE
      RAISE INFO 'Skipping ALTER DEFAULT for identity column % %.%', r.table_name, r.column_name, seqreg;
    END IF;

    RAISE INFO 'Adjusted % - % to sequence % with value %', r.table_name, r.column_name, seqreg, maxv;
  END LOOP;
END;
$$;
