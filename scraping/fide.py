import chess.pgn
from getfide import get_fide_id, get_fide_page
import requests
import json
import country_converter
from lichess import query_helper

FIDE_SCRAPER_HOST = "http://localhost:3000"
cc = country_converter.CountryConverter()

def should_parse(headers):
  # Don't fetch games that are too old (caissabase goes back to 1700s)
  date = headers.get("Date", "")
  if date < "1980":
    return False
  if headers.get("Black") == None or headers.get("White") == None:
    return False
  return True

def parse_fide_game_no_ids(game):
  try:
    headers = game.headers
    res = {}
    res["date"] = headers.get("Date")
    res["time"] = headers.get("Time")
    res["timeControl"] = headers.get("TimeControl")
    res["eco"] = headers.get("ECO")
    res["whiteRating"] = headers.get("WhiteElo")
    res["blackRating"] = headers.get("BlackElo")
    res["result"] = headers.get("Result")
    res["pgn"] = str(game)
    return res
  except Exception as e:
    print("Exception parsing pgn:", e)
    return res

def scrape_fide_profile(fide_id):
  res = requests.get(f"{FIDE_SCRAPER_HOST}/player/{fide_id}/info?include_history=true")
  if res.ok:
    return res.json()
  else:
    # print("Fide scraper did not return ok", res.content, fide_id)
    return None

# def mock_get_fide_id_from_db(connection, firstName, lastName):
#   return "1000055"

def get_fide_id_from_db(connection, firstName, lastName):
  sql = "SELECT (id) FROM FidePlayers USE INDEX (NameIndex) WHERE `firstName`=%s AND `lastName`=%s"
  cursor = connection.cursor()
  cursor.execute(sql, [firstName, lastName])
  for (id,) in cursor:
    return id

def parse_name(fullname):
  (lastname, _, firstname) = fullname.partition(",")
  return (firstname.strip(), lastname.strip())

def parse_title(raw_title):
  t = raw_title.lower().strip()
  # some players can have multiple titles, but fide parser doesn't return those
  if 'woman grandmaster' in t:
    return 'WGM'
  if 'woman international master' in t:
    return 'WIM'
  if 'woman fide master' in t:
    return 'WFM'
  if 'woman candidate master' in t:
    return 'WCM'
  if 'grandmaster' in t:
    return 'GM'
  if 'international master' in t:
    return 'IM'
  if 'fide master' in t:
    return 'FM'
  if 'candidate master' in t:
    return 'CM'

def parse_sex(raw_sex):
  s = raw_sex.lower().strip()
  if s == 'female':
    return 'F'
  else:
    return 'M'

# also validate that fetched fide name is an exact match, not a partial match
def parse_raw_fide_data(fide_id, exp_name, raw_data):
  player = {}
  raw_name = raw_data.get("name", "")
  if raw_name.strip() != exp_name.strip():
    return (None, None)
  if not fide_id:
    return (None, None)
  player["id"] = fide_id
  tokens = [s.strip() for s in raw_name.split(",")]
  if len(tokens) < 2:
    return (None, None)
  player["firstName"] = tokens[1] # name format is last, first
  player["lastName"] = tokens[0]
  # Parser doesn't parse this
  if raw_data.get("federation") == "England":
    player["country"] = 'UK'
  else:
    player["country"] = cc.convert(raw_data.get("federation", "").strip(), to='ISO2')
  player["birthYear"] = raw_data.get("birth_year")
  player["sex"] = parse_sex(raw_data.get("sex", ""))
  player["title"] = parse_title(raw_data.get("title"))

  player["classicalRating"] = raw_data.get("standard_elo")
  if player["classicalRating"] == "Notrated":
    player["classicalRating"] = None

  player["rapidRating"] = raw_data.get("rapid_elo")
  if player["rapidRating"] == "Notrated":
    player["rapidRating"] = None

  player["blitzRating"] = raw_data.get("blitz_elo")
  if player["blitzRating"] == "Notrated":
    player["blitzRating"] = None

  player["worldRankAllPlayers"] = raw_data.get("world_rank_all_players")
  player["worldRankActivePlayers"] = raw_data.get("world_rank_active_players")
  player["nationalRankAllPlayers"] = raw_data.get("national_rank_all_players")
  player["nationalRankActivePlayers"] = raw_data.get("national_rank_active_players")

  history = []
  raw_history = raw_data.get("history")
  for raw_item in raw_history:
    try:
      date = str(raw_item.get("numeric_date"))
      year = int(date[0:4])
      month = int(date[4:6])
      classicalRating = raw_item.get("standard")
      if classicalRating:
        history.append({"fideId": fide_id, "type": "classical", "year": year, "month": month, "rating": classicalRating})
      blitzRating = raw_item.get("blitz")
      if blitzRating:
        history.append({"fideId": fide_id, "type": "blitz", "year": year, "month": month, "rating": blitzRating})
      rapidRating = raw_item.get("rapid")
      if rapidRating:
        history.append({"fideId": fide_id, "type": "rapid", "year": year, "month": month, "rating": rapidRating})
    except Exception as e:
      print("Can't process hist item:", e)

  return (player, history)

def insert_helper(connection, dict, tablename):
  cursor = connection.cursor()
  placeholders, columns = query_helper(dict)
  sql = f"INSERT IGNORE INTO {tablename} ({columns}) VALUES ({placeholders})"
  cursor.execute(sql, list(dict.values()))
  connection.commit()

def insert_fide_player(connection, player):
  insert_helper(connection, player, "FidePlayers")

def insert_fide_rating_hist(connection, history: list[dict]):
  if len(history) == 0:
    return
  else:
    cursor = connection.cursor()
    placeholders, columns = query_helper(history[0])
    sql = f"INSERT IGNORE INTO FideHistory ({columns}) VALUES ({placeholders})"

    parsed_users_list = list(map(lambda dict: list(dict.values()), history))
    cursor.executemany(sql, parsed_users_list)
    connection.commit()

async def insert_fide_player_and_hist(connection, page, player_name):
  try:
    fide_id = await get_fide_id(page, player_name)
    try:
      if player_name:
        raw_data = scrape_fide_profile(fide_id)
        (parsed_player, parsed_hist) = parse_raw_fide_data(fide_id, player_name, raw_data)
        if parsed_player:
          insert_fide_player(connection, parsed_player)
        if parsed_hist:
          insert_fide_rating_hist(connection, parsed_hist)
      return fide_id
    except Exception as e:
      # print("Did not scrape & put in db", e)
      return None
  except Exception as e:
    print("Error with puppeteer, restarting browser:", e)
    page = await get_fide_page()

def insert_fide_id_lookup(connection, fide_id):
  cursor = connection.cursor()
  sql = f"INSERT IGNORE INTO FideIdLookup (fideId) VALUES (%s)"
  cursor.execute(sql, [fide_id])
  connection.commit()
  return cursor.lastrowid

def insert_fide_game(connection, parsed_game):
  insert_helper(connection, parsed_game, "FideGames")

# If fetch_players is false, then we just try to look up the player in the database to get fideId
# And do NOT web scrape
async def export_fide(pgn_path, connection, fetch_players=False, start_count=0, quantity=None):
  pgn = open(pgn_path)
  # bookmark game so we can read it after reading the header
  game_offset = pgn.tell()
  headers = chess.pgn.read_headers(pgn)
  count = 0

  page = await get_fide_page()
  # The scraper is buggy so we won't try to fetch names we know won't work twice
  scrape_error_cache = set()

  while headers != None and (quantity == None or count < quantity):
    if count < start_count:
      chess.pgn.skip_game(pgn)
      count = count + 1
      continue
    white = headers.get("White")
    black = headers.get("Black")
    if should_parse(headers):
      async def handle_player_name(connection, player_name):
        (firstname, lastname) = parse_name(player_name)
        fide_id = get_fide_id_from_db(connection, firstname, lastname)
        if fide_id == None and fetch_players == True and player_name not in scrape_error_cache:
          fide_id = await insert_fide_player_and_hist(connection, page, player_name)
          if fide_id == None:
            scrape_error_cache.add(player_name)
            return None
        return insert_fide_id_lookup(connection, fide_id)

      white_id = await handle_player_name(connection, white)
      black_id = await handle_player_name(connection, black)

      # Can't find fide Id so inserting into games DB wouldn't work anyway with foreign key constraints
      if white_id == None or black_id == None:
        continue
      # Otherwise put game in DB
      pgn.seek(game_offset)
      game = chess.pgn.read_game(pgn)
      parsed_game = parse_fide_game_no_ids(game)
      parsed_game["whiteId"] = white_id
      parsed_game["blackId"] = black_id
      insert_fide_game(connection, parsed_game)
    # iter
    headers = chess.pgn.read_headers(pgn)
    game_offset = pgn.tell()
    count = count + 1
    if count % 100 == 0:
      print("PGN Count:", count)