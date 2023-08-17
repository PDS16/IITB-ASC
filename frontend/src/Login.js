import React, { useState, useEffect } from "react";
import './style.css'

const Login = () => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [auth, setauth] = useState(false);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(username, password);
      fetch("http://localhost:3001/login", {
        method: "post",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      })
        .then((res) => res.text())
        .then((data) => {
          if (data === "Success") {
            // sessionStorage.setItem("token",JSON.parse(data).accessToken);
            window.location.href = "/home";
          } else {
            console.log(data);
          }
        });
  
    };
  
    useEffect(() => {
      // console.log(sessionStorage.getItem("token"))
      fetch("http://localhost:3001/checkauth", {
            method: "get",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message !== "Success") {
                    setauth(false);
                }
                else {
                  setauth(true);
                }
            });
    });
  
    if (!auth) {
      return (
  <>
   <div class="login-container">
      <form action="" className="login-form">
      <h1 className="login-title">Login</h1>
      <label>Username</label>
        <input type="text" className="login-input" placeholder="Username" onChange={(e) => {
              setUsername(e.target.value)
            }}/>
      <label>Password</label>
        <input type="password" className="login-input" placeholder="Password" onChange={(e) => {
              setPassword(e.target.value)
            }}/>
        <button onClick={handleSubmit} type="submit">Login</button>
      </form>
    </div>
  </>
        
      );
    }
    else {
      return (
        <a href="http://localhost:3000/home">Already logged in</a>
      );
    }
  };

  export default Login;