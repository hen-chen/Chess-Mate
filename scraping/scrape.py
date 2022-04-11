import pandas as pd
import numpy as np
import chess.pgn
import pymysql
from dotenv import dotenv_values
import requests

# Replace
LICHESS_PGN_PATH = "../../proj/caissabase.pgn"

def fetch_lichess_info(usernames):
  payload=",".join(usernames)
  headers = {
    'Content-Type': 'text/plain'
  }
  res = requests.post("https://lichess.org/api/users", data=payload, headers=headers)
  print(res.text)

def fetch_rating_hist(username):
  res = requests.get(f"https://lichess.org/api/user/{username}/rating-history")
  print(res.text)

fetch_lichess_info(["superfastfourier", "SnakeCase"])
fetch_rating_hist("SnakeCase")

pgn = open(LICHESS_PGN_PATH)

while pgn != None:
  game = chess.pgn.read_game(pgn)
  print(game)

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
with connection:
    cur = connection.cursor()
    cur.execute("SELECT VERSION()")
    version = cur.fetchone()
    print("Database version: {} ".format(version[0]))
