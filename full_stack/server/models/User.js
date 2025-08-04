const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    name: {type: String, require: true},
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    profile_image: {type: String},
    profile_image_id: {type: String},
    uid: {type: String, unique: true},
    auth_type: {
        type: String,
        enum: ["google", "facebook", "microsoft", "direct"],
        default: "google",
        require: true,
    },
    role: {
        type: String,
        enum: ["admin", "user", "content"],
        default: "user",
    },
}, {timestamps: true});

// Add auto-increment plugin to uid
// userSchema.plugin(AutoIncrement, {inc_field: 'uid'});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.matchPassword = function(password){
    return bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("User", userSchema);