import React, { useState, useEffect } from "react";
const Home = () => {


  const [disp, setDisp] = useState([]);
  const [obj, setObj] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userdata, setUserdata] = useState({});

  var transformedObj = {};

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
                else{
                  loadPost();
                }
            });

    const loadPost = async () => {

      await fetch("http://localhost:3001/home", {
        method: "get",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json())
        .then((data) => {
          console.log(data);
          setDisp([data.data[0]]);
          setObj(data.data[1]);
          setCourses(data.data[2]);
          setUserdata(data.data[3]);
        });

    }

    // Call the function

    

  }, []);


  const removeElement = (id) => {

    console.log("Clicked");
    console.log("User data ", userdata);
    console.log("Student id", id);


    fetch("http://localhost:3001/drop", {
      method: "post",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ course_id: id, cur_year: userdata.cur_year, cur_sem: userdata.cur_sem, sid: userdata.id }),
    })
      .then((res) => res.text())
      .then((data) => {
        if (data === "Success") {
          // setplay2(true)
          console.log("deleted");
          const newCourses = courses.filter(
            (c) => c.course_id !== id
          );
          setCourses(newCourses);

        } else {
          // setplay(true);
          window.location.href = "/home";
          console.log("error");
          // document.getElementById("iffailed").innerHTML = "Registeration Failed. Please check the prerequisites of the course."
        }
      });



  };

  // console.log("Okay",disp);
  // console.log("Obj", obj);
  obj.forEach(item => {
    if (!transformedObj[item.year]) {
      // console.log("empty",!transformedObj[str1]);
      transformedObj[item.year] = {};
    }
    // console.log("fmpty",!transformedObj[str1]);

    if (!transformedObj[item.year][item.semester]) {
      transformedObj[item.year][item.semester] = [];
    }

    transformedObj[item.year][item.semester].push(item.course_id);
  });

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

  // console.log("t", transformedObj);

  return (
    <div className="dashboard-container">
      <button onClick={Logout} className="logoutbutton">Logout</button>
      <div className="title-cont">
      <h1>Dashboard</h1>
      </div>
      <div className="stock-container">
        {disp.map((data, key) => {
          return (
            <div key={key}>
              <ol>
                <li>{"Name : " + data.name}</li>
                <li>{"ID : " + data.id}</li>
                <li>{"Department : " + data.dept_name}</li>
                <li>{"Total Credits Taken : " + data.tot_cred}</li>
              </ol>
              <a href="http://localhost:3000/home/registeration">Register</a>
              
            </div>
          );
        })}
      </div>

      <div>
        {Object.keys(transformedObj)
          .sort((a, b) => b - a)
          .map(year => (
            <div key={year}>
              <div className="year-header">
              <h2>{year}</h2>
              </div>
              {Object.keys(transformedObj[year])
                .sort((a, b) => (a < b ? 1 : -1))
                .map(semester => (
                  <table key={semester} border="1">
                    <thead>
                      <tr>
                        <th>Semester</th>
                        <th>Course ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transformedObj[year][semester].map(course_id => (
                        <tr key={course_id}>
                          <td>{semester}</td>
                          <td>{course_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ))}
            </div>
          ))}
      </div>

      <div className="cursem">
        <h3 className="heading">Courses registered for current semester : </h3>
        {courses.map(course => (
          <div key={course.course_id} className="coursedrop">
            <h4>{course.course_id}</h4><button onClick={() => removeElement(course.course_id)}>{"Drop"}</button>
          </div>
        ))}
      </div>
    </div>
  );


};

export default Home;