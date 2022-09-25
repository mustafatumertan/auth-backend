const {success, error, validation} = require("../../helpers/responseApi");
const {randomString} = require("../../helpers/common");
const User = require("../../models/user");
const Verification = require("../../models/verification");

/**
 * @desc    Forgot user password
 * @method  POST api/password/forgot
 * @access  public
 */
exports.forgot = async (req, res) => {

    const {email} = req.body;

    // Check the email
    if (!email)
        return res.status(422).json(validation([{msg: "Email is required"}]));

    try {

        const user = await User.findOne({email: email.toLowerCase()});
        
        // Check the user
        if (!user)
            return res.status(404).json(error("User not found", res.statusCode));

        // If user exists
        // We're gonna make a new verification data
        let verification = await Verification.findOne({
            userId: user._id,
            type: "Forgot Password"
        });

        // But, we're gonna check if the previous verification data still exists or not
        // If it does not exist, make a new verification data
        if (verification) {
            verification = await Verification.findByIdAndRemove(verification._id);
        }

        // Create a new verification data
        let newVerification = new Verification({
            token: randomString(50),
            userId: user._id,
            type: "Forgot Password"
        });
        
        // Save the verification data
        await newVerification.save();

        // Send the response
        res.status(201).json(
            success(
                "Forgot password verification has been set",
                {verification: newVerification},
                res.statusCode
            )
        );

    } catch (err) {
        console.log(err.message);
        res.status(500).json(error("Server error", res.statusCode));
    }
}

const bcrypt = require("bcryptjs");

/**
 * @desc    Resetting user password
 * @method  POST api/password/reset
 * @access  public
 */
exports.reset = async (req, res) => {

    const {token, password} = req.body;

    // Check the token first
    if (!token)
        return res.status(422).json(
            validation(
                [{msg: "Token is required"}]
            ));

    // Check the password
    if (!password)
        return res.status(422).json(
            validation(
                [{msg: "Password is required"}]
            ));
    
    try {

        let verification = await Verification.findOne({
            token,
            type: "Forgot Password"
        });

        // Check the verification data
        if (!verification)
            return res.status(400).json(error("Token/Data is not valid", res.statusCode));

        // If there is a verification data, find the user
        let user = await User.findById(verification.userId);

        // Check the user, just in case
        if (!user)
            return res.status(404).json(error("User not found", res.statusCode));

        // If those conditions all passed
        // Let's update the password
        // Don't forget to hash the password using bcrypt
        let hash = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, hash);

        // Finally, update the user password
        user = await User.findByIdAndUpdate(user._id, {
            password: hashedPassword
        });

        // Delete the verification data
        verification = await Verification.findByIdAndRemove(verification._id);

        // Send the response
        res.status(200)
        .json(success("Password has been updated", null, res.statusCode));

    } catch (err) {
        console.log(err.message);
        res.status(500).json(error("Server Error", res.statusCode));
    }

    

}