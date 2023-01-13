import "./signup.css"
import { useState,useRef } from 'react';
import axios from "axios"
import {useNavigate} from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css';
import Toast from 'react-bootstrap/Toast';

let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}
else{
    baseUrl = "https://delightful-houndstooth-seal.cyclic.app"
  }

function Signup() {
    axios.defaults.withCredentials = true

    const firstRef = useRef(null);
    const secondRef = useRef(null);
    const thirdRef = useRef(null);
    const fourthRef = useRef(null);
    const [firstName,setFirstName] =useState ("") 
    const [lastName,setLastName] =useState ("") 
    const [email,setEmail] =useState ("") 
    const [password,setPassword] =useState ("") 
    const [showError,setShowError] = useState (""); 
    let navigate = useNavigate();




    const signUpHandler = (event)=>{
        event.preventDefault()
        let alertDiv = document.getElementById("alert")

        axios.post(`${baseUrl}/api/v1/signup`, {
            firstName: firstName,
            lastName: lastName,
            email:email,
            password:password
          })

          .then((response) => {
            console.log(response);
            event.target.reset();
            navigate("/")
            

          }, (error) => {
            console.log(error);
            console.log(error.message)
            alertDiv.style.display = "flex";
            setShowError(error.message);
          });
    }
    const closeHandler = () =>{
        let alertDiv = document.getElementById("alert")
        alertDiv.style.display = "none";
      }

    return (

        <div className='main-div'>
            <div className="error-alert" id="alert">
            <Toast >
            <Toast.Header closeButton={false}>
              <strong className="me-auto">Error</strong>
              <small className="err-close" onClick={closeHandler} closeButton={false}>X</small>
            </Toast.Header>
            <Toast.Body>{showError}</Toast.Body>
          </Toast>

          </div>

            <div className='content-div'>
                <h3>Register</h3>
                <form onSubmit={signUpHandler}>
                    <div className="names-inp">
                        <input ref={firstRef} type="text" placeholder="First Name" required onChange={(e) =>{
                            setFirstName(e.target.value)

                        }} />
                        <input ref={secondRef} type="text" placeholder="last Name" required onChange={(e) =>{
                            setLastName(e.target.value)

                        }} />

                    </div>

                    
                    <input ref={thirdRef} className="inp-email" type="email" placeholder="Enter Email" required onChange={(e) =>{
                            setEmail(e.target.value)

                        }} />
                    <input ref={fourthRef} type="password" placeholder="Enter Password" required onChange={(e) =>{
                            setPassword(e.target.value)

                        }} />
                    <div className="btn-div">
                    <button className="signup-btn" type="submit">Sign UP</button>
                    </div>
                </form>
                <a href="/">Already have an account? Login</a>

            </div>
          
        </div>
      );


}


export default Signup;