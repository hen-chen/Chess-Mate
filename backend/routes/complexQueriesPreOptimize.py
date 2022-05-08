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
