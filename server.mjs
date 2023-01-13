import express from "express"
import path from 'path';
import cors from 'cors';
import mongoose from "mongoose"
import cookieParser from "cookie-parser";
import authApis from './routes/auth.mjs'
import productApis from './routes/product.mjs';
import jwt from 'jsonwebtoken';
import {
    stringToHash,
    varifyHash,
} from "bcrypt-inzi"
import { userModel,otpModel } from './routes/dbmodels.mjs'
import sgMail from "@sendgrid/mail"





const SECRET = process.env.SECRET || "mySecret";
const app = express();
const port = process.env.PORT || 3000;
const mongodbURI = process.env.mongodbURI || "mongodb+srv://dbuser1:123mypassword@cluster0.m20zxpk.mongodb.net/dbuser1?retryWrites=true&w=majority"
mongoose.connect(mongodbURI);
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:3001', '*'],
    credentials: true

}));

app.use('/api/v1', authApis)
app.use('/api/v1',(req, res, next) => {

    console.log("req.cookies: ", req.cookies);

    if (!req?.cookies?.Token) {
        res.status(401).send({
            message: "include http-only credentials with every request"
        })
        return;
    }

    jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
        if (!err) {

            console.log("decodedData: ", decodedData);

            const nowDate = new Date().getTime() / 1000;

            if (decodedData.exp < nowDate) {

                res.status(401);
                res.cookie('Token', '', {
                    maxAge: 1,
                    httpOnly: true
                });
                res.send({ message: "token expired" })

            } else {

                console.log("token approved");

                req.body.token = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})
app.use("/api/v1",productApis)

const getUser = async (req, res) => {

    let _id = "";
    if (req.params.id) {
        _id = req.params.id
    } else {
        _id = req.body.token._id
    }

    try {
        const user = await userModel.findOne({ _id: _id }, "email firstName lastName -_id profileImage createdOn password").exec()
        if (!user) {
            res.status(404).send({})
            return;
        } else {
            res.status(200).send(user)
        }

    } catch (error) {

        console.log("error: ", error);
        res.status(500).send({
            message: "something went wrong on server",
        });
    }
}


app.get('/api/v1/profile', getUser)
app.get('/api/v1/profile/:id', getUser)

app.post('/api/v1/change-password', async (req, res) => {

    try {
        const body = req.body;
        const currentPassword = body.currentPassword;
        const newPassword = body.password;
        const _id = req.body.token._id

        // check if user exist
        const user = await userModel.findOne(
            { _id: _id },
            "password",
        ).exec()

        if (!user) throw new Error("User not found")

        const isMatched = await varifyHash(currentPassword, user.password)
        if (!isMatched) throw new Error("Invalid Password")

        const newHash = await stringToHash(newPassword);

        await userModel.updateOne({ _id: _id }, { password: newHash }).exec()

        // success
        res.send({
            message: "password changed success",
        });
        return;

    } catch (error) {
        console.log("error: ", error);
        res.status(500).send(error.message)
    }

})



const __dirname = path.resolve();
app.use('/', express.static(path.join(__dirname, './product/build')))
app.use('*', express.static(path.join(__dirname, './product/build')))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
