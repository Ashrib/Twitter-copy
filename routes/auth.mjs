import express from 'express'
import {userModel,otpModel} from './dbmodels.mjs'
import {
    stringToHash,
    varifyHash,
} from "bcrypt-inzi"
import jwt from "jsonwebtoken"
import { nanoid, customAlphabet } from 'nanoid'
import moment from 'moment';
import sgMail from "@sendgrid/mail"


const SECRET = process.env.SECRET || "mySecret"
const router = express.Router()
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ||"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"
// const API_KEY = "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"
sgMail.setApiKey(SENDGRID_API_KEY)

router.post("/signup", (req, res) => {

    let body = req.body;

    if (!body.firstName
        || !body.lastName
        || !body.email
        || !body.password
    ) {
        res.status(400).send(
            `required fields missing, request example: 
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    req.body.email = req.body.email.toLowerCase();

    // check if user already exist // query email user
    userModel.findOne({ email: body.email }, (err, user) => {
        if (!err) {
            console.log("user: ", user);

            if (user) { // user already exist
                console.log("user already exist: ", user);
                res.status(400).send({ message: "User already exist, Please try a different email" });
                return;

            } else { // user not already exist

                // bcrypt hash
                stringToHash(body.password).then(hashString => {

                    userModel.create({
                        firstName: body.firstName,
                        lastName: body.lastName,
                        email: body.email,
                        profileImage:body.profileImage,
                        password: hashString
                    },
                        (err, result) => {
                            if (!err) {
                                console.log("data saved: ", result);
                                res.status(201).send({ message: "user is created" });
                            } else {
                                console.log("db error: ", err);
                                res.status(500).send({ message: "Internal server error" });
                            }
                        });
                })

            }
        } else {
            console.log("db error: ", err);
            res.status(500).send({ message: "db error in query" });
            return;
        }
    })
});

router.post("/login", (req, res) => {

    let body = req.body;
    body.email = body.email.toLowerCase();

    if (!body.email || !body.password) { // null check - undefined, "", 0 , false, null , NaN
        res.status(400).send(
            `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                    "password": "12345"
                }`
        );
        return;
    }

    // check if user exist
    userModel.findOne(
        { email: body.email },
        "firstName lastName email password",
        (err, data) => {
            if (!err) {
                console.log("data: ", data);

                if (data) { // user found
                    varifyHash(body.password, data.password).then(isMatched => {

                        console.log("isMatched: ", isMatched);

                        if (isMatched) {

                            const token = jwt.sign({
                                _id: data._id,
                                email: data.email,
                                iat: Math.floor(Date.now() / 1000) - 30,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                            }, SECRET);

                            console.log("token: ", token);

                            res.cookie('Token', token, {
                                maxAge: 86_400_000,
                                httpOnly: true,
                                sameSite:'none',
                                secure:true,
                                
                            });
                           
                           
                            res.send({
                                message: "login successful",
                                profile: {
                                    email: data.email,
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    _id: data._id,
                                }
                            });
                            return;
                        } else {
                            console.log("password did not match");
                            res.status(401).send({ message: "Incorrect email or password" });
                            return;
                        }
                    })

                } else { // user not already exist
                    console.log("user not found");
                    res.status(401).send({ message: "Incorrect email or password" });
                    return;
                }
            } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "login failed, please try later" });
                return;
            }
        })
})

router.get("/logout", (req, res) => {
    res.cookie('Token', '', {
        maxAge: 1,
        httpOnly: true,
        path:"/"
    });

    res.send({ message: "Logout successful" });

})


router.post('/forget-password', async (req, res) => {
    try {

        let body = req.body;
        body.email = body.email.toLowerCase();

        if (!body.email) { // null check - undefined, "", 0 , false, null , NaN
            res.status(400).send(
                `required fields missing, request example: 
                {
                    "email": "abc@abc.com",
                }`
            );
            return;
        }

        // check if user exist
        const user = await userModel.findOne(
            { email: body.email },
            "firstName lastName email",
        ).exec()

        if (!user) throw new Error("User not found")

        const nanoid = customAlphabet('1234567890', 5)
        const OTP = nanoid();
        const otpHash = await stringToHash(OTP)

        console.log("OTP: ", OTP);
        console.log("otpHash: ", otpHash);

       
        // TODO: send otp via email // postMark sendGrid 
        const msg = {
            to: body.email, // Change to your recipient
            from: 'cocobutter128@gmail.com', // Change to your verified sender
            subject: 'Verify your OTP',
            text: OTP,
            html: `<strong>${OTP}</strong>`,
          }
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')
              res.send({
                message: "OTP sent success",
            });
            otpModel.create({
                otp: otpHash,
                email: body.email, 
            });
            })
            .catch((error) => {
              console.error(error)
            })
        
        
        
      

     
       
        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send({
            message: error.message
        })
    }



})

export default router