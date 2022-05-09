/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from 'react';
// @ts-ignore
import { Chess } from 'chess.js';
// @ts-ignore
import pgnParser from 'pgn-parser';

const chess = new Chess();

const PgnDisplay = ({
  boardLength,
  parsed,
}: {
  boardLength: number;
  parsed: any;
}) => {
  const tileLength = boardLength / 8;
  console.log(parsed);
  const [moves] = useState(parsed.moves.map((e: any) => e.move));
  const [move, setMove] = useState(0);
  return (
    <div className="d-inline-flex flex-column">
      <svg width={boardLength} height={boardLength}>
        {[...new Array(64)].map((_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          return (
            <rect
              key={row * 8 + col}
              x={row * tileLength}
              y={col * tileLength}
              width={tileLength}
              height={tileLength}
              fill={(row + col) % 2 === 0 ? '#ffce9e' : '#d18b47'}
            />
          );
        })}
        ,
        {chess
          .board()
          .flat()
          .filter((elt: null | undefined) => elt !== null && elt !== undefined)
          .map(
            ({
              square,
              color,
              type,
            }: {
              color: string;
              square: string;
              type: string;
            }) => {
              const row = 8 - parseInt(square.at(1)!);
              const col = square.charCodeAt(0) - 97;
              return (
                <image
                  href={`../${color}${type}.svg`}
                  key={square}
                  x={col * tileLength}
                  y={row * tileLength}
                  height={tileLength}
                  width={tileLength}
                />
              );
            },
          )}
      </svg>
      <div className="d-flex justify-content-center" style={{ padding: 12 }}>
        <button
          className="btn btn-primary m-1"
          onClick={() => {
            setMove(0);
            chess.reset();
          }}
        >
          Reset
        </button>
        <button
          className="btn btn-secondary m-1"
          disabled={move === 0}
          onClick={() => {
            chess.undo();
            setMove(move - 1);
          }}
        >
          {'<'}
        </button>
        <button
          className="btn btn-secondary m-1"
          disabled={move === moves.length - 2}
          onClick={() => {
            chess.move(moves[move]);
            setMove(move + 1);
          }}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default PgnDisplay;
