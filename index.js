var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")

const app = express()

app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))

// You should put the server URL here
mongoose.connect('localhost:3000')

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

app.post("/sign_up",(req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var phno = req.body.phno;
    var password = req.body.password;

    db.collection('users').findOne({ email: email }, (err, user) => {
        if (err) {
            throw err;
        }

        if (user) {
            
            res.send('<script>alert("Email already exists. Please use a different email."); window.location.href="/"</script>');
        } else {
            
            var data = {
                "name": name,
                "email": email,
                "phno": phno,
                "password": password
            }

            db.collection('users').insertOne(data, (err, collection) => {
                if (err) {
                    throw err;
                }
                console.log("Record Inserted Successfully");
                return res.redirect('signup_sucess.html');
            });
        }
    });
});

app.get("/update", (req, res) => {
    res.sendFile(__dirname + "/update.html");
});

app.post("/update_user", (req, res) => {
    var email = req.body.email;
    var newPassword = req.body.newPassword;
    var newEmail = req.body.newEmail;
    var newName = req.body.newName;
    var newPhno = req.body.newPhno;

    var query = { email: email };
    var update = {
        $set: {
            password: newPassword,
            email: newEmail,
            name: newName,
            phno: newPhno
        }
    };
    db.collection('users').updateOne(query, update, (err, result) => {
        if (err) {
            throw err;
        }
        console.log("Record Updated Successfully");
        return res.redirect('update_success.html');
    });
});

app.get("/delete", (req, res) => {
    res.sendFile(__dirname + "/delete.html");
});

app.post("/delete_user", (req, res) => {
    var emailToDelete = req.body.email;

    var query = { email: emailToDelete };

    db.collection('users').deleteOne(query, (err, result) => {
        if (err) {
            throw err;
        }

        if (result.deletedCount > 0) {
            console.log("Record Deleted Successfully");
            return res.redirect('delete_success.html');
        } else {
            console.log("No matching record found for deletion");
            return res.redirect('delete_failure.html');
        }
    });
});

app.get("/dashboard", (req, res) => {
    res.sendFile(__dirname + "/dashboard.html");
});

app.get("/get_user", (req, res) => {
    console.log("Fetching user data...");
    db.collection('users').find({}).toArray((err, users) => {
        if (err) {
            console.error('Error fetching user data:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('User data:', users);
        res.json(users);
    });
});


app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
}).listen(3000);


console.log("Listening on PORT 3000");

