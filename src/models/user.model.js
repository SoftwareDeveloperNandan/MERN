import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //Cloudnary cloud url
            required: true,
        },
        coverImage: {
            type: String, //cloudnary url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "video"
            }
        ],
        password: {
            type: String, //challenge task
            required: [true, "Password is required!!!"]
        },
        refreshToken: {
            type: String
        }
    },{timestamps: true})


    userSchema.pre("save", async function(next) {
        if (!this.isModified("password")) return next();

        this.password = await bcrypt.hash(this.password, 10);
        next();
    });

    userSchema.methods.isPasswordCorrect = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    userSchema.methods.generateAccessToken = function() {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                password: this.password,
                fullname: this.fullname
            },
            process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: process.env.ACCESS_TOKEN_EXPIRIES
            }
        );
    };
    // We will generate refreshToken
    userSchema.methods.generateRefreshToken = function() {
        return jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,{
                expiresIn: process.env.REFRESH_TOKEN_EXPIRIES
            }
        );
    };

export const User = mongoose.model("User", userSchema);
