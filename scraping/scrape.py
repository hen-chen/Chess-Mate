import pandas as pd
import numpy as np
import chess.pgn
import pymysql
from dotenv import dotenv_values

# Replace
LICHESS_PGN_PATH = "../../proj/lichess_db_standard_rated_2022-03.pgn"

pgn = open(LICHESS_PGN_PATH)

# while pgn != None:
#   game = chess.pgn.read_game(pgn)
#   print(game)

# Connect to db
config = dotenv_values(".env")
print(config)
host = config["DB_HOST"]
user = config["DB_USER"]
password = config["DB_PASSWORD"]
database = config["DB_NAME"]

connection = pymysql.connect(host=host,
                             user=user,
                             password=password,
                             database=database,
                             port=3306)
with connection:
    cur = connection.cursor()
    cur.execute("SELECT VERSION()")
    version = cur.fetchone()
    print("Database version: {} ".format(version[0]))
