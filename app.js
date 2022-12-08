require('dotenv').config()
const express = require('express') 
const ejs = require('ejs')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const secure = require('express-enforces-ssl')
const userSchema = require('./userSchema')
const adminSchema = require('./adminSchema')

const app = express() 
const mongodb = process.env.MONGODB
const secretkey = process.env.SECRET
mongoose.connect(mongodb)
.then(() => {
   console.log('Connection successful')
}).catch((err) => {
    console.log(err, "Connection failed")
})


app.enable('trust proxy')
app.use(secure())
app.use('/assets', express.static('assets')) 
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


app.get('/', function(req,res){ 
    res.render('index')

})
app.post('/waitlist', (req,res)=>{
    const details = req.body
    // console.log(details)
    // console.log(req)

    run()
    async function run(){
        try {
            const users = new userSchema({
                name: details.name,
                email: details.email,
                category: details.category
            })
            await users.save()
        }
        catch (err) {
            console.log(err.message)
        
        }
    }

    // res.redirect('/')
})

// app.get('/register', (req,res)=>{
//     res.render('register')
// })

// app.post('/register', async(req,res)=>{
//     const regInfo = req.body
//   const password = regInfo.password

//   const salt = await bcrypt.genSalt(10)
//   const hashedPassword = await bcrypt.hash(password, salt)

//     run()
//     async function run(){
//         try {
//             const admin = new adminSchema({
//                 email: regInfo.email,
//                 password: hashedPassword
//             })
//             await admin.save()
//         }
//         catch (err) {
//             console.log(err.message)
        
//         }
//     }

//     res.redirect('/admin')
// })

app.get('/admin',protectRoute, async (req,res)=>{
    const waitlist = await userSchema.find()
    res.render('admin', {users: waitlist})
})

function protectRoute(req, res, next){
    const token = req.cookies.token
    try{
        const user = jwt.verify(token, secretkey)

        req.user = user
        // console.log(req.user)
        next()
    }
    catch(err){
        res.clearCookie('token')
        return res.render('login')
    }
}

app.post('/login', (req,res)=>{
    const loginInfo = req.body
  // console.log(loginInfo)
  const email = loginInfo.email
  const password = loginInfo.password

  adminSchema.findOne({email})
  .then((admin)=>{
    // console.log(renter)
    bcrypt.compare(password, admin.password, async (err,data)=>{
      if(err){
        console.log(err)
      } else{
          // console.log(data)

          if(data){
            const payload = {
                user: {
                    user: admin.email
                }
            }
  
            const token = jwt.sign(payload, secretkey, {
                expiresIn: '3600s'
            } )
            
            res.cookie('token', token, {
                httpOnly: false
            })
  
            res.redirect('/admin')
          } else{
            res.redirect('/admin')
          }

      }
    })
  })
  .catch((err)=>{console.log(err)})
})
const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`App started on port ${port}`)
} )