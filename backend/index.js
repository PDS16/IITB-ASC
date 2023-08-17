const express = require("express");
const app = express();
const cookie = require("cookie-parser")
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secret = 'secret';
const cors = require("cors");
const corsOptions = {
    origin: true,
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

let curr_sem = { sem: 'Spring', year: '2010' }

var sess;

app.use(cors(corsOptions)) // Use this after the variable declaration

// const pas = ['00128','12345','19991','23121','44553','45678','54321','55739','70557','76543','76653','98765','98988'];
// for (i=0 ; i<13;i++){
//     var password = pas[i];

// bcrypt.genSalt(saltRounds, function(err, salt) {
//   bcrypt.hash(password, salt, function(err, hash) {
//             // Store hash in database here
//             console.log("(\'",password,"\'",",","\'",hash,"\')");
//    });
// });
// }

// Middleware
app.use(cookie())
app.use(bodyParser.json());
app.use(
    session({
        secret: "secretKey",
        resave: false,
        saveUninitialized: false,
    })
);

// Connect to postgresql
const { Client } = require("pg");
const config = require('./config.json')
const client = new Client(config);

client.connect();

// Login Route
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    client.query(
        "SELECT hashed_password FROM user_password WHERE id = '" + username + "'",
        (err, result) => {
            if (err) {
                res.status(500).send("Internal Server Error");
            } else if (result.rows.length === 0) {
                res.status(401).send("Invalid Credentials");
            } else {
                bcrypt.compare(password, result.rows[0].hashed_password, (err, resul) => {
                    if (err) {
                        console.log(err)
                        res.status(500).send("Internal Server Error");
                    } else if (!resul) {
                        console.log("oops!");
                        res.status(401).send("Invalid Credentials");
                    } else {
                        console.log("verified");
                        const token = jwt.sign({ username: username }, secret, { expiresIn: '2h' });
                        res.cookie('token', token, {
                            httpOnly: false,
                        })
                        res.send("Success");
                    }
                });
            }
        }
    );

});

app.get("/logout", (req, res) => {
    res.clearCookie('token')
    res.send('loged out');

});
// Home Route
app.get("/home", (req, res) => {


    const verified = jwt.verify(req.cookies.token, "secret");
    // console.log(verified.username);
    req.id = { username: verified.username }; //if verified the token will be decoded and the username of the user will be extracted and passed.
    // console.log(req.id.username);


    var main_obj = [];
    var cur_year = "";
    var cur_sem = "";
    var user_name = req.id.username;

    client.query(
        "SELECT id, dept_name, name, tot_cred FROM student WHERE id = $1", [req.id.username],
        (err, result) => {
            // console.log(result.rows);
            if (err) {
                res.status(500).send("Internal Server Error");
            } else if (result.rows.length === 0) {
                res.status(401).send("Invalid Credentials");
            } else {
                // console.log(result.rows[0]);
                main_obj.push(result.rows[0]);
                client.query(
                    "select year, semester, course_id from takes as T, student as S where T.id = S.id and S.id = $1 group by year, semester, course_id order by year desc;", [req.id.username],
                    (err, result) => {
                        // console.log(result.rows);
                        if (err) {
                            res.status(500).send("Internal Server Error");
                        } else if (result.rows.length === 0) {
                            res.status(401).send("Invalid Credentials");
                        } else {
                            // console.log(result.rows[0]);
                            main_obj.push(result.rows);
                            // console.log(main_obj);
                            // res.send(main_obj);
                            // q2 = true;
                            // console.log(q2);
                            client.query(
                                "select * from reg_dates order by start_time desc;",
                                (err, result) => {
                                    // console.log(result.rows);
                                    if (err) {
                                        res.status(500).send("Internal Server Error");
                                    } else if (result.rows.length === 0) {
                                        res.status(401).send("Invalid Credentials");
                                    }
                                    else {
                                        var tp_obj = {}

                                        // console.log("Current sem ", result.rows[0]);
                                        cur_year = result.rows[0].year;
                                        cur_sem = result.rows[0].semester;

                                        tp_obj.cur_sem = cur_sem;
                                        tp_obj.cur_year = cur_year;
                                        tp_obj.id = user_name;

                                        // console.log(cur_year);
                                        // console.log(cur_sem);
                                        // console.log(user_name);                                    

                                        client.query(
                                            "select course_id from takes where year = $1 and semester = $2 and id = $3;", [cur_year, cur_sem, user_name],
                                            (err, result) => {
                                                // console.log("inside the last query");
                                                if (err) {
                                                    res.status(500).send("Internal Server Error");
                                                } else if (result.rows.length === 0) {
                                                    var emp_arr = []
                                                    main_obj.push(emp_arr);
                                                    main_obj.push(tp_obj);
                                                    res.send(main_obj);
                                                } else {
                                                    // console.log("Current sem courses",result.rows);
                                                    main_obj.push(result.rows);
                                                    main_obj.push(tp_obj);
                                                    // console.log(main_obj);
                                                    res.json({ data: main_obj });

                                                }
                                            }
                                        );

                                        // res.send(main_obj);



                                    }
                                }
                            );
                            // res.send(main_obj);
                        }
                    }
                );
            }
        }
    );




});

app.post("/drop", (req, res) => {
    // const authHeader=req.header('authorization');

    // console.log(authHeader);

    // console.log(req.body);

    const cur_year = req.body.cur_year;
    const cur_sem = req.body.cur_sem;
    const course_id = req.body.course_id;
    const user_name = req.body.sid;


    const verified = jwt.verify(req.cookies.token, "secret");
    // console.log(verified.username);
    req.id = { username: verified.username }; //if verified the token will be decoded and the username of the user will be extracted and passed.
    // console.log(req.id.username);


    // var todrop = false


    // console.log("Course ID",course_id);
    // console.log(cur_year);
    // console.log(cur_sem);
    // console.log(user_name);


    client.query(
        "delete from takes where id=$1 and course_id=$3 and semester=$4 and year = $2", [user_name, cur_year, course_id, cur_sem],
        (err, result) => {
            // console.log(result.rows);
            if (err) {
                res.status(500).send("Internal Server Error");
            } else if (result.rows.length === 0) {
                res.status(401).send("Invalid Credentials");
            } else {
                // console.log(result.rows[0]);
                // main_obj.push(result.rows);
                // console.log(main_obj);
                // q2 = true;
                // console.log(q2);
                res.send("Success");
            }
        }
    );








    //check token
    // if(authHeader==null){
    //     return res.status(401).json({error:"Access-denied"});
    // }


    // try{}catch (e){
    //     res.status(401).json({error:"Invalid-token"});
    // }

});


app.get("/reg", (req, res) => {

    const verified = jwt.verify(req.cookies.token, "secret");
    req.id = { username: verified.username }; //if verified the token will be decoded and the username of the user will be extracted and passed.

    let myPromise = new Promise(function (myResolve, myReject) {
        // "Producing Code" (May take some time)
        client.query(
            "select * from reg_dates order by start_time desc;",
            (err, result) => {
                // console.log(result.rows);
                if (err) {
                    res.status(500).send("Internal Server Error");
                    myReject();
                } else if (result.rows.length === 0) {
                    res.status(401).send("Invalid Credentials");
                    myReject();
                }
                else {
                    // console.log("Current sem ",result.rows[0]);
                    curr_sem.year = result.rows[0].year;
                    curr_sem.sem = result.rows[0].semester;
                    myResolve();
                }
                // when successful
                // when error
            });
    });

    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise.then(
        function (value) {
            client.query(
                "Select course_id, sec_id , title from section  natural join course where semester='" + curr_sem.sem + "' and year=" + curr_sem.year + " except select course_id, sec_id, title from takes natural join course where semester='" + curr_sem.sem + "' and year=" + curr_sem.year + " and id = '" + verified.username + "'",
                (err, result) => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                    }
                    else {
                        res.send(JSON.stringify({ data: result.rows }))
                    }
                }
            );
        },
        function (error) { /* code if some error */ }
    );




});

app.post("/regcourse", (req, res) => {
    const course = req.body.course;
    const sec = req.body.sec;
    let prereq_satis = true;
    const verified = jwt.verify(req.cookies.token, "secret");
    const courses_taken = []

    let myPromise = new Promise(function (myResolve, myReject) {
        // "Producing Code" (May take some time)
        client.query(
            "select * from reg_dates order by start_time desc;",
            (err, result) => {
                // console.log(result.rows);
                if (err) {
                    res.status(500).send("Internal Server Error");
                    myReject();
                } else if (result.rows.length === 0) {
                    res.status(401).send("Invalid Credentials");
                    myReject();
                }
                else {
                    // console.log("Current sem ",result.rows[0]);
                    curr_sem.year = result.rows[0].year;
                    curr_sem.sem = result.rows[0].semester;
                    myResolve();
                }
                // when successful
                // when error
            });
    });

    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise.then(
        function (value) {
            client.query(
                // "select prereq_id from prereq where course_id = '"+course+"';",
                "select course_id from takes where id = '" + verified.username + "' and grade<>'F'",
                (err, result) => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                    } else {
                        result.rows.forEach(item => {
                            courses_taken.push(item.course_id);
                        });
                        client.query(
                            "select prereq_id from prereq where course_id = '" + course + "';",
                            (err, result) => {
                                if (err) {
                                    res.status(500).send("Internal Server Error");
                                } else {
                                    result.rows.forEach(item => {
                                        prereq_satis = prereq_satis && courses_taken.includes(item.prereq_id);
                                    });
                                    if (prereq_satis) {
                                        client.query(
                                            "INSERT INTO takes VALUES ('" + verified.username + "', '" + course + "','" + sec + "','" + curr_sem.sem + "'," + curr_sem.year + ",null);",
                                            (err, result) => {
                                                if (err) {
                                                    res.status(500).send("Internal Server Error");
                                                } else {
                                                    res.send("Success");
                                                }
                                            }
                                        );
                                    } else {
                                        res.send("Failed");
                                    }
                                }
                            }
                        )
                    }
                }
            )

        },
        function (error) { /* code if some error */ }
    );




});

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

app.get("/checkauth", (req, res) => {

    const authHeader = req.cookies.token

    //check token
    if (authHeader === null) {
        return res.json({ message: "Access-denied" });
    }
    //check validity
    try {
        const verified = jwt.verify(authHeader, "secret");
        req.id = { username: verified.username }; //if verified the token will be decoded and the username of the user will be extracted and passed.
        res.json({ message: "Success" });

    } catch (e) {
        res.json({ message: "Invalid-token" });
    }

});

app.post("/instructor", (req, res) => {
    const instructor_id = req.body.instructor_id;
    let response = { curr_courses: [], prev_courses: [] }

    let myPromise = new Promise(function (myResolve, myReject) {
        // "Producing Code" (May take some time)
        client.query(
            "select * from reg_dates order by start_time desc;",
            (err, result) => {
                // console.log(result.rows);
                if (err) {
                    res.status(500).send("Internal Server Error");
                    myReject();
                } else if (result.rows.length === 0) {
                    res.status(401).send("Invalid Credentials");
                    myReject();
                }
                else {
                    // console.log("Current sem ",result.rows[0]);
                    curr_sem.year = result.rows[0].year;
                    curr_sem.sem = result.rows[0].semester;
                    myResolve();
                }
                // when successful
                // when error
            });
    });

    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise.then(
        function (value) {
            client.query(
                // "select prereq_id from prereq where course_id = '"+course+"';",
                "select name, dept_name from instructor where id = '" + instructor_id + "'",
                (err, result) => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                    } else if (result.rows.length === 0) {
                        res.json({ msg: "Invalid course" });
                    } else {
        
                        response.name = result.rows[0].name;
                        response.dept_name = result.rows[0].dept_name;
                        client.query(
                            "select distinct course_id,year,semester,title from teaches natural join course where id = '" + instructor_id + "' order by course_id;",
                            (err, result) => {
                                if (err) {
                                    res.status(500).send("Internal Server Error");
                                } else {
                                    result.rows.forEach(item => {
                                        if (item.year === curr_sem.year && item.semester === curr_sem.sem) {
                                            response.curr_courses.push(item);
                                        } else {
                                            response.prev_courses.push(item);
                                        }
                                    });
                                    response.curr_courses.sort(GetSortOrder("course_id"));
                                    res.json(response);
                                }
                            }
                        )
                    }
                }
            )
        
        
        },
        function (error) { /* code if some error */ }
    );





});

app.post("/course", (req, res) => {
    const course_id = req.body.course_id;
    let response = { instructors: [], prereq: [] }

    let myPromise = new Promise(function (myResolve, myReject) {
        // "Producing Code" (May take some time)
        client.query(
            "select * from reg_dates order by start_time desc;",
            (err, result) => {
                // console.log(result.rows);
                if (err) {
                    res.status(500).send("Internal Server Error");
                    myReject();
                } else if (result.rows.length === 0) {
                    res.status(401).send("Invalid Credentials");
                    myReject();
                }
                else {
                    // console.log("Current sem ",result.rows[0]);
                    curr_sem.year = result.rows[0].year;
                    curr_sem.sem = result.rows[0].semester;
                    myResolve();
                }
                // when successful
                // when error
            });
    });

    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise.then(
        function (value) {
            client.query(
                // "select prereq_id from prereq where course_id = '"+course+"';",
                "select * from course where course_id = '" + course_id + "'",
                (err, result) => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                        // reject();
                    } else if (result.rows.length === 0) {
                        res.json({ msg: "Invalid course" });
                    } else {
                        response.course_id = course_id;
                        response.title = result.rows[0].title;
                        response.credits = result.rows[0].credits;
                        client.query(
                            // "select prereq_id from prereq where course_id = '"+course+"';",
                            "Select course_id,title from (select prereq_id as course_id from prereq where course_id='" + course_id + "') as t natural join course",
                            (err, result) => {
                                if (err) {
                                    res.status(500).send("Internal Server Error");
                                    // reject();
                                } else {
                                    response.prereq = result.rows;
                                    client.query(
                                        // "select prereq_id from prereq where course_id = '"+course+"';",
                                        "select id,name from (select distinct id from teaches where course_id='" + course_id + "' and year='" + curr_sem.year + "' and semester='" + curr_sem.sem + "') as t natural join instructor",
                                        (err, result) => {
                                            if (err) {
                                                res.status(500).send("Internal Server Error");
                                                // reject();
                                            } else {
                                                response.instructors = result.rows;
                                                res.json(response);
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }
                }
            )
        },
        function (error) { /* code if some error */ }
    );





});

app.post("/coursesrunning", (req, res) => {
    const general = req.body.general;
    const dept_name = req.body.dept_name
    let response = {}

    let myPromise = new Promise(function (myResolve, myReject) {
        // "Producing Code" (May take some time)
        client.query(
            "select * from reg_dates order by start_time desc;",
            (err, result) => {
                // console.log(result.rows);
                if (err) {
                    res.status(500).send("Internal Server Error");
                    myReject();
                } else if (result.rows.length === 0) {
                    res.status(401).send("Invalid Credentials");
                    myReject();
                }
                else {
                    // console.log("Current sem ",result.rows[0]);
                    curr_sem.year = result.rows[0].year;
                    curr_sem.sem = result.rows[0].semester;
                    myResolve();
                }
                // when successful
                // when error
            });
    });

    // "Consuming Code" (Must wait for a fulfilled Promise)
    myPromise.then(
        function (value) {
            client.query(
                // "select prereq_id from prereq where course_id = '"+course+"';",
                "Select course_id,dept_name,title from (select distinct course_id, year, semester from section where semester= '" + curr_sem.sem + "' and year='" + curr_sem.year + "') as t natural join course",
                (err, result) => {
                    if (err) {
                        res.status(500).send("Internal Server Error");
                        // reject();
                    } else {
                        if (general) {
                            response.dept_name = []
                            result.rows.forEach(item => {
                                if (!response.dept_name.includes(item.dept_name)) {
                                    response.dept_name.push(item.dept_name);
                                }
                            })
                        } else {
                            response.courses = []
                            result.rows.forEach(item => {
                                if (item.dept_name === dept_name) {
                                    response.courses.push(item);
                                }
                            })
                        }
                        res.json(response);
                    }
                }
            )
        
        },
        function (error) { /* code if some error */ }
    );




});
// Start the Server
app.listen(3001, () => {
    console.log("Server Started on Port 3001");
});