import React, { useState, useEffect } from "react";

function RunningCoursesDept(){
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
            body: JSON.stringify({ general : false , dept_name : window.location.pathname.slice(16).replace("%20"," ")}),
        })
            .then((res) => res.json())
            .then((data) => {
                setData(data)
            });


    }, [])
    if (document.getElementById("curr_list") !== null) {
        document.getElementById("curr_list").innerHTML = '';
        full_data.courses.forEach(item => {
            document.getElementById("curr_list").innerHTML +=  '<li><a href="http://localhost:3000/course/'+item.course_id+'">'+item.title+'</a> </li>'
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
        <div>
            <button onClick={Logout}  className="logoutbutton">Logout</button>
            <h2>Current Courses</h2>
            <ul id="curr_list"></ul>
        </div>
    );
}

export default RunningCoursesDept