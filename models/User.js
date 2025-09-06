import mongoose from 'mongoose';


const machineSchema = new mongoose.Schema({
  
  status:{
    type:String,
    default:"online"
  },
  longitude:{
    type:String,
    default:"0"
  },
  latitude:{
    type:String,
    default:"0"
  },
  machineName:{
    type:String,
    required:true,
  },
  machineCode:{
    type:String,required:true
  },
  machineType:{
    type:String,
    required:true,
    enum:["pravaah","tarang","drishti","doordrishti"]
  },
  depth:{
    type:String,
    required:true,
    default:'10.18'
  }
})

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: false, // Not required for OAuth users
  },
  image: {
    type: String, // Original image from OAuth
  },
  profileImage: {
    type: String, // Custom uploaded profile image
  },
  coverImage: {
    type: String, // Custom uploaded cover image
  },
  bio: {
    type: String,
    default: 'Flood detection enthusiast and environmental advocate.',
  },
  location: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  provider: {
    type: String,
    default: 'credentials',
  },
  notifications: {
    email: { type: Boolean, default: true },
    app: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  machines: {
  type: [machineSchema],
  default: []
}

});

export default mongoose.models.User || mongoose.model('User', UserSchema); 