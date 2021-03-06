import requests
import time
import json
import chess.pgn

# For testing parsing
def mock_fetch_lichess_info(usernames):
  return json.load(open("./test/testUsersRoute.json"))

def mock_fetch_rating_hist(username):
  return json.load(open("./test/testLichessRatingHist.json"))

def fetch_lichess_info(usernames):
  payload=",".join(usernames)
  headers = {
    'Content-Type': 'text/plain',
    'User-Agent': 'pls-spare-some-cpu-time-for-a-poor-student'
  }
  res = requests.post("https://lichess.org/api/users", data=payload, headers=headers)
  if res.status_code == 429:
    print(res.content)
    print("rate limited - waiting for 2 minutes")
    time.sleep(120) # lichess api rate lim - wait a full minute if you get 429 response
    return None
  if res.ok:
    return res.json()

def fetch_rating_hist(username):
  res = requests.get(f"https://lichess.org/api/user/{username}/rating-history")
  if res.status_code == 429:
    print(res.content)
    print("rate limited - rating hist, waiting for 2 minutes")
    time.sleep(120)
  if res.ok:
    return res.json()

def parse_history_type(name):
  parsed_name = name.lower()
  if parsed_name not in ["bullet", "blitz", "classical", "rapid"]:
    return None
  else:
    return parsed_name

def parse_rating_hist_response(res_json, lichess_id):
  res = []

  # iterate over types of games
  for type in res_json:
    # Map (year, month) -> highest rating
    # adjust month to start with 1 instead of 0
    year_month_dict = {}
    type_name = type['name']

    parsed_type = parse_history_type(type_name)
    if parsed_type == None:
      continue

    dates = type['points']    

    for date in dates:
        year = date[0]
        month = date[1] + 1; # lichess months be starting from 0...
        elo = date[3]
        
        # update the highest or lowest elo per year
        if (year, month) in year_month_dict:
            curr_highest = year_month_dict[(year, month)]
            if elo > curr_highest:
              year_month_dict[(year, month)] = elo
        else:
            year_month_dict[(year, month)] = elo

    # Parse map into datapoints 
    for (year, month) in year_month_dict:
      highest_elo = year_month_dict[(year, month)]
      res.append([lichess_id, parsed_type, year, month, highest_elo])
  return res

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

def parse_lichess_game(game):
  try:
    headers = game.headers
    res = {}
    site = headers.get("Site")
    res["id"] = site.partition("https://lichess.org/")[2]
    if not res["id"]:
      return None
    res["date"] = headers.get("UTCDate", headers.get("Date"))
    res["time"] = headers.get("UTCTime")
    res["timeControl"] = headers.get("TimeControl")
    res["eco"] = headers.get("ECO")
    res["whiteId"] = headers.get("White", "").lower()
    if not res["whiteId"]:
      return None
    res["whiteRating"] = headers.get("WhiteElo")
    res["blackId"] = headers.get("Black", "").lower()
    if not res["blackId"]:
      return None
    res["blackRating"] = headers.get("BlackElo")
    res["result"] = headers.get("Result")
    res["pgn"] = str(game)
    return res
  except Exception as e:
    print("Exception parsing pgn:", e)
    return None

def test_parse_lichess_game():
  pgn = open("./test/testPgn.pgn")
  game = chess.pgn.read_game(pgn)
  print(parse_lichess_game(game))

def is_in_db(connection, username):
  user_id = username.lower()
  with connection.cursor() as cursor:
    sql = f"SELECT `id` FROM LichessPlayers WHERE `id`=%s"
    cursor.execute(sql, user_id)
    result = cursor.fetchone()
    if result:
      return True
    else:
      return False

def query_helper(dict_to_insert):
  placeholders =  ', '.join(['%s'] * len(dict_to_insert))
  columns = ", ".join(dict_to_insert.keys())
  return (placeholders, columns)

def insert_parsed_users(connection, cursor, parsed_users: list[dict]):
  if len(parsed_users) == 0:
    return
  else:
    placeholders, columns = query_helper(parsed_users[0])
    sql = f"INSERT IGNORE INTO LichessPlayers ({columns}) VALUES ({placeholders})"

    parsed_users_list = list(map(lambda dict: list(dict.values()), parsed_users))
    cursor.executemany(sql, parsed_users_list)
    connection.commit()

def insert_parsed_game(connection, cursor, parsed_game):
  placeholders, columns = query_helper(parsed_game)
  sql = f"INSERT IGNORE INTO LichessGames ({columns}) VALUES ({placeholders})"
  
  cursor.execute(sql, list(parsed_game.values()))
  connection.commit()

def insert_parsed_rating_hist(connection, cursor, parsed_hist):
  sql = f"INSERT IGNORE INTO LichessHistory (lichessId, type, year, month, rating) VALUES (%s, %s, %s, %s, %s)"
  cursor.executemany(sql, parsed_hist)
  connection.commit()

# Insert all users first (about 200k)
# Later we will insert a sample of games for each user (maybe 10-100)
# Since 90 million games is somewhat unfeasible...
# quantity = number of games to read, default read all
def export_lichess_users(pgn_path, connection, start_count=0, quantity=None):
  pgn = open(pgn_path)
  headers = chess.pgn.read_headers(pgn)
  count = 0
  users = [] # accumulate 300

  cursor = connection.cursor()

  while headers != None and (quantity == None or count < quantity):
    if count < start_count:
      chess.pgn.skip_game(pgn)
      count = count + 1
      continue
    if (len(users) >= 300):
      print("Going to fetch: ", users)
      raw_data_arr = fetch_lichess_info(users)
      if (type(raw_data_arr) is list):
        parsed_data = list(map(parse_raw_user, raw_data_arr))
        parsed_filtered_data = list(filter(lambda x: x != None, parsed_data))
        insert_parsed_users(connection, cursor, parsed_filtered_data)
        print("Inserted batch of users")
        users.clear()
      else:
        print("Not parsing", raw_data_arr)
        continue

    white = headers["White"]
    black = headers["Black"]
    if white and not is_in_db(connection, white):
      users.append(white)
    if black and not is_in_db(connection, black):
      users.append(black)
    # iterate
    count = count + 1
    headers = chess.pgn.read_headers(pgn)
    if count % 1000 == 0:
      print("PGNs read:", count)

# if you do quantity=10k, then next time you run, start count should be about 10k
def export_lichess_games(pgn_path, connection, start_count=0, quantity=None, increment=1):
  pgn = open(pgn_path)
  game = chess.pgn.read_game(pgn)
  count = 0

  cursor = connection.cursor()

  while game != None and (quantity == None or count < quantity):
    if count < start_count or count % increment != 0:
      chess.pgn.skip_game(pgn)
      count = count + 1
      continue
    parsed_game_dict = parse_lichess_game(game)
    insert_parsed_game(connection, cursor, parsed_game_dict)
    # iterate
    game = chess.pgn.read_game(pgn)
    count = count + 1
    if count % 1000 == 0:
      print("PGNs read:", count)

# skip for distributed scraping purposes
# Constance - offset 0
# Henry - offset 1
# TODO: offset 2,3
def export_lichess_hist(connection, offset=0):
  cursor = connection.cursor()
  sql = "SELECT username FROM LichessPlayers"
  cursor.execute(sql)

  count = 0

  for (username,) in cursor:
    if count % 4 == offset:
      json_res = fetch_rating_hist(username)
      if json_res:
        parsed_data = parse_rating_hist_response(json_res, username.lower()) # ids are lowercase
        insert_parsed_rating_hist(connection, connection.cursor(), parsed_data)
    count = count + 1
    if count % 10000 == 0:
      print(count)
