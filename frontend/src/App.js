import { BrowserRouter as Router, Routes, Route }
  from 'react-router-dom';
import Reg from "./Reg";
import Courses from "./Courses";
import Instructors from "./Instructor";
import RunningCourses from "./RunningCourses";
import RunningCoursesDept from "./RunningCoursesDept";
import PleaseLogin from "./PleaseLogin";
import Home from "./Home";
import Login from "./Login";

function App() {

  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Login />} />
        <Route exact path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route exact path='/home/registeration' element={<Reg />} />
        <Route exact path='/course/:id' element={<Courses />} />
        <Route exact path='/course/running' element={<RunningCourses />} />
        <Route exact path='/course/running/:id' element={<RunningCoursesDept />} />
        <Route exact path='/instructor/:id' element={<Instructors />} />
        <Route exact path='/pleaselogin' element={<PleaseLogin />} />

      </Routes>
    </Router>
  );

}

export default App;
