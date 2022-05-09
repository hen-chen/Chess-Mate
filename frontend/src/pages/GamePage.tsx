/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PgnDisplay from '../components/PgnDisplay';
import * as CONSTANTS from '../constants';
// @ts-ignore
import { parse } from 'pgn-parser';

const GamePage = () => {
  const { id } = useParams();
  const [pgn, setPgn] = useState(null);
  const [headers, setHeaders] = useState<any>({});

  useEffect(() => {
    (async () => {
      const {
        data: { results },
      } = await axios.get(`${CONSTANTS.HOST}/getGame/${id}`);
      const parsed = parse(results[0].pgn)[0];
      setPgn(parsed);
      setHeaders(
        parsed.headers.reduce((a: any, { name, value }: any) => {
          return { ...a, [name]: value };
        }, {}),
      );
    })();
  }, []);

  console.log(headers);

  return (
    <div className="container-sm" style={{ margin: 30, padding: 20 }}>
      {pgn === null ? (
        <div className="spinner-border" />
      ) : (
        <div className="row">
          <div className="col-4">
            <h3>
              {headers['White']} (White {headers['WhiteElo']}) vs.{' '}
              {headers['Black']} (Black {headers['BlackElo']})
            </h3>
            <div>Opening: {headers['Opening']}</div>
            <div>Result: {headers['Result']}</div>
            <div>Termination: {headers['Termination']}</div>
            <div>Time Control: {headers['TimeControl']}</div>
          </div>
          <div className="col-8">
            <PgnDisplay boardLength={400} parsed={pgn} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
