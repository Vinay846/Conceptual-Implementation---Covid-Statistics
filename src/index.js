const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

app.get("/", async (req, res)=>{
    res.send(await connection.find({},{
        "recovered":1,
        _id:0
    }));
})
app.get("/totalRecovered", async (req, res)=>{
    const recoverData = await connection.find({},{
        "recovered":1,
        _id:0
    });
    let total = 0;
    recoverData.forEach(element => {
        total += element.recovered;
    });
    res.send({data: {_id: "total", recovered:total}});
})

app.get("/totalActive", async (req, res)=>{
    const infectedRecoveredData = await connection.find({},{
        "infected":1,
        "recovered":1,
        _id:0
    });
    let total = 0;
    infectedRecoveredData.forEach(element => {
        total += (element.infected - element.recovered);
    });
    res.send({data: {_id: "total", active:total}});
})

app.get("/totalDeath", async (req, res)=>{
    const totalDeathData = await connection.find({},{
        "death":1,
        _id:0
    });
    let total = 0;
    totalDeathData.forEach(element => {
        total += element.death;
    });
    res.send({data: {_id:"total", death:total}});
})

app.get("/hotspotStates", async (req, res)=>{
    const DataForRate = await connection.find({},{
        "infected":1,
        "recovered":1,
        "state":1,
        _id:0
    });
    let rate = [];
    DataForRate.forEach(element => {
        const val = ((element.infected - element.recovered)/element.infected);
        if(val > 0.1){
            rate.push({
                "state":element.state,
                "rate": val.toFixed(5)
            })
        }
    });
    res.send({data: rate});
})

app.get("/healthyStates", async (req, res)=>{
    const mortalityData = await connection.find({},{
        "infected":1,
        "death":1,
        "state":1,
        _id:0
    });
    let mortality = [];
    mortalityData.forEach(element => {
        const val = (element.death/element.infected);
        if(val > 0.005){
            mortality.push({
                "state":element.state,
                "mortality": val.toFixed(5)
            })
        }
    });
    res.send({data: mortality});
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;