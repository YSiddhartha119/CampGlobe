const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /@gmail\.com$/i.test(v);
            },
            message: 'Only Gmail addresses (@gmail.com) are allowed to register.'
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    }
});

UserSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model('User', UserSchema);