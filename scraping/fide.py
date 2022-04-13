import chess.pgn

def export_fide_players(pgn_path, connection, start_count=0, quantity=None):
  pgn = open(pgn_path)
  game = chess.pgn.read_game(pgn)
  count = 0
  while count < 10:
    count += 1
    game = chess.pgn.read_game(pgn)
    print(game)