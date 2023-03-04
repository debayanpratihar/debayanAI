import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai' //Openapi simplyfies to use 
//To be use dotenv variables
dotenv.config()
//Configuration
const configuration = new Configuration({  //accepts an object
  apiKey: process.env.OPENAI_API_KEY, //Pass an api key
});
//create an instance
const openai = new OpenAIApi(configuration);

//Initilize our express application
const app = express()  // Call like as a function
app.use(cors())  //This allow to use us those cros origin request in allow us our server called form the frontend
app.use(express.json()) //This allow us to pass json form the  frontend to the backend 

//Create a dummy root route (app.get-> received lot of data form front end)
app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Debayan'
  })
})
//(app.post->allow us to have to a body or payload)
app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;//get data form the body of front request

    const response = await openai.createCompletion({ //create a responce or get a responce from open api
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });
// Send it back to the frontend
    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {   //If something goes wrong
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})
//make sure that my server always lisents
app.listen(5000, () => console.log('AI server started on http://localhost:5000'))