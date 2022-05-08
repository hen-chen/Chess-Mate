import { Form, Button } from 'react-bootstrap';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Signup.css';

import * as CONSTANTS from '../constants';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const nav = useNavigate();

  const press = async () => {
    const url = `${CONSTANTS.HOST}/users/signup`;
    try {
      const { data } = await axios.post(url, {
        username,
        password,
        email,
      });

      if (data.includes('Success')) {
        // successful registration
        localStorage.setItem('username', username);
        window.alert('Registration successful!');
        nav('/');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="div-center">
      <div className="signup-form">
        <h2 className="appname">Registration</h2>
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
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              className="input"
              type="text"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="dark"
            disabled={!username || !password || !email}
            size="sm"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              press();
            }}
            className="custom-btn-login"
          >
            Register
          </Button>
        </Form>
        <Button
          variant="dark"
          size="sm"
          type="submit"
          href="/login"
          className="custom-btn-signup"
        >
          Already have an account? Log in
        </Button>
      </div>
    </div>
  );
}

export default Register;
