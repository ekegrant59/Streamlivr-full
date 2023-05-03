require('dotenv').config()
const express = require('express') 
const ejs = require('ejs')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const secure = require('express-enforces-ssl')
const userSchema = require('./schema/userSchema')
const adminSchema = require('./schema/adminSchema')
const blogSchema= require('./schema/blogSchema')
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const session = require('express-session')

cloudinary.config({
  cloud_name: "dvk93z9vj",
  api_key: "375594596294432",
  api_secret: "ChVErXDcS7Hgv3EP6S8iQ3SL4AY",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "DEV",
  },
});

const upload = multer({ storage: storage });

const app = express() 
const mongodb = process.env.MONGODB
const secretkey = process.env.SECRET
mongoose.connect(mongodb)
.then(() => {
   console.log('Connection successful')
}).catch((err) => {
    console.log(err, "Connection failed")
})


// app.enable('trust proxy')
// app.use(secure())
app.use('/assets', express.static('assets')) 
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.json())
app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: 'secret',
    })
);

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.get('/', function(req,res){ 
    res.render('index')

})

// app.get('/blog', (req,res)=>{
//     res.render('blog')
// })
// app.post('/newblog', upload.single("picture"), async (req,res)=>{
//     const details = req.body
//     const img = req.file.path
//     // console.log(img)
//     newblog()

//     async function newblog(){
//         try{
//             const blog = new blogSchema({
//                 title: details.title,
//                 date: details.date,
//                 summary: details.summary,
//                 category: details.category,
//                 image: img
//             })
//             await blog.save()
//             req.flash('danger', 'New Blog Added!')
//             res.redirect('/admin/new-blog')
//         } catch(err){
//             console.log(err)
//         }
//     }
// })

// app.get('/edit/:id', async (req,res)=>{
//     const blogID = req.params.id
//     const blog = await blogSchema.findOne({_id: blogID})
//     // console.log(blog)
//     res.render('edit-blog', {blog: blog})
// })

// app.post('/editblog', (req,res)=>{
//     const details = req.body
//     const id = details.id
//     const filter = {_id: id}

//     blogSchema.findOneAndUpdate(filter, {$set: {title: details.title, date: details.date, summary: details.summary, category: details.category}},  {new: true}, (err)=>{
//         if(err){
//             console.log(err)
//         }
//     })
//     req.flash('success', 'Blog Update Succesfully!')
//     res.redirect('back')
// })

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
    try {
        const waitlist = await userSchema.find()
        res.render('admin', {users: waitlist})
    } catch (error) {
        console.log(error)
    }
})

// app.get('/admin/blog',protectRoute, async (req,res)=>{
//     const blog = await blogSchema.find()
//     res.render('admin-blog', {blogs: blog})
// })

// app.get('/admin/new-blog',protectRoute, async (req,res)=>{
//     res.render('new-blog')
// })



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
    adminSchema.findOne({email:email}, (err, details)=>{
        if (!details){
            req.flash("danger", "Incorrect Email")
            res.redirect('/admin')
        } else{
            bcrypt.compare(password, admin.password, async (err,data)=>{
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
                    req.flash('danger', 'Incorrect password ')
                    res.redirect('/admin')
                  }
            })

        }
    })
  }) .catch((err)=>{console.log(err)})
})
const port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`App started on port ${port}`)
} )