import './profile.css';
import { useState,useEffect } from 'react';
import axios from "axios"
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import edit from "../../assets/pencil.png";
import deletes from "../../assets/delete.png";
import {useRef,useContext} from 'react';
import {useNavigate} from "react-router-dom"
import { GlobalContext } from '../../context/context';
import logout from  "../../assets/logout.png"
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {v4} from "uuid"












let baseUrl = ""
if (window.location.href.split(":")[0] === "http") {
  baseUrl = "http://localhost:3000";
  
}
else{
  baseUrl = "https://lazy-pear-caterpillar-slip.cyclic.app"
}


function Profile() {
  axios.defaults.withCredentials = true


  const [data,setData] =useState ("") 
  const [allData,setAllData] =useState ([]) 
  const [show, setShow] = useState(false);
  const [editTweet,setEditTweet] =useState ("") 
  const [editId,setEditId] =useState (null) 
  const [searchId,setSearchId] =useState (null) 
  
  const [searchData,setSearchData] =useState ("") 
  const [show1, setShow1] = useState(false);

  const handleClose = () => setShow1(false);
  const [loadTweet, setLoadTweet] = useState(false)

  const [isSpinner, setIsSpinner] = useState(null)
  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const lastRef = useRef(null);
  let navigate = useNavigate();
  let { state, dispatch } = useContext(GlobalContext);
  const [imageUpload,setImageUpload] =useState (null) 
  console.log("State", state)




  

  if (isSpinner === true) {
    document.querySelector(".spinner-div").style.display = "block"
    
  }
  if (isSpinner === false) {
    document.querySelector(".spinner-div").style.display = "none"


    
  }



  
  const allTweetsHandler=()=>{
    axios.get(`${baseUrl}/api/v1/tweets`,{withCredentials: true})
    .then((response) => {
      console.log(response);
      setAllData(response.data.data)
 
    }, (error) => {
      console.log(error);
    });

 
  }

  
  useEffect(() => {
    allTweetsHandler()
  },[loadTweet])


  const deleteTweetHandler = (ids) =>{
    console.log(ids)
    axios.delete(`${baseUrl}/api/v1/tweet/${ids}`,{withCredentials: true})
    .then(response => {
      console.log("response: ", response);
      setIsSpinner(true)
      setTimeout(() => {
        setIsSpinner(false);
        setLoadTweet(!loadTweet)

    }, 1000);
    })

    .catch(err => {
        console.log("error: ", err);
    })

  }

  const handleData = async (id,names,price,desc) =>{
    setShow(true)
    setLoadTweet(!loadTweet)


    // setEditId(id)
    // setEditName(names)
    // setEditPrice(price)
    // setEditDesc(desc)

    // console.log(editId)
    // console.log(editName)


  }
  const updateTweetHandler = (event) =>{
    setShow(false)
    event.preventDefault()
    let Updatetweet = event?.target?.updateTweetText?.value
      axios.put(`${baseUrl}/api/v1/tweet/${editId}`,{
      text:Updatetweet ,
      
    },{withCredentials: true})
    .then((response) => {
      console.log(response);
      setIsSpinner(true)
      setLoadTweet(!loadTweet)

      setTimeout(() => {
        setIsSpinner(false);

    }, 1500);
     
    }, (error) => {
      console.log(error);
    });

    
  



  }

  const getProductHandlerOnId = () =>{
    setShow1(true)
    axios.get(`${baseUrl}/api/v1/tweet/${searchId}`,{withCredentials: true})
    .then((response) => {
      console.log(response);
      setSearchData(response.data.data)


     
    }, (error) => {
      console.log(error);
    });

  }


  let descEmptyError = document.querySelector(".descEmptyError")
  let descError = document.querySelector(".descLengthError")

  const descHandler = (e) =>{
    if (e.target.value == "") {
      descEmptyError.style.display = "block"
      descError.style.display = "none"

    }

    else{
      descEmptyError.style.display = "none"
      descError.style.display = "none"
    }

  }

  const descLengthError = (e) =>{
    if (e?.target?.value?.length < 3) {
      descError.style.display = "block"
      descEmptyError.style.display = "none"

    }

    else{
      descEmptyError.style.display = "none"
      descError.style.display = "none"
    }

  }

  const logoutHandler = () =>{
    axios.get(`${baseUrl}/api/v1/logout`,{
      withCredentials: true
    })

    .then((response) => {
      console.log(response);
      dispatch({
        type: 'USER_LOGOUT',
        payload: null
    })
    }, (error) => {
      console.log(error);
    });

    
    
  }

  


  

  



  return (
    <div className='main-div'>
      <div className='spinner-div'>
        <div className='spinner'>
        <Spinner animation="grow" variant="danger" />
        </div>
      </div>

      

    <div className='leftPannel'>

      <div className='icons'>
      <p><a href="/"><img src="https://img.icons8.com/fluency/512/twitter.png" alt="twitter logo" height="40" width="40" /></a> </p>
      <p><a href="/profile"><img src="https://img.icons8.com/material-rounded/512/gender-neutral-user.png" alt="profile" title='profile' height="40" width="40" /></a></p> 
      <p><img src={state?.user?.profileImage}  alt='account' height="40" width="40" onClick={logoutHandler} /></p> 


      </div>

    </div>

    <nav className='nav-bar'>
        <h4>{state.user.firstName} {state.user.lastName}</h4>
        <p>{allData.length} Tweets</p>
    </nav>

    <div className='profile-centre-div'> 
        <div className='profile-sec'>
            <div className='coverPhoto'> </div>
             
            <div className='profilePhoto'>
                <img src={state.user.profileImage} alt="" height="150" width="150"/> 

                
            </div>

            <div className='userDetails'>
                <p>{state?.user?.firstName} {state?.user?.lastName}</p>
                <p>@{state?.user?.email}</p>
                <p><img src="https://img.icons8.com/material-sharp/2x/calendar--v2.png" alt="calender logo" height="20" width = "20" />

                <span className='userDate'>Joined {state?.user?.createdOn.split('T')[0]}</span>

                </p>
            </div>

           

        </div> 

    

      <div className='display-div' id='display'>
        {

              (allData && allData?.length !== 0)?
                  <div className='profile-posts-div'>

                
                     { allData.map((eachData,i) => (  
                        <div className='posts' key={i}>
                          <div className='info-div'>
                            <img src={eachData?.profilePhoto} alt="profilePic" width="50" height = "50" />
                            <p>{eachData?.userFirstName} {eachData.userLastName}</p>
                            <p className='date'>.{eachData?.createdOn.split('T')[0]}</p>          
                            <div className='modifying-div'>
                                <img src="https://img.icons8.com/color/2x/delete-forever.png" alt="delete icon" height="25" onClick={()=>{
                                     deleteTweetHandler(eachData?._id)

                                 }} />
                                <img src="https://img.icons8.com/material-sharp/2x/edit--v3.png" title="Edit"  width="30" height="30" onClick={()=>{
                                    handleData(
                                        setEditId(eachData?._id),
                                        setEditTweet(eachData?.text)
                                      
                                    )

                                }}/>
                            </div>                             
                          </div>

                          <div className='text'>   
                            <p>{eachData?.text}</p>                      
                          </div>

                          <div className='tweetImage'>
                            <img src={eachData.image} />

                          </div>
                        

                        </div>

                      
                   
                      ))}

      


                  </div>
              

                :
                null
          
                    

        

              
        }


      

        <div className='modal-div'>
          <Modal
            show={show}
            backdrop="static"
            keyboard={false}
          >
          <Modal.Header>
            <Modal.Title>Update Your Tweet</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form onSubmit={updateTweetHandler} className = "updateForm" >
              
                <label>Tweet Text:</label>
                <textarea name="updateTweetText" id="" cols="80" rows="5" defaultValue={editTweet} required
                 
                ></textarea>
              <Button variant="primary" type='submit' className='updateBtn'>Save Changes</Button>

            </form>


           
          </Modal.Body>

          <Modal.Footer>

          </Modal.Footer>
        </Modal>

        </div>

      </div>


      <div className='onSearchData'>
        
          <Modal
            show={show1}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>Your Data of id: {searchData?.id} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
             
             <p>Name: {searchData?.name}</p>
             <p>Price: {searchData?.price}</p>
             <p>Description: {searchData?.description}</p>

             

            
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Ok.
              </Button>
            </Modal.Footer>
          </Modal>

      </div>

     




      
      </div>
    </div>
    
  );
}

export default Profile;