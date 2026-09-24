type Row = Record<string, unknown>;

let idCounter = 0;

function nextId() {
  idCounter += 1;
  return `row-${idCounter}`;
}

type Operation =
  | { type: "select" }
  | { type: "insert"; values: Row }
  | { type: "update"; values: Row }
  | { type: "upsert"; values: Row; onConflict?: string };

class FakeQueryBuilder implements PromiseLike<{ data: unknown; error: unknown }> {
  private filters: Array<(row: Row) => boolean> = [];
  private op: Operation = { type: "select" };

  constructor(
    private readonly table: string,
    private readonly db: Map<string, Row[]>,
    private readonly uniqueColumns: Map<string, string[]>,
  ) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  insert(values: Row) {
    this.op = { type: "insert", values };
    return this;
  }

  update(values: Row) {
    this.op = { type: "update", values };
    return this;
  }

  upsert(values: Row, options?: { onConflict?: string }) {
    this.op = { type: "upsert", values, onConflict: options?.onConflict };
    return this;
  }

  maybeSingle() {
    const { data, error } = this.execute();
    const rows = data as Row[] | null;
    return Promise.resolve({ data: rows && rows.length > 0 ? rows[0] : null, error });
  }

  single() {
    const { data, error } = this.execute();
    const rows = data as Row[] | null;

    if (error) {
      return Promise.resolve({ data: null, error });
    }

    if (!rows || rows.length === 0) {
      return Promise.resolve({
        data: null,
        error: { message: "No rows found", code: "PGRST116" },
      });
    }

    return Promise.resolve({ data: rows[0], error: null });
  }

  then<TResult1 = { data: unknown; error: unknown }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: unknown }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private rows() {
    return this.db.get(this.table) ?? [];
  }

  private findUniqueConflict(values: Row) {
    const columns = this.uniqueColumns.get(this.table) ?? [];

    for (const column of columns) {
      if (values[column] === undefined || values[column] === null) {
        continue;
      }

      const conflict = this.rows().find((row) => row[column] === values[column]);

      if (conflict) {
        return conflict;
      }
    }

    return null;
  }

  private execute(): { data: unknown; error: unknown } {
    const rows = this.rows();
    const op = this.op;

    if (op.type === "select") {
      return { data: rows.filter((row) => this.filters.every((f) => f(row))), error: null };
    }

    if (op.type === "insert") {
      const conflict = this.findUniqueConflict(op.values);

      if (conflict) {
        return {
          data: null,
          error: { message: "duplicate key value violates unique constraint", code: "23505" },
        };
      }

      const newRow: Row = { id: nextId(), ...op.values };
      rows.push(newRow);
      this.db.set(this.table, rows);
      return { data: [newRow], error: null };
    }

    if (op.type === "update") {
      const matched = rows.filter((row) => this.filters.every((f) => f(row)));
      matched.forEach((row) => Object.assign(row, op.values));
      return { data: matched, error: null };
    }

    const onConflict = op.onConflict;
    const matchIndex = onConflict
      ? rows.findIndex((row) => row[onConflict] === op.values[onConflict])
      : -1;

    if (matchIndex >= 0) {
      rows[matchIndex] = { ...rows[matchIndex], ...op.values };
      return { data: [rows[matchIndex]], error: null };
    }

    const newRow: Row = { id: nextId(), ...op.values };
    rows.push(newRow);
    this.db.set(this.table, rows);
    return { data: [newRow], error: null };
  }
}

export class FakeSupabase {
  private db = new Map<string, Row[]>();
  private uniqueColumns = new Map<string, string[]>();

  seed(table: string, rows: Row[]) {
    this.db.set(table, [...rows]);
    return this;
  }

  setUniqueColumns(table: string, columns: string[]) {
    this.uniqueColumns.set(table, columns);
    return this;
  }

  rows(table: string): Row[] {
    return this.db.get(table) ?? [];
  }

  from(table: string) {
    return new FakeQueryBuilder(table, this.db, this.uniqueColumns);
  }
}
