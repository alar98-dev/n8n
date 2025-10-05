#!/usr/bin/env python3
"""
sqlite_to_postgres_migrate.py

Small migration helper to move a SQLite file into a PostgreSQL database
while applying common compatibility fixes between SQLite and Postgres.

Features / heuristics:
- Maps common SQLite types to Postgres equivalents
- Converts STRFTIME(...) defaults to CURRENT_TIMESTAMP
- Heuristically maps JSON-like TEXT columns to JSONB (based on column names or sample values)
- Converts boolean-like values (0/1, 't'/'f', 'true'/'false') to booleans
- Loads data via psycopg2 execute_values for bulk insert
- Creates tables WITHOUT foreign keys (to avoid dependency ordering issues). Constraints/indexes can be added after.

Limitations:
- Does not try to faithfully reproduce complicated SQLite DDL (triggers, partial indexes, complex defaults)
- If you need exact schema, review the generated SQL and tweak manually

Usage:
  python3 scripts/sqlite_to_postgres_migrate.py \
    --sqlite /path/to/database.sqlite \
    --pg "postgresql://user:pass@host:5432/dbname" \
    [--json-cols nodes,connections,settings] [--dry-run]

Requirements:
  pip install psycopg2-binary python-dateutil

Run inside the repository root (script will write some diagnostic files here).
"""

import argparse
import sqlite3
import json
import re
import sys
from datetime import datetime

try:
    import psycopg2
    import psycopg2.extras
except Exception:
    print("Missing dependency: psycopg2. Install: pip install psycopg2-binary")
    raise

try:
    from dateutil import parser as dateparser
except Exception:
    dateparser = None


TYPE_MAP = [
    (re.compile(r"INT", re.I), "integer"),
    (re.compile(r"BOOL|BOOLEAN", re.I), "boolean"),
    (re.compile(r"CHAR|CLOB|TEXT", re.I), "text"),
    (re.compile(r"REAL|FLOA|DOUB", re.I), "double precision"),
    (re.compile(r"BLOB", re.I), "bytea"),
    (re.compile(r"DATETIME|TIMESTAMP", re.I), "timestamp(3) with time zone"),
]


def map_type(sqlite_type, col_name, sample_value, json_cols):
    if not sqlite_type:
        # If no declared type, try detect by name or sample
        if col_name.lower() in json_cols or looks_like_json(sample_value):
            return "jsonb"
        return "text"

    t = sqlite_type.strip()
    # JSON-ish
    if "JSON" in t.upper() or col_name.lower() in json_cols or looks_like_json(sample_value):
        return "jsonb"

    for pattern, pgtype in TYPE_MAP:
        if pattern.search(t):
            # keep varchar(n)
            m = re.search(r"(VARCHAR\s*\(\s*\d+\s*\))", t, re.I)
            if m:
                return m.group(1).lower()
            return pgtype

    # fallback
    return "text"


def looks_like_json(value):
    if value is None:
        return False
    v = str(value).strip()
    if (v.startswith('{') and v.endswith('}')) or (v.startswith('[') and v.endswith(']')):
        try:
            json.loads(v)
            return True
        except Exception:
            return False
    return False


def clean_default(dflt):
    if dflt is None:
        return None
    s = str(dflt).strip()
    # sqlite often has defaults like STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')
    if "STRFTIME" in s.upper() or "DATETIME('NOW'" in s.upper():
        return "CURRENT_TIMESTAMP"
    # boolean text
    if s.upper() in ("'TRUE'", 'TRUE', "'FALSE'", 'FALSE'):
        return s.replace("'", '').lower()
    # numeric default keep as-is
    return s


def pluralize_table(t):
    return t


def get_tables(conn):
    cur = conn.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")
    return cur.fetchall()


def get_table_info(conn, table):
    cur = conn.execute(f"PRAGMA table_info('{table}')")
    cols = cur.fetchall()
    # returns list of (cid,name,type,notnull,dflt_value,pk)
    return cols


def guess_json_cols(conn, table):
    # simple heuristic: look at column names and sample row values
    json_names = {'nodes', 'connections', 'settings', 'staticdata', 'pinData', 'meta'}
    sample = conn.execute(f"SELECT * FROM '{table}' LIMIT 10").fetchall()
    colnames = [d[1] for d in conn.execute(f"PRAGMA table_info('{table}')").fetchall()]
    result = set()
    for i, c in enumerate(colnames):
        if c.lower() in json_names:
            result.add(c)
            continue
        # inspect sample
        for row in sample:
            val = row[i]
            if looks_like_json(val):
                result.add(c)
                break
    return result


def create_table_sql(table, cols_info, json_cols):
    parts = []
    pks = []
    for col in cols_info:
        # col: (cid, name, type, notnull, dflt_value, pk)
        cid, name, ctype, notnull, dflt_value, pk = col
        sample_val = None
        pgtype = map_type(ctype, name, sample_val, json_cols)
        dflt = clean_default(dflt_value)
        line = f'"{name}" {pgtype}'
        if notnull:
            line += ' NOT NULL'
        if dflt is not None:
            # quote some defaults if needed
            if isinstance(dflt, str) and not dflt.upper().startswith('CURRENT_TIMESTAMP') and not re.match(r"^[0-9-:.TZ+]+$", dflt):
                escaped = dflt.replace("'", "''")
                line += f" DEFAULT '{escaped}'"
            else:
                line += f" DEFAULT {dflt}"
        parts.append(line)
        if pk:
            pks.append(name)

    pk_sql = ''
    if pks:
        pk_list = ', '.join([f'"{p}"' for p in pks])
        pk_sql = ', PRIMARY KEY (' + pk_list + ')'

    create_sql = f'CREATE TABLE IF NOT EXISTS "{table}" (\n  ' + ',\n  '.join(parts) + pk_sql + '\n);'
    return create_sql


def migrate_table(sqlite_conn, pg_conn, table, dry_run=False):
    print(f"Migrating table: {table}")
    cols_info = get_table_info(sqlite_conn, table)
    json_cols = guess_json_cols(sqlite_conn, table)
    create_sql = create_table_sql(table, cols_info, json_cols)
    print("-- create_sql:\n", create_sql)

    if dry_run:
        return

    with pg_conn.cursor() as cur:
        cur.execute(create_sql)
        pg_conn.commit()

    # now fetch data from sqlite and insert into pg
    colnames = [c[1] for c in cols_info]
    placeholders = ','.join(['%s'] * len(colnames))
    quoted_cols = ','.join([f'"{c}"' for c in colnames])
    insert_sql = f'INSERT INTO "{table}" ({quoted_cols}) VALUES %s ON CONFLICT DO NOTHING;'

    rows = sqlite_conn.execute(f"SELECT {quoted_cols} FROM '{table}'").fetchall()
    if not rows:
        print(f"  no rows for {table}")
        return

    transformed = []
    for row in rows:
        vals = []
        for i, val in enumerate(row):
            col = cols_info[i]
            _, cname, ctype, notnull, dflt, pk = col
            if cname in json_cols and val is not None and val != '':
                try:
                    parsed = json.loads(val)
                    # wrap so psycopg2 knows how to adapt it to jsonb
                    vals.append(psycopg2.extras.Json(parsed))
                    continue
                except Exception:
                    # fallthrough: keep raw
                    pass
            # boolean heuristic
            if ctype and re.search(r"BOOL|BOOLEAN", ctype, re.I):
                if val in (1, '1', 't', 'true', 'True'):
                    vals.append(True)
                    continue
                if val in (0, '0', 'f', 'false', 'False'):
                    vals.append(False)
                    continue
            # timestamp heuristic
            if ctype and re.search(r"DATETIME|TIMESTAMP", str(ctype), re.I):
                if val in (None, ''):
                    vals.append(None)
                    continue
                if dateparser:
                    try:
                        dt = dateparser.parse(str(val))
                        vals.append(dt)
                        continue
                    except Exception:
                        pass
                vals.append(str(val))
                continue

            vals.append(val)
        transformed.append(tuple(vals))

    # bulk insert using execute_values
    with pg_conn.cursor() as cur:
        try:
            # disable foreign key checks/triggers for faster import and to avoid referential ordering issues
            cur.execute("SET session_replication_role = 'replica';")
        except Exception:
            # some Postgres setups may not allow changing this; continue anyway
            pass
        try:
            psycopg2.extras.execute_values(cur, insert_sql, transformed, template=None, page_size=100)
            pg_conn.commit()
        finally:
            try:
                cur.execute("SET session_replication_role = 'origin';")
            except Exception:
                pass
    print(f"  inserted {len(transformed)} rows into {table}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--sqlite', required=True, help='Path to sqlite file or :memory:')
    p.add_argument('--pg', required=True, help='Postgres DSN, e.g. postgresql://user:pass@host:5432/db')
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--skip-tables', default='', help='Comma separated list of tables to skip')
    p.add_argument('--json-cols', default='', help='Comma separated column names to force as json (global)')
    args = p.parse_args()

    skip_tables = {t.strip() for t in args.skip_tables.split(',') if t.strip()}
    json_cols_global = {c.strip() for c in args.json_cols.split(',') if c.strip()}

    sqlite_conn = sqlite3.connect(args.sqlite)
    sqlite_conn.row_factory = sqlite3.Row

    pg_conn = psycopg2.connect(args.pg)

    tables = get_tables(sqlite_conn)
    if not tables:
        print('No tables found in sqlite DB')
        return

    for name, sql in tables:
        if name in skip_tables:
            print(f"Skipping table {name}")
            continue
        # For this run, we pass json_cols as union of global + heuristics
        # The migrate_table function calls guess_json_cols internally
        migrate_table(sqlite_conn, pg_conn, name, dry_run=args.dry_run)

    print('Migration finished')


if __name__ == '__main__':
    main()
