var express = require('express')
var session = require('express-session')
const { MongoClient } = require('mongodb')

var mongoClient = require('mongodb').MongoClient
var url = 'mongodb://127.0.0.1:27017'

var app = express()

app.set('view engine','hbs')
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: 'my secrete !@#$$%%@@$%$@#%%@#%##',
    resave: false
}))

app.get('/logout',(req,res)=>{
    req.session.userName = null
    req.session.save((err)=>{
        req.session.regenerate((err2)=>{
            res.redirect('/')
        })
    })
})

function isAuthenticated(req,res,next){
    let chuaDangNhap = !req.session.userName
    if(chuaDangNhap)
        res.redirect('/')
    else
        next()
}

app.post('/register',async (req,res)=>{
    let name = req.body.txtName
    req.session.userName = name
    //kiem tra trong database
    let server = await MongoClient.connect(url)
    let dbo = server.db("ATNToys")
    let result = await dbo.collection("users").find({$and :[{'name':name}]}).toArray()
    if(result.length >0){
        //res.render('profile',{'name': req.session.userName})
        res.redirect('/profile')
    }else{
        res.write('khong hop le')
        res.end()
    }    
})

app.get('/profile',isAuthenticated, (req,res)=>{
    res.render('profile',{'name': req.session.userName,'sId':req.session.id})
})

app.get('/',(req,res)=>{
    let accessCount = req.session.accessCount || 0
    accessCount++
    req.session.accessCount = accessCount
    let chuaDangNhap = !req.session.userName
    res.render('home',{'accessCount':accessCount,'chuaDangNhap':chuaDangNhap})
})

const PORT = process.env.PORT || 5000
app.listen(PORT )
console.log('Server is running!')

