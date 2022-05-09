import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Player } from '../interfaces/Player';
import SimilarRatingHist from './SimilarRatingHist';

const PlayerResults = (result: Player): JSX.Element => {
  return (
    <>
      <h3>Background:</h3>
      {result.bio && <p className="h5">Bio: {result.bio}</p>}
      {result.country && <p className="h5">Country: {result.country}</p>}
      {result.firstName && <p className="h5">First Name: {result.firstName}</p>}
      {result.lastName && <p className="h5">Last Name: {result.lastName}</p>}
      {result.createdAt && (
        <p className="h5">
          Created Date: {new Date(result.createdAt).toString()}
        </p>
      )}
      <p className="h5">
        {' '}
        Verified:
        {result.isVerified ? (
          <span aria-label="Check" role="img">
            ✅
          </span>
        ) : (
          <span aria-label="X" role="img">
            ❌
          </span>
        )}
      </p>
      {result.title && <p className="h5">Created: {result.title}</p>}
      {result.totalPlayTime ? (
        <p className="h5">
          Hours played: {Math.ceil(result.totalPlayTime / 3600)}
        </p>
      ) : (
        '0 Hours'
      )}

      <h3>
        <u>
          <i>Ratings</i>
        </u>
      </h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>FIDE Rating</th>
            <th>USCF Rating</th>
            <th>ECF Rating</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.fideRating || '-'}</td>
            <td>{result.uscfRating || '-'}</td>
            <td>{result.ecfRating || '-'}</td>
          </tr>
        </tbody>
      </Table>

      <h2>Games</h2>
      <Link to={`/games/${result.id}`}>View Games</Link>

      <h3>
        <u>
          <i>Bullet Games</i>
        </u>
      </h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Bullet Rating</th>
            <th>Games Played</th>
            <th>Provisional</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.bulletRating || '-'}</td>
            <td>{result.bulletNumGames || '-'}</td>
            <td>
              {result.bulletIsProvisional ? (
                <span aria-label="Check" role="img">
                  ✅
                </span>
              ) : (
                <span aria-label="X" role="img">
                  ❌
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>

      <h3>
        <u>
          <i>Blitz Games</i>
        </u>
      </h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Blitz Rating</th>
            <th>Games Played</th>
            <th>Provisional</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.blitzRating || '-'}</td>
            <td>{result.blitzNumGames || '-'}</td>
            <td>
              {result.blitzIsProvisional ? (
                <span aria-label="Check" role="img">
                  ✅
                </span>
              ) : (
                <span aria-label="X" role="img">
                  ❌
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>

      <h3>
        <u>
          <i>Rapid Games</i>
        </u>
      </h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Rapid Rating</th>
            <th>Games Played</th>
            <th>Provisional</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.rapidRating || '-'}</td>
            <td>{result.rapidNumGames || '-'}</td>
            <td>
              {result.rapidIsProvisional ? (
                <span aria-label="Check" role="img">
                  ✅
                </span>
              ) : (
                <span aria-label="X" role="img">
                  ❌
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>

      <h3>
        <u>
          <i>Classical Games</i>
        </u>
      </h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Classical Rating</th>
            <th>Games Played</th>
            <th>Provisional</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{result.classicalRating || '-'}</td>
            <td>{result.classicalNumGames || '-'}</td>
            <td>
              {result.classicalIsProvisional ? (
                <span aria-label="Check" role="img">
                  ✅
                </span>
              ) : (
                <span aria-label="X" role="img">
                  ❌
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>
      <hr></hr>
      <SimilarRatingHist id={result.id} />
    </>
  );
};

export default PlayerResults;
