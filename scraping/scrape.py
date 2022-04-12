from ast import parse
import pandas as pd
import numpy as np
import chess.pgn
import pymysql
from dotenv import dotenv_values
import requests
import time
import json

# Replace
LICHESS_PGN_PATH = "../../proj/lichess_db_standard_rated_2022-03.pgn"

# For testing parsing
def mock_fetch_lichess_info(usernames):
  return json.load(open("./test/testUsersRoute.json"))

def fetch_lichess_info(usernames):
  payload=",".join(usernames)
  headers = {
    'Content-Type': 'text/plain'
  }
  res = requests.post("https://lichess.org/api/users", data=payload, headers=headers)
  if res.status_code == 429:
    print("rate limited - waiting")
    time.sleep(60) # lichess api rate lim - wait a full minute if you get 429 response
  if res.ok:
    return res.json()
  else:
    print("error response", res)

def fetch_rating_hist(username):
  res = requests.get(f"https://lichess.org/api/user/{username}/rating-history")
  print(res.text)

# parse user returned by lichess api into user dictionary matching LichessPlayers spec
def parse_raw_user(raw_user):
  if raw_user.get("disabled") == True:
    return None

  user = {}
  profile = raw_user.get("profile", {})
  perfs = raw_user.get("perfs", {})
  bullet = perfs.get("bullet", {})
  blitz = perfs.get("blitz", {})
  rapid = perfs.get("rapid", {})
  classical = perfs.get("classical", {})

  user["id"] = raw_user.get("id")
  user["username"] = raw_user.get("username")
  user["bio"] = profile.get("bio")
  user["country"] = profile.get("country")
  user["location"] = profile.get("location")
  user["firstName"] = profile.get("firstName")
  user["lastName"] = profile.get("lastName")
  user["fideRating"] = profile.get("fideRating")
  user["uscfRating"] = profile.get("uscfRating")
  user["ecfRating"] = profile.get("ecfRating")
  user["createdAt"] =  raw_user.get("createdAt")
  user["seenAt"] = raw_user.get("seenAt")
  user["title"] = raw_user.get("title")
  if user["title"] == 'BOT':
    return None
  user["bulletRating"] = bullet.get("rating")
  user["bulletNumGames"] = bullet.get("games")
  user["bulletIsProvisional"] = bullet.get("prov", False)
  
  user["blitzRating"] = blitz.get("rating")
  user["blitzNumGames"] = blitz.get("games")
  user["blitzIsProvisional"] = blitz.get("prov", False)

  user["rapidRating"] = rapid.get("rating")
  user["rapidNumGames"] = rapid.get("games")
  user["rapidIsProvisional"] = rapid.get("prov", False)

  user["classicalRating"] = classical.get("rating")
  user["classicalNumGames"] = classical.get("games")
  user["classicalIsProvisional"] = classical.get("prov", False)

  user["totalPlayTime"] = raw_user.get("playTime", {}).get("total")
  user["isVerified"] = raw_user.get("verified", False)
  return user

def insert_parsed_users(connection, cursor, parsed_users: list[dict]):
  if len(parsed_users) == 0:
    return
  else:
    placeholders = ', '.join(['%s'] * len(parsed_users[0]))
    columns = ", ".join(parsed_users[0].keys())
    sql = f"INSERT IGNORE INTO LichessPlayers ({columns}) VALUES ({placeholders})"

    parsed_users_list = list(map(lambda dict: list(dict.values()), parsed_users))
    cursor.executemany(sql, parsed_users_list)
    connection.commit()

# Insert all users first (about 500k)
# Later we will insert a sample of games for each user (maybe 10-100)
# Since 500 million is somewhat unfeasible
# quantity = number of games to read, default read all
def export_lichess_users(pgn_path, connection, quantity=None):
  pgn = open(pgn_path)
  game = chess.pgn.read_game(pgn)
  count = 0
  users = [] # accumulate 300

  cursor = connection.cursor()

  while game != None and (quantity == None or count < quantity):
    if (len(users) >= 300):
      raw_data_arr = fetch_lichess_info(users)
      if (type(raw_data_arr) is list):
        parsed_data = list(map(parse_raw_user, raw_data_arr))
        parsed_filtered_data = list(filter(lambda x: x != None, parsed_data))
        insert_parsed_users(connection, cursor, parsed_filtered_data)
        print("Inserted batch of users")
      else:
        print("unexpected data in response", raw_data_arr)
      users.clear()

    white = game.headers["White"]
    black = game.headers["Black"]
    if white != None:
      users.append(white)
    if black != None:
      users.append(black)
    # iterate
    game = chess.pgn.read_game(pgn)
    count = count + 1

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

export_lichess_users(LICHESS_PGN_PATH, connection, 2000)

connection.close()