import { useState, useEffect } from "react";
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
// import ReactPlayer from "react-player";
import './style.css'

function Reg() {

    const [list, setlist] = useState([]);
    const [course, setCourse] = useState([]);
    const [sec, setSec] = useState([]);
    const [regCourse, setRegCourse] = useState(-1);
    const [play, setplay] = useState(false);
    const [play2, setplay2] = useState(false);

    let temp_course = [];
    let temp_course1 = [];
    let i = 0;
    list.forEach(item => {
        if (!temp_course1.includes(item.course_id)) {
            temp_course1.push(item.course_id);
            temp_course.push({ id: i, name: item.course_id, title: item.title });
            i++;
        }
    })
    let temp_sec = [];
    temp_course.forEach(item1 => {
        let temp = [];
        list.forEach(item2 => {
            if (item1.name === item2.course_id) {
                temp.push(item2.sec_id);
            }
        })
        temp_sec.push(temp);
    })
    useEffect(() => {
        setCourse(temp_course);
        setSec(temp_sec);
        // eslint-disable-next-line
    }, [list])


    const Logout = (e) => {
        e.preventDefault();
        fetch("http://localhost:3001/logout", {
            method: "get",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.text())
            .then((data) => {
                sessionStorage.removeItem("token");
                window.location.href = "/login";
            });

    }

    // console.log('hellp');

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
    });



    const request = async () => {
        await fetch("http://localhost:3001/reg", {
            method: "get",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.text())
            .then((data) => {
                setlist(JSON.parse(data).data)
            });
    }

    useEffect(() => {
        request();

    }, []);


    const handleOnSelect = (item) => {
        // the item selected
        if (document.getElementById("iffailed") !== null) {
            document.getElementById("iffailed").innerHTML = ''
        }

        console.log(course);
        console.log(list)
        console.log(sec[1]);
        for (let index = 0; index < course.length; index++) {
            if (course[index].name === item.name) {
                console.log(regCourse)
                setRegCourse(index);
            }
        }
        console.log(regCourse)
    }


    function Register() {
        var mylist = document.getElementById("dropdown");
        let sec_id_sel = mylist.options[mylist.selectedIndex].text;
        fetch("http://localhost:3001/regcourse", {
            method: "post",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ course: course[regCourse].name, sec: sec_id_sel }),
        })
            .then((res) => res.text())
            .then((data) => {
                if (data === "Success") {
                    setplay2(true)
                    window.location.href = "/home";
                } else {
                    setplay(true);
                    document.getElementById("iffailed").innerHTML = "Registeration Failed. Please check the prerequisites of the course."
                }
            });
    }


    function checkselect() {
        if (regCourse === -1) {
            return;
        }
        else {
            return (
                <>
                    <p><a href={'http://localhost:3000/course/' + course[regCourse].name}>{course[regCourse].name} : {course[regCourse].title}</a></p>
                    <select id="dropdown" className="dropdown" >
                        {sec[regCourse] && sec[regCourse].map((item, index) => {
                            return <option key={item}>{item}</option>
                        })}
                    </select>
                    <button onClick={Register}>Register</button>
                    <p id="iffailed"></p>
                </>
            )

        }
    }

    const formatResult = (item) => {
        console.log(item);
        return (
            <div className="result-wrapper">
                <span className="result-span">{item.name} :</span>
                <span className="result-span"> {item.title}</span>
            </div>
        );
    };



    return (
        <div>
            <button onClick={Logout} className="logoutbutton">Logout</button>
            <div style={{ width: "50%", margin: "0 auto", padding: "50px" }}>

                <ReactSearchAutocomplete
                    items={course}
                    fuseOptions={{ keys: ["title", "name"] }} // Search on both fields
                    resultStringKeyName="name" // String to display in the results
                    formatResult={formatResult}
                    onSelect={handleOnSelect}
                    autoFocus
                />


            </div>



            {/* <ReactPlayer
                // loop={true}true
                url={`https://www.youtube.com/watch?v=BBJa32lCaaY`}
                playing={play}
                onEnded={() => { setplay(false) }}
                width={0}
                height={0}
            /> */}
            {/* <ReactPlayer
                // loop={true}true
                url={`https://www.youtube.com/watch?v=EwYxoZofaOA&t=5s`}
                playing={play2}
                onEnded={() => {
                    window.location.href = "/home";
                }}
                width={0}
                height={0}
            /> */}
            {checkselect()}

        </div>
    );

}

export default Reg;