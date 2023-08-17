import React, { useState, useEffect } from "react";

function sem(s) {
    if (s === "Spring")
    return 1;
    else if (s === "Summer")
    return 2;
    else if  (s === "Fall")
    return 3;
    else if  (s === "Winter")
    return 4;
    return -1;
}

function Instructors() {
    const [full_data, setData] = useState({})
    let instructor_id = window.location.pathname.slice(12);
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
        fetch("http://localhost:3001/instructor", {
            method: "post",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ instructor_id: instructor_id }),
        })
            .then((res) => res.json())
            .then((data) => {
                if(data.msg === "Invalid course"){
                    window.location.href = '/home';
                }
                setData(data)
                // console.log(full_data.curr_courses)
                // console.log(full_data.prev_courses)
                
            });

            console.log(full_data.prev_courses)
    // eslint-disable-next-line
    }, [])

    if (document.getElementById("curr_list") !== null) {
        document.getElementById("curr_list").innerHTML = '';
        full_data.curr_courses.forEach(item => {
            document.getElementById("curr_list").innerHTML += '<li><a href="http://localhost:3000/course/' + item.course_id + '">' + item.course_id + ":" + item.title + '</a> </li>'
        })
    }
    if (document.getElementById("prev_list") !== null) {
        document.getElementById("prev_list").innerHTML = '';
        full_data.prev_courses.sort(function(a,b){
            if(a.year === b.year){
                return sem(b.sem)-sem(a.sem);
            }
            else if (a.year < b.year){
                return 1;
            }
            return -1;
        })
        full_data.prev_courses.forEach(item => {
            document.getElementById("prev_list").innerHTML += '<li><a href="http://localhost:3000/course/' + item.course_id + '">' + item.course_id + ":" + item.title + '</a> </li>'
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
            <h1>{full_data.name}</h1>
            <h2>{full_data.dept_name}</h2>
            <h2>Current Courses</h2>
            <ul id="curr_list"></ul>
            <h2>Previous Courses</h2>
            <ul id="prev_list"></ul>
        </>
    );
}

export default Instructors;