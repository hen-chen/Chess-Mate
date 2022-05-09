import { Form, Button } from 'react-bootstrap';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Login.css';

import * as CONSTANTS from '../constants';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const nav = useNavigate();

  const press = async () => {
    const url = `${CONSTANTS.HOST}/users/login`;
    try {
      const { data } = await axios.post(url, {
        username,
        password,
      });

      if (data.includes('Success')) {
        // successful login
        window.localStorage.setItem('username', username);
        nav('/');
      } else {
        window.alert('Incorrect username or password!');
      }
    } catch (err) {
      console.log(err, 'in Press()');
    }
  };

  return (
    <div className="div-center shadow border">
      <div className="login-form">
        <img
          src={require('../pictures/knight.jpeg')}
          style={{
            maxWidth: '100%',
            maxHeight: '70%',
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <h3 className="appname">Login to Chess Mate</h3>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              className="input"
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              className="input"
              id="password"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button
            disabled={!username || !password}
            variant="dark"
            size="sm"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              press();
            }}
            className="custom-btn-login"
          >
            Log in
          </Button>
        </Form>

        <Button
          variant="dark"
          size="sm"
          type="submit"
          href="/register"
          className="custom-btn-signup"
        >
          Create account
        </Button>
      </div>
    </div>
  );
}

export default Login;
