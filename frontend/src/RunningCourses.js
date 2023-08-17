import React, { useState, useEffect } from "react";

function RunningCourses(){
    const [full_data, setData] = useState({})
    useEffect(() => {
        fetch("http://localhost:3001/checkauth", {
            method: "get",
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.message !== "Success")
              {
                window.location.href = '/pleaselogin'
              }
            });
        fetch("http://localhost:3001/coursesrunning", {
            method: "post",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ general : true }),
        })
            .then((res) => res.json())
            .then((data) => {
                setData(data)
            });


    }, [])
    if (document.getElementById("curr_list") !== null) {
        document.getElementById("curr_list").innerHTML = '';
        full_data.dept_name.forEach(item => {
            document.getElementById("curr_list").innerHTML +=  '<li><a href="http://localhost:3000/course/running/'+item+'">'+item+'</a> </li>'
        })
    }
    const Logout = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/logout", {
          method: "get",
          credentials : 'include',
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.text())
          .then((data) => {
            window.location.href = "/login";
          });
        
      }
    return (
        <>
            <button onClick={Logout} className="logoutbutton">Logout</button>
            <h2>Departments Offering courses in Current Semester</h2>
            <ul id="curr_list"></ul>
        </>
    );
}

export default RunningCourses