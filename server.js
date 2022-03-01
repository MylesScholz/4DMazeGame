const express = require('express')
const { engine } = require('express-handlebars')
const fs = require('fs')

const port = process.env.PORT || 3000;
const app = express()

app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(express.json())

/*
app.all('*', (req, res, next) => {
    console.log('req.method:', req.method)
    console.log('req.path:', req.path)
    next()
})
*/

app.use(express.static('public'));

app.get('/', (req, res, next) => {
    let highscores = JSON.parse(fs.readFileSync('./highscores.json'))
    res.status(200).render('menuPage', {
        highscores: highscores
    })
})

app.post('/save', (req, res, next) => {
    let state = JSON.parse(fs.readFileSync('./state.json'))
    state.name = req.body.name
    for (let i = 0; i < 4; i++) {
        state.size[i] = parseInt(req.body.size[i])
    }
    fs.writeFileSync(__dirname + '/state.json', JSON.stringify(state, null, 4))

    const mazeJSON = {
        "size": state.size,
        "slice": [0, 0],
        "rows": [],
        "stacks": []
    }
    for (let i = 0; i < mazeJSON.size[0]; i++) {
        const rowJSON = {
            "tiles": []
        }
        for (let j = 0; j < mazeJSON.size[1]; j++) {
            const tileJSON = {
                "coordinate": [i, j]
            }
            rowJSON.tiles.push(tileJSON)
        }
        mazeJSON.rows.push(rowJSON)
    }
    for (let i = 0; i < mazeJSON.size[3]; i++) {
        const stackJSON = {
            "w": i,
            "tiles": []
        }
        for (let j = 0; j < mazeJSON.size[2]; j++) {
            const multiplier = 92.5 / (mazeJSON.size[2] - 1)
            const tileJSON = {
                "z": j,
                "offset": multiplier*j + 10
            }
            stackJSON.tiles.push(tileJSON)
        }
        mazeJSON.stacks.push(stackJSON)
    }
    fs.writeFileSync(__dirname + '/maze.json', JSON.stringify(mazeJSON, null, 4))
    
    res.status(200).send('Game state stored.')
})

app.get('/maze', (req, res, next) => {
    let maze = JSON.parse(fs.readFileSync('./maze.json'))
    res.status(200).render('mazePage', maze)
})

app.post('/slice', (req, res, next) => {
    let maze = JSON.parse(fs.readFileSync('./maze.json'))
    maze.slice = [req.body.z, req.body.w]
    fs.writeFile(__dirname + '/maze.json', JSON.stringify(maze, null, 4), (err) => {
        if (!err) {
            res.status(200).send('Slice updated.')
        } else {
            res.status(500).send('Slice failed to update.')
        }
    })
})

app.post('/win', (req, res, next) => {
    let state = JSON.parse(fs.readFileSync('./state.json'))
    state.time = req.body.time
    state.seconds = req.body.seconds

    fs.writeFile(__dirname + '/state.json', JSON.stringify(state, null, 4), (err) => {
            if (!err) {
                res.status(200).send("Win state stored.")
            } else {
                res.status(500).send("Win state failed to store.")
            }
        }
    )
})

app.post('/update', (req, res, next) => {
    let state = JSON.parse(fs.readFileSync('./state.json'))
    let highscores = JSON.parse(fs.readFileSync('./highscores.json'))
    let index = 5
    for (let i = 4; i >= 0; i--) {
        let highscore = 9999
        if (highscores[i].seconds) {
            highscore = highscores[i].seconds
        }
        if (state.seconds < highscore) {
            index = i
        }
    }
    if (index != 5) {
        let name = state.name
        if (name == '') {
            name = 'Anonymous'
        }
        const highscoreJSON = {
            "name": name,
            "time": state.time,
            "seconds": state.seconds,
            "size": state.size.join(' x ')
        }
        highscores.splice(index, 0, highscoreJSON)
        highscores.pop()
    }

    fs.writeFile(__dirname + '/highscores.json', JSON.stringify(highscores, null, 4), (err) => {
        if (!err) {
            res.status(200).send("Highscores stored.")
        } else {
            res.status(500).send("Highscores failed to store.")
        }
    })
})

app.get('/maze.json', (req, res, next) => {
    let maze = JSON.parse(fs.readFileSync('./maze.json'))
    res.status(200).send(maze)
})

app.get('*', (req, res, next) => {
    console.log("Path that does not exist requested")
    res.status(404).render('404Page')
})

app.listen(port, () => {
    console.log("Listening on port 3000.")
})