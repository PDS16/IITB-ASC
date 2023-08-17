import React, { useState, useEffect } from "react";

function Courses() {
    const [full_data, setData] = useState({})
    let course_id = window.location.pathname.slice(8);
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
                if (data.message !== "Success") {
                    window.location.href = '/pleaselogin'
                }
            });
        fetch("http://localhost:3001/course", {
            method: "post",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ course_id: course_id }),
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.msg === "Invalid course"){
                    window.location.href = '/home';
                }
                setData(data)
                console.log(full_data.curr_courses)

            });

        // eslint-disable-next-line
    }, [])
    if (document.getElementById("prereq") !== null) {
        document.getElementById("prereq").innerHTML = '';
        full_data.prereq.forEach(item => {
            document.getElementById("prereq").innerHTML += '<li><a href="http://localhost:3000/course/' + item.course_id + '">' + item.course_id + ":" + item.title + '</a> </li>'
        })
    }
    if (document.getElementById("instructor") !== null) {
        document.getElementById("instructor").innerHTML = '';
        full_data.instructors.forEach(item => {
            document.getElementById("instructor").innerHTML += '<li><a href="http://localhost:3000/instructor/' + item.id + '">' + item.name + ' </li>'
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
            <h1>{full_data.title}</h1>
            <h2>{full_data.course_id}</h2>
            <h2>Credits : {full_data.credits}</h2>
            <h2>Prereqs :</h2>
            <ul id="prereq"></ul>
            <h2>Instructors for this sem</h2>
            <ul id="instructor"></ul>
        </>

    );
}

export default Courses