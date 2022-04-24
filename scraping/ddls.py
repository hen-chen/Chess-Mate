# just dumping them here

createLichessPlayers = """
CREATE TABLE LichessPlayers (
    id VARCHAR(20) NOT NULL,
    username VARCHAR(20),
    bio VARCHAR(400),
    country VARCHAR(2),
    location VARCHAR(80),
    firstName VARCHAR(20),
    lastName VARCHAR(20),
    fideRating INT,
    uscfRating INT,
    ecfRating INT,
    createdAt BIGINT,
    seenAt BIGINT,
    title enum('GM','WGM','IM','WIM','FM','WFM','CM','WCM','NM','WNM','LM'),
    bulletRating INT,
    bulletNumGames INT,
    bulletIsProvisional BOOL,
    blitzRating INT,
    blitzNumGames INT,
    blitzIsProvisional BOOL,
    rapidRating INT,
    rapidNumGames INT,
    rapidIsProvisional BOOL,
    classicalRating INT,
    classicalNumGames INT,
    classicalIsProvisional BOOL,
    totalPlayTime INT,
    isVerified BOOL,
    PRIMARY KEY (id)
)
"""

createLichessRatingHistory = """
CREATE TABLE LichessHistory(
    lichessId VARCHAR(20) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    rating INT NOT NULL,
    type enum('classical', 'rapid', 'blitz', 'bullet'),
    FOREIGN KEY (lichessId) REFERENCES LichessPlayers(id),
    PRIMARY KEY (lichessId, year, month, type)
)
"""

createLichessGames = """
CREATE TABLE LichessGames(
    id VARCHAR(8) NOT NULL,
    date VARCHAR(10), # support partial dates like 1862.??.??
    time VARCHAR(8), # HH:MM:SS,
    timeControl VARCHAR(10),
    eco VARCHAR(4), # add extra char to support extended eco code from caissabase
    whiteId VARCHAR(20) NOT NULL,
    whiteRating INT,
    blackId VARCHAR(20) NOT NULL,
    blackRating INT,
    result enum('1-0', '1/2-1/2', '0-1'),
    pgn VARCHAR(10000),
    FOREIGN KEY (whiteId) REFERENCES LichessPlayers(id),
    FOREIGN KEY (blackId) REFERENCES LichessPlayers(id),
    PRIMARY KEY (id)
);
"""

createFidePlayer = """
CREATE TABLE FidePlayers(
    id VARCHAR(8) NOT NULL, # fide id can be 7 or 8 char?
    firstName VARCHAR(20),
    lastName VARCHAR(20),
    country VARCHAR(2),
    birthYear INT,
    sex enum('M','F'), # only options in FIDE
    title enum('GM','WGM','IM','WIM','FM','WFM','CM','WCM'),
    classicalRating INT,
    rapidRating INT,
    blitzRating INT,
    worldRankAllPlayers INT,
    worldRankActivePlayers INT, # 0 means not active
    nationalRankAllPlayers INT,
    nationalRankActivePlayers INT, # 0 means not active
    PRIMARY KEY (id)
)
"""

createFideRatingHistory = """
CREATE TABLE FideHistory(
    fideId VARCHAR(8) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    rating INT NOT NULL,
    type enum('classical', 'rapid', 'blitz'),
    FOREIGN KEY (fideId) REFERENCES FidePlayers(id),
    PRIMARY KEY (fideId, year, month, type)
)
"""

createFideGames = """
CREATE TABLE FideGames(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date VARCHAR(10),
    time VARCHAR(8),
    timeControl VARCHAR(10),
    eco VARCHAR(4),
    whiteId INT NOT NULL,
    whiteRating INT,
    blackId INT NOT NULL,
    blackRating INT,
    result enum('1-0', '1/2-1/2', '0-1'),
    pgn VARCHAR(10000),
    FOREIGN KEY (whiteId) REFERENCES FideIdLookup(playerId),
    FOREIGN KEY (blackId) REFERENCES FideIdLookup(playerId)
)
"""

createFideIdAssociation = """
CREATE TABLE FideIdLookup (
    playerId INT NOT NULL AUTO_INCREMENT,
    fideId VARCHAR(8),
    PRIMARY KEY (playerId),
    FOREIGN KEY (fideId) REFERENCES FidePlayers(id)
)
"""

indexForFasterLookup = """
CREATE INDEX NameIndex ON FidePlayers (lastName, firstName)
"""