import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isValidFieldKey, validateFields } from "../../core/postFields";
import type { PostFields } from "../../core/types";

// Document panel section for Post.fields (custom fields): one row per
// field, a name, a type and a value. Themes read them at publish time as
// `post.fields.<name>`; agents set them with `content update --field`.

export type FieldKind = "text" | "number" | "boolean" | "list";

export interface FieldRow {
  id: string;
  key: string;
  kind: FieldKind;
  value: string;
  checked: boolean;
}

let rowSeq = 0;
function newRow(partial: Partial<FieldRow> = {}): FieldRow {
  rowSeq += 1;
  return { id: `f${rowSeq}`, key: "", kind: "text", value: "", checked: true, ...partial };
}

export function fieldsToRows(fields: PostFields | undefined): FieldRow[] {
  return Object.entries(fields ?? {}).map(([key, v]) => {
    if (typeof v === "boolean") return newRow({ key, kind: "boolean", checked: v });
    if (typeof v === "number") return newRow({ key, kind: "number", value: String(v) });
    if (Array.isArray(v)) return newRow({ key, kind: "list", value: v.join(", ") });
    return newRow({ key, kind: "text", value: v });
  });
}

// Rows → the map to save. Rows without a name are ignored; an invalid
// name or number returns an error key (posts.customFields.errors.*).
export function rowsToFields(rows: FieldRow[]): { fields: PostFields | null; error?: string; field?: string } {
  const out: PostFields = {};
  for (const r of rows) {
    const key = r.key.trim();
    if (!key) continue;
    if (!isValidFieldKey(key)) return { fields: null, error: "invalidName", field: key };
    if (key in out) return { fields: null, error: "duplicate", field: key };
    if (r.kind === "boolean") out[key] = r.checked;
    else if (r.kind === "number") {
      const n = Number(r.value.trim());
      if (r.value.trim() === "" || !Number.isFinite(n)) return { fields: null, error: "invalidNumber", field: key };
      out[key] = n;
    } else if (r.kind === "list") out[key] = r.value.split(",").map((s) => s.trim()).filter(Boolean);
    else out[key] = r.value;
  }
  const { errors } = validateFields(out);
  if (errors.length) return { fields: null, error: "tooMany" };
  return { fields: Object.keys(out).length ? out : null };
}

export function CustomFieldsEditor({ rows, onChange }: { rows: FieldRow[]; onChange: (rows: FieldRow[]) => void }) {
  const { t } = useTranslation();
  const update = (id: string, patch: Partial<FieldRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-3">
      <p className="text-xs text-surface-500 dark:text-surface-400">{t("posts.customFields.help")}</p>
      {rows.map((r) => {
        const bad = r.key.trim() !== "" && !isValidFieldKey(r.key.trim());
        return (
          <div key={r.id} className="space-y-1.5 rounded-md border border-surface-200 p-2 dark:border-surface-700">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                className={`input flex-1 font-mono text-xs ${bad ? "border-red-500" : ""}`}
                placeholder={t("posts.customFields.namePlaceholder")}
                aria-label={t("posts.customFields.name")}
                value={r.key}
                onChange={(e) => update(r.id, { key: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              />
              <select
                className="input w-[6.5rem] text-xs"
                aria-label={t("posts.customFields.type")}
                value={r.kind}
                onChange={(e) => update(r.id, { kind: e.target.value as FieldKind })}
              >
                <option value="text">{t("posts.customFields.kinds.text")}</option>
                <option value="number">{t("posts.customFields.kinds.number")}</option>
                <option value="boolean">{t("posts.customFields.kinds.boolean")}</option>
                <option value="list">{t("posts.customFields.kinds.list")}</option>
              </select>
              <button
                type="button"
                className="rounded p-1 text-surface-500 hover:bg-surface-100 hover:text-red-600 dark:hover:bg-surface-800"
                title={t("posts.customFields.remove")}
                aria-label={t("posts.customFields.remove")}
                onClick={() => onChange(rows.filter((x) => x.id !== r.id))}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {r.kind === "boolean" ? (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={r.checked} onChange={(e) => update(r.id, { checked: e.target.checked })} />
                {r.checked ? t("posts.customFields.yes") : t("posts.customFields.no")}
              </label>
            ) : (
              <input
                type={r.kind === "number" ? "number" : "text"}
                className="input text-sm"
                placeholder={r.kind === "list" ? t("posts.customFields.listPlaceholder") : t("posts.customFields.valuePlaceholder")}
                aria-label={t("posts.customFields.value")}
                value={r.value}
                onChange={(e) => update(r.id, { value: e.target.value })}
              />
            )}
            {bad && <p className="text-xs text-red-600">{t("posts.customFields.errors.invalidName", { name: r.key })}</p>}
          </div>
        );
      })}
      <button type="button" className="btn-secondary w-full justify-center text-sm" onClick={() => onChange([...rows, newRow()])}>
        <Plus className="h-4 w-4" />
        {t("posts.customFields.add")}
      </button>
    </div>
  );
}
