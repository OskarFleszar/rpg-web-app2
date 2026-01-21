/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, memo, useEffect, useState } from "react";
import { toImgSrc } from "../../../pages/characters/CharacterCard";
import type { Drawable } from "../types";
import type Konva from "konva";
import { Rect } from "react-konva";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import axios from "axios";
import type { CharacterImageDTO } from "../../../pages/characters/CharacterPage";
import { API_URL } from "../../../config";

type TokenLayerProps = {
  objects: Drawable[];
  boardMeta: {
    cols: number;
    rows: number;
    cellSize: number;
  };

  selectableProps: (o: Drawable) => {
    name: string;
    ref: (node: Konva.Node | null) => void;
    id: string;
    onPointerDown:
      | ((e: Konva.KonvaEventObject<PointerEvent>) => void)
      | undefined;
    draggable: boolean;
    onDragStart: (() => void) | undefined;
    onDragEnd: (() => void) | undefined;
    onTransformStart: (() => void) | undefined;
    onTransformEnd: (() => void) | undefined;
  };
};

type TokenSpriteProps = {
  x: number;
  y: number;
  size: number;
  src: string;
} & any;

export const TokenSprite = forwardRef<Konva.Node, TokenSpriteProps>(
  function TokenSprite({ x, y, size, src, ...rest }, ref) {
    const [img] = useImage(src, "anonymous");

    if (!img) {
      return (
        <Rect
          {...rest}
          ref={ref as any}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          fill="#e5e7eb"
          stroke="#111827"
          strokeWidth={2}
          perfectDrawEnabled={false}
        />
      );
    }

    return (
      <KonvaImage
        {...rest}
        ref={ref as any}
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        image={img}
        perfectDrawEnabled={false}
      />
    );
  },
);

TokenSprite.displayName = "TokenSprite";

export const TokenLayer = memo(function TokenLayer({
  objects,
  boardMeta,

  selectableProps,
}: TokenLayerProps) {
  const [charImg, setCharImg] = useState<Record<number, string>>({});

  useEffect(() => {
    const ids = Array.from(
      new Set(
        objects.filter((o) => o.type === "token").map((t) => t.characterId),
      ),
    ).filter((x): x is number => typeof x === "number" && Number.isFinite(x));

    ids.forEach(async (cid) => {
      if (charImg[cid]) return;

      try {
        const res = await axios.get<CharacterImageDTO>(
          `${API_URL}/api/character/characterImage/${cid}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const src = toImgSrc(
          res.data?.characterImage,
          res.data?.imageType ?? "image/jpeg",
        );

        setCharImg((prev) => ({ ...prev, [cid]: src }));
      } catch (e) {
        console.error("token image fetch failed", e);

        setCharImg((prev) => ({ ...prev, [cid]: toImgSrc(null) }));
      }
    });
  }, [objects, charImg]);

  return (
    <>
      {objects
        .filter((o) => o.type === "token")
        .map((o) => {
          if (o.type === "token") {
            const x = (o.col + 0.5) * boardMeta.cellSize;
            const y = (o.row + 0.5) * boardMeta.cellSize;

            const src = charImg[o.characterId] ?? toImgSrc(null);
            const sizePx = boardMeta.cellSize * 0.9;

            return (
              <TokenSprite
                key={o.id}
                {...selectableProps(o)}
                x={x}
                y={y}
                size={sizePx}
                src={src}
              />
            );
          }

          return null;
        })}
    </>
  );
});
