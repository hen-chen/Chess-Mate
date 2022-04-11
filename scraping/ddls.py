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
    seanAt BIGINT,
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

createLichessGames = """
CREATE TABLE LichessGames(
    id VARCHAR(8) NOT NULL,
    date VARCHAR(10), # support partial dates like 1862.??.??
    time VARCHAR(8), # HH:MM:SS
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
    id VARCHAR(8), # fide id can be 7 or 8 char?
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
    worldRankActivePlayers INT,
    nationalRankAllPlayers INT,
    nationalRankActivePlayers INT,
    PRIMARY KEY (id)
)
"""

createFideGames = """
CREATE TABLE FideGames(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date VARCHAR(10),
    time VARCHAR(8),
    eco VARCHAR(4),
    whiteId VARCHAR(8),
    whiteRating INT,
    blackId VARCHAR(8),
    blackRating INT,
    result enum('1-0', '1/2-1/2', '0-1'),
    pgn VARCHAR(10000),
    FOREIGN KEY (whiteId) REFERENCES FidePlayers(id),
    FOREIGN KEY (blackId) REFERENCES FidePlayers(id)
)
"""

