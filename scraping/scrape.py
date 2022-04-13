import pymysql
from dotenv import dotenv_values
from lichess import export_lichess_games, export_lichess_users, test_parse_lichess_game
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

# test_parse_lichess_game()
# export_lichess_users(LICHESS_PGN_PATH, connection, 30000)
# export_lichess_games(LICHESS_PGN_PATH, connection, 0, 30000)
asyncio.get_event_loop().run_until_complete(
  export_fide(OTB_PGN_PATH, connection)
)

connection.close()
