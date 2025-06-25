import mongoose from 'mongoose';


const contactSchmea = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  subject:{
    type:String,
    required:true
  },
  message:{
     type:String,
    required:true
  }
})


export default mongoose.models.contact ||  mongoose.model('contact', contactSchmea); 