const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const { v4: uuidv4 } = require('uuid');


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'Delta_app',
  password: '1234567',
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// let data = [];
// for (let i = 1; i <= 100; i++) {
//   data.push(getRandomUser());
// }

// Generate the placeholders for bulk insert
// let placeholders = data.map(() => '(?, ?, ?, ?)').join(', ');

// let q = `INSERT INTO user (id, username, email, password) VALUES ${placeholders}`;

// let flattenedData = data.flat(); // Flatten the array of arrays into a single array

// connection.query(q, flattenedData, (err, result) => {
//   if (err) {
//     console.error("Error executing query:", err);
//     return;
//   }
//   console.log("Insert result:", result);
// });

// connection.end();

//home route
app.get("/",(req,res)=>{
  let q=`SELECT count(*) FROM user`;
  // res.send("Welcome to home page.");
  try{
      connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]['count(*)'];
       
       res.render("home.ejs",{count});
    
    });
}catch(err){
  console.log(err);
  res.send("some error in DB.");
  
}

});

//Show route
app.get("/user",(req,res)=>{
  let q=`SELECT * FROM user`;
  try{
    connection.query(q, (err,users) => {
    if (err) throw err;
    // console.log(result);
    // res.send(result);
    res.render("showusers.ejs",{users});
     });
}catch(err){
console.log(err);
res.send("some error in DB.");}
});
//Edit route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = ?`; // Use placeholder
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      console.log(result);
      res.render("edit.ejs", { user: result[0] }); // Pass the user data to the template
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

app.patch("/user/:id",(req,res)=>{
  let { id } = req.params;
  let {password:formPassword,username:newUsername}=req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`; // Use placeholder
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user=result[0];
      if(formPassword!=user.password){
        res.send("WRONG Password!");
      }
      else{
        let q2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2,(err,result)=>{
          if (err) throw err;
          res.redirect("/user");
        });

      }
     
      
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

//new user
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post('/user/new', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
      return res.status(400).send('All fields are required');
  }

  const id = faker.string.uuid(); // Generate a unique ID
  const sql = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;

  connection.query(sql, [id, username, email, password], (err, result) => {
      if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
              return res.status(409).send('Email already exists');
          }
          console.error(err);
          return res.status(500).send('Error inserting data');
      }
      console.log("User added successfully");
      res.redirect("/user");
  });
});



// app.post("/user/new", (req, res) => {
//   let { username, email, password } = req.body;
//   let id = id = faker.string.uuid(); 
//   //Query to Insert New User
//   let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

//   try {
//     connection.query(q, (err, result) => {
//       if (err) throw err;
//       console.log("added new user");
//       res.redirect("/user");
//     });
//   } catch (err) {
//     res.send("some error occurred");
//   }
// });



app.listen("8080",()=>{
    console.log("server is listening to port 8080.");
});
