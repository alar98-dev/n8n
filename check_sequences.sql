DO $$
DECLARE
  r record;
  seqreg text;
  maxv bigint;
  lastval bigint;
BEGIN
  FOR r IN
    SELECT c.relname as table_name, a.attname as column_name
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN unnest(con.conkey) WITH ORDINALITY AS cols(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = cols.attnum
    JOIN pg_type t ON a.atttypid = t.oid
    WHERE con.contype = 'p' AND n.nspname = 'public' AND t.typname IN ('int2','int4','int8')
    ORDER BY c.relname
  LOOP
    seqreg := pg_get_serial_sequence(r.table_name, r.column_name);
    IF seqreg IS NULL THEN
      SELECT ns.nspname || '.' || seq.relname INTO seqreg
      FROM pg_class seq
      JOIN pg_namespace ns ON seq.relnamespace = ns.oid
      JOIN pg_depend d ON seq.oid = d.objid
      JOIN pg_class t ON d.refobjid = t.oid
      JOIN pg_attribute a2 ON d.refobjsubid = a2.attnum AND a2.attrelid = t.oid
      WHERE t.relname = r.table_name AND a2.attname = r.column_name AND seq.relkind = 'S'
      LIMIT 1;
    END IF;
    IF seqreg IS NULL THEN
      RAISE NOTICE '% - % : no sequence found', r.table_name, r.column_name;
    ELSE
      EXECUTE format('SELECT COALESCE(MAX(%I),0) FROM %I', r.column_name, r.table_name) INTO maxv;
      EXECUTE format('SELECT last_value FROM %s', seqreg) INTO lastval;
      RAISE INFO '% - % : max=% lastval=% seq=%', r.table_name, r.column_name, maxv, lastval, seqreg;
    END IF;
  END LOOP;
END;
$$;
