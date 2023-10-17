import express, { Request, Response } from 'express';
import { RedisCache } from './cache-client';
import { PlanetSchema } from './model/planets';
const planets = require('./planets.json')
const app = express();
app.use(express.json());
const cache = new RedisCache(31556952); // set to one year
const { client } = cache;

app.get('/healthcheck', (req, res) => res.send('Hello'))

const apiRouter = express.Router();

app.use('/api', apiRouter);

apiRouter.get('/planets', async (req: Request, res: Response) => {
  try {
    const results = await client.hGetAll('planets');
    res.status(200).json(results)
  } catch (err) {
    res.status(404).send('Not found')
  }
})

apiRouter.get('/planets/:name', async (req: Request, res: Response) => {
  try {
    const result = client.hmGet('planets', req.params.name);
    res.status(200).json(result)
  } catch (err) {
    res.status(404).send('Not found')
  }
})

apiRouter.put('/planets/:name', async (req: Request, res: Response) => {
  const { body } = req;
    try {
        const data = PlanetSchema.validateSync(body, { abortEarly: false, stripUnknown: true });
        try {
          await client.hSet('planets', req.params.name, JSON.stringify(data));
          return res.status(201).json({ message: 'Success', data });
        } catch (e) {
          return res.status(500).send('Error writing to cache.');
        }
      } catch (error) {
        //@ts-ignore
        // const error = e as ValidationError;
        return res.status(400).json({ errors: error.errors });
      }
})

apiRouter.delete('/planets/:name', async (req: Request, res: Response) => {
  try {
    await client.hDel('planets', req.params.name);
    res.status(200).send()
  } catch (err) {
    res.status(404).send('Not found')
  }
})

const start = async function() {
    await client.connect();
    console.log('Connected to redis.');
    for (let i = 0; i < planets.length; i++) {
      await client.hSet('planets', planets[i].name, JSON.stringify(planets[i])); 
    };
    app.listen(8081, () => {
        console.log('Listening on port 8081')
    });
}
  
start();

module.exports = app;

