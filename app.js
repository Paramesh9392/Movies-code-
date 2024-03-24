const express = require('express')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const databasePath = path.join(_dirname, 'moviesdata.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)

    process.exit(1)
  }
}

initializeDbAndServer()

const ConvertMOvieDbObjTOResponseObj = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId : dbObj.director_id,
    movieName : dbObj.movie_name,
    leadActor : dbObj.lead_actor,
  }
}

const convertDirectorObjToResponseObj = (dbobj) => {
  return {
    directorId: dbobj.director_id,
    directorName: dbobj.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
  SELECT
   movie_name
  FROM
   movie;`

  const moviesArray = await database.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMoviesQuery = `
  INSERT INTO
   movie (directorId ,movie_name ,lead_actor)
   VALUES (${directorId} ,'${movieName}', '${leadActor}');`

  await database.run(postMoviesQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const getMovieQuery = `
  SELECT
   *
  FROM
   movie
  WHERE 
    movie_id = '${movieId}';`

  const movie = await database.all(getMovieQuery)
  response.send(ConvertMOvieDbObjTOResponseObj(movie))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body

  const {movieId} = request.params

  const upadateQuery = `
  UPDATE
    movie
  SET 
    director_id =${directorId},
    movie_name ='${movieName}',
    lead_actor ='${leadActor}'
  
  WHERE 
    movie_id =${movieId};`;

  await database.run(upadateQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const deleteQuery = `
  DELETE
  FROM
   movie
  WHERE 
   movie_id =${movieId};`

  await database.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getdirectorsQuery = `
  SELECT
   *
  FROM
   director;`

  const directorArray = await database.all(getdirectorsQuery)
  response.send(
    directorArray.map(eachDirector =>
      convertDirectorObjToResponseObj(eachDirector),
    ),
  )
})

app.get('/directors/:directorsId/movies/', async (request, response) => {
  const {directorId} = request.params

  const getDirectorMovieQuery = `
  SELECT
   movie_name
  FROM
   movie
  WHERE 
    director_id = '${directorId}';`

  const moviesArray = await database.all(getDirectorMovieQuery)
  response.send(
    moviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

module.exports = app
