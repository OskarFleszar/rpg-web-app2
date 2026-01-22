/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Drawable } from "../../types";

type TokenAddProps = {
  op: any;

  setObjects: React.Dispatch<React.SetStateAction<Drawable[]>>;
};

export function handleTokenAdd({ op, setObjects }: TokenAddProps) {
  const t = (op as any).token ?? op;

  const id = String(t.id ?? t.objectId ?? "");
  if (!id) return;

  const col = Number(t.col);
  const row = Number(t.row);
  if (!Number.isFinite(col) || !Number.isFinite(row)) return;

  setObjects((prev) => {
    if (prev.some((o) => o.id === id)) return prev;

    return [
      ...prev,
      {
        type: "token" as const,
        id,
        col,
        row,
        characterId: Number(t.characterId),
        ownerId: String(
          t.ownerId ?? (op as any).ownerId ?? (op as any).userId ?? "",
        ),
      },
    ];
  });
}
