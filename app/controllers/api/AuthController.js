const {success, error, validation} = require("../../helpers/responseApi");
const {randomString} = require("../../helpers/common");
const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const Verification = require("../../models/verification");

/**
 * @desc    REgister a new user
 * @method  POST api/auth/register
 * @access  public
 */
exports.register = async(req, res) => {

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json(validation(errors.array()));
    
    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({email: email.toLowerCase()});

        // Check the user email
        if (user)
            return res.status(422).json(validation({msg: "Email already registered"}));

        let newUser = new User({
            name,
            email: email.toLowerCase().replace(/\s+/, ""),
            password
        });
        
        // Hash the password
        const hash = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, hash);

        // Save the user
        await newUser.save();

        // Save token for user to start verifying the account
        let verification = new Verification({
            token: randomString(50),
            userId: newUser._id,
            type: "Register New Account"
        });

        // Save the verification data
        await verification.save();

        // Send the response to server
        res.status(201).json(
            success( "Register success, please activate your account.", 
            {
                user: {
                  id: newUser._id,
                  name: newUser.name,
                  email: newUser.email,
                  verified: newUser.verified,
                  verifiedAt: newUser.verifiedAt,
                  createdAt: newUser.createdAt,
                },
                verification,
              },
              res.statusCode
            )
          );

    } catch (err) {
        console.error(err.message);
        res.status(500).json(error("Server error", res.statusCode));
    }
};

/**
 * @desc    Verify a new user
 * @method  GET api/auth/verify/:token
 * @access  public
 */
exports.verify = async (req, res) => {

    const {token} = req.params;

    try {
        let verification = await Verification.findOne({
            token,
            type: "Register New Account"
        });

        // Check the verification data
        if (!verification)
            return res.status(404).json(error("No verification data found", res.statusCode));

        // If verification data exists
        // Get the user data
        // and activate the account
        let user = await User.findOne({_id: verification.userId}).select("-password");
        user = await User.findByIdAndUpdate(user._id, {
            $set: {
                verified: true,
                verifiedAt: new Date()
            }
        });

        // After user successfully verified
        // Remove the verification data from the database
        verification = await Verification.findByIdAndRemove(verification._id);

        // Send the response
        res.status(200).json(
            success(
                "Your account was verified succesfully",
                null,
                res.statusCode
            )
        );


    } catch (err) {
        console.log(err);
        res.status(500).json(error("Server Error", res.statusCode));
    }



};