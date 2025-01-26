const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, default: 'user' } 
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        try {
            this.password = await bcrypt.hash(this.password, 10); 
            next(); 
        } catch (err) {
            next(err); 
        }
    } else {
        next();
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
