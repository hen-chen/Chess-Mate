import pymysql
from dotenv import dotenv_values
from lichess import export_lichess_games, export_lichess_users, test_parse_lichess_game, parse_rating_hist_response, export_lichess_hist, mock_fetch_rating_hist
from fide import export_fide
import asyncio

# Replace
OTB_PGN_PATH = "../../proj/canada_20220401.pgn"
LICHESS_PGN_PATH = "../../proj/lichess_db_standard_rated_2022-03.pgn"

# Connect to db
config = dotenv_values(".env")
host = config["DB_HOST"]
user = config["DB_USER"]
password = config["DB_PASSWORD"]
database = config["DB_NAME"]

connection = pymysql.connect(host=host,
                             user=user,
                             password=password,
                             database=database,
                             port=3306)

# # test_parse_lichess_game()
# export_lichess_games(LICHESS_PGN_PATH, connection, 181000, 601000, 100)
asyncio.get_event_loop().run_until_complete(
  export_fide(OTB_PGN_PATH, connection, fetch_players=True, start_count=200, quantity=None)
)

# res = mock_fetch_rating_hist("penguingim1")
# print(parse_rating_hist_response(res, "penguingim1"))
# export_lichess_hist(connection, offset=1)

connection.close()
