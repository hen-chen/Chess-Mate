# Return a list of 100 usrs with similar rating history
# Time (before restructuring): GET /fidetolichesshistory/?fideId=5202213&lichessType=blitz&fideType=classical 200 36311.598 ms - 8545
# After time: GET /fidetolichesshistory/?fideId=5202213&lichessType=blitz&fideType=classical 304 30986.431 ms - -
firstComplexQuery = """
      WITH MergedHistory AS (
        SELECT fideId, F.month AS month, F.year AS year, F.rating AS fideRating, L.rating AS lichessRating, lichessId
        FROM FideHistory F
                JOIN LichessHistory L ON F.year = L.year AND F.month = L.month
            AND fideId = ${fideId} AND L.type = "${lichessType}" AND F.type = "${fideType}"
    )
    SELECT lichessId,
          ABS(AVG(lichessRating - fideRating) - ${threshold}) AS score,
          VARIANCE(lichessRating - fideRating - ${threshold}) AS variance,
          COUNT(*)                                            AS numPoints
    FROM MergedHistory
    GROUP BY lichessId
    ORDER BY score, numPoints DESC, variance DESC
    LIMIT 100
"""


# Find all top level games (where the sum of both players’ elo is >= param elo). Find all the players in these games, and get all the players’ countries. Then find all the users in these countries. Sort the users by country and elo.
# Time (before restructuring): GET /topGamesCountryPlayers/3000 200 73679.814 ms - 35031628
# After time: GET /topGamesCountryPlayers/3000 304 67544.520 ms - -
secondComplexQuery = """
WITH top_games AS (
    SELECT *
    FROM 
    (
      SELECT whiteId, blackId, whiteRating, blackRating, (whiteRating + blackRating) AS sum_elo
      FROM LichessGames
    ) SummedElo
    WHERE SummedElo.sum_elo >= ${elo}
  ),
  Countries_top_games_white AS (
    SELECT country
    FROM top_games tg JOIN LichessPlayers lp ON tg.whiteId = lp.id
  ),
  Countries_top_games_black AS (
    SELECT country
    FROM top_games tg JOIN LichessPlayers lp ON tg.blackId = lp.id
  ),
  Countries AS (
    SELECT *
    FROM Countries_top_games_white
    UNION
    SELECT *
    FROM Countries_top_games_black
  )
  SELECT *
  FROM LichessPlayers lp
  WHERE lp.country IN (SELECT * FROM Countries)
  ORDER BY lp.fideRating, lp.country;
"""


# Find some poor level games (sum of elo is < 2400), and determine all the players’ playtime. Find all the unverified players with elo less than `elo` (with similar playtime). Sort the users by playtime, elo.
# Time (before restructuring): GET /poorPlayers/2400 304 62534.445 ms - -
# After time: GET /poorPlayers/2400 304 58889.397 ms - -
thirdComplexQuery = """
WITH poor_games AS (
      SELECT *
      FROM
      (
        SELECT whiteId, blackId, whiteRating, blackRating, (whiteRating + blackRating) AS sum_elo
        FROM LichessGames
      ) SummedElo
      WHERE SummedElo.sum_elo <= 2400
    ),
    Playtime_poor_games_white AS (
      SELECT totalPlayTime, fideRating, lp.id
      FROM poor_games pg JOIN LichessPlayers lp ON pg.whiteId = lp.id
    ),
    Playtime_poor_games_black AS (
      SELECT totalPlayTime, fideRating, lp.id
      FROM poor_games pg JOIN LichessPlayers lp ON pg.blackId = lp.id
    ),
    Combine AS (
      SELECT *
      FROM Playtime_poor_games_white
      UNION
      SELECT *
      FROM Playtime_poor_games_black
    )
    SELECT *
    FROM LichessPlayers lp JOIN Combine c ON c.id = lp.id
    WHERE lp.isVerified = 0 AND lp.fideRating < ${elo}
    ORDER BY lp.totalPlayTime, lp.fideRating;
"""


# Given an `id`, find all openings that `id` player has played. Then, find all the players that play an opening that `id` plays.
# Time (before restructuring): GET /getSimilarPlayersOpenings/-tristan- 200 58603.405 ms - 184288
# After time: GET /getSimilarPlayersOpenings/-tristan- 304 55126.026 ms - -
fourthComplexQuery = """
   WITH black_games AS (
        SELECT *
        FROM LichessGames
        WHERE blackId = '${id}'
    ),
    white_games AS (
        SELECT *
        FROM LichessGames
        WHERE whiteId = '${id}'
    ),
    combine AS (
        SELECT eco
        FROM white_games
        UNION
        SELECT eco
        FROM black_games
    ),
    other_users_black AS (
        SELECT username
        FROM LichessPlayers lp JOIN LichessGames LG on lp.id = LG.blackId
        WHERE LG.eco IN (SELECT * FROM combine)
    ),
    other_users_white AS (
        SELECT username
        FROM LichessPlayers lp JOIN LichessGames LG on lp.id = LG.whiteId
        WHERE LG.eco IN (SELECT * FROM combine)
    ),
    combine_others AS (
        SELECT username
        FROM other_users_black
        UNION
        SELECT username
        FROM other_users_white
    )
    SELECT *
    FROM combine_others;
"""


