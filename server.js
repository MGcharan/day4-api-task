const express=require("express");
const mongoose=require("mongoose")
const bodyParser=require("body-parser")


const Mentor=require("./Mentor")
const Student=require("./student")



const app=express();


const PORT=process.env.PORT;
const DB_URL=process.env.DB_URL;
app.use(bodyParser.json());





mongoose.connect(DB_URL,{})
.then(()=>console.log("Mongoose connected"))
.catch((err)=>console.log("Mongoose could not connected",err))



app.post("/mentor", async(req,res)=>{
        try{
                const mentor=new Mentor(req.body)
                await mentor.save()
                res.status(201).send(mentor)

        }
        catch(err){
                res.status(400).send(err.message);

        }

})

app.post("/student", async(req,res)=>{
        try{
                const student=new Student (req.body)
                await student.save()
                res.status(201).send(student)

        }
        catch(err){
                res.status(400).send(err.message);

        }

})

// assign
app.post("/mentor/:mentorId/assign",async(req,res)=>{
        try{
                const mentor=await Mentor.findById(req.params.mentorId);
                const students=await Student.find({_id:{$in:req.body.students}})
                students.forEach((student)=>{
                        student.cMentor=mentor._id
                        student.save()
                });
                mentor.students=[...mentor.students,...students.map((student)=>student._id)]
                await mentor.save()
                res.send(mentor)
        }catch(err){
                res.status(404).send(err)
        }
});

app.put("/student/:studentId/assignMentor/:mentorId",async(req,res)=>{
        try{
                const student=await Student.findById(req.params.studentId)
                const nMentor=await Mentor.findById(req.params.mentorId);
                if(student.cMentor){
                        student.pMentor.push(student.cMentor)
                }
                
                student.cMentor=nMentor._id;
                await student.save()
                res.send(student);

        } catch(err){
                res.status(404).send(err)
        }
});

app.get("/mentor/:mentorId/students",async(req,res)=>{
        try{
                const mentor=await Mentor.findById(req.params.mentorId).populate("students");
                res.send(mentor.students)
        }
        catch(err){
                res.status(400).send(err)
        }
})

app.get("/mentor/:mentorId/pMentor",async(req,res)=>{
        try{
                const mentor=await Mentor.findById(req.params.mentorId).populate("pMentor");
                res.send(mentor.students)
        }
        catch(err){
                res.status(400).send(err)
        }
})






app.listen(PORT,(req,res)=>{
        console.log("server is running successfully Port:",PORT)
})

