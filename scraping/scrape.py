import pandas as pd
import numpy as np
import chess.pgn

# Replace
LICHESS_PGN_PATH = "../../proj/lichess_db_standard_rated_2022-03.pgn"

pgn = open(LICHESS_PGN_PATH)

while pgn != None:
  game = chess.pgn.read_game(pgn)
  print(game)
