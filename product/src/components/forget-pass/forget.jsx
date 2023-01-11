import axios from "axios"
import { useState } from "react";




let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}

else{
  baseUrl = "https://lazy-pear-caterpillar-slip.cyclic.app"
}


function ForgetPass() {
    const [verifyEmail, setVerifyEmail] = useState(null)

    const OtpRequestHandler = (()=>{
        axios.post(`${baseUrl}/api/v1/forget-password`, {
            email:verifyEmail,
          },{ withCredentials: true })

          .then((response) => {
            console.log(response.data.message);
          }, (error) => {
            console.log(error);    
          });
      

    }) 


    return(
        <div>
            <input type="email" placeholder="Enter Email" onChange={(e) =>{
                setVerifyEmail(e.target.value)
            }}/>
            <button onClick={OtpRequestHandler}>Send OTP</button>

        </div>
     
    )

}

export default ForgetPass