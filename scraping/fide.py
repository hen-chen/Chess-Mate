import chess.pgn
from getfide import get_fide_id, get_fide_page
import requests
import json
import country_converter

FIDE_SCRAPER_HOST = "http://localhost:3000"
cc = country_converter.CountryConverter()

def should_fetch_players(headers):
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
    return (None, headers.get("White"), headers.get("Black"))
  except Exception as e:
    print("Exception parsing pgn:", e)
    return (None, None, None)

def scrape_fide_profile(fide_id):
  res = requests.get(f"{FIDE_SCRAPER_HOST}/player/{fide_id}/info?include_history=true")
  if res.ok:
    return res.json()
  else:
    print("Fide scraper did not return ok", res.content)
    return None

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
    return None
  if not fide_id:
    return None
  player["id"] = fide_id
  tokens = [s.strip() for s in raw_name.split(",")]
  if len(tokens) < 2:
    return None
  player["firstName"] = tokens[1] # name format is last, first
  player["lastName"] = tokens[0]
  conv = cc.convert(raw_data.get("federation", "").strip(), to='ISO2')
  player["country"] = conv
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

async def export_fide(pgn_path, connection, start_count=0, quantity=None):
  test_data = json.load(open("./test/testFide.json"))
  print(parse_raw_fide_data("2615657", "Wang, Constance", test_data))
  # pgn = open(pgn_path)
  # headers = chess.pgn.read_headers(pgn)
  # count = 0

  # page = await get_fide_page()

  # while headers != None and (quantity == None or count < quantity):
  #   if count < start_count:
  #     chess.pgn.skip_game(pgn)
  #     count = count + 1
  #     continue
  #   white = headers.get("White")
  #   black = headers.get("Black")
  #   player_names = [white, black]
  #   if should_fetch_players(headers):
  #     for player_name in player_names:
  #       try:
  #         fide_id = get_fide_id(page, player_name)
  #         if player_name:
  #           raw_data = scrape_fide_profile(fide_id)

  #       except Exception as e:
  #         print("Error with puppeteer, restarting browser:", e)
  #         page = await get_fide_page()

  # # iter
  # headers = chess.pgn.read_game(pgn)
  # count = count + 1