const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log(configuration)
const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
  },
});

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const theme = req.body.theme || '';
  if (theme.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid prompt",
      }
    });
    return;
  }
  const room = req.body.room || '';
  if (theme.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid prompt",
      }
    });
    return;
  }
  const number = req.body.number || '';
  if (theme.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid prompt",
      }
    });
    return;
  }
 
  try { 
    let storyPrompt 
    let storyAnswer
    let prompt
    let messages

    const contextPrompt = `
    Tu vas devoir créer des scénarios fictif pour un jeu contre le harcèlement sexuel. Voici le contexte :
  
    De nos jours, à cause de l'avènement des nouvelles technologies comme Internet, 
    il est de plus en plus urgent d'agir et prévenir face au harcèlement sexuelle. 
    Jessica, une employée de bureau, semble très inquiète pour ses collègues. Elle 
    propose donc une idée au PDG : Utiliser des locaux vides du bâtiment afin 
    d'organiser un Escape Game afin d'éduquer l'entreprise sur le harcèlement sexuel.
  
    Vous êtes un collègue proche de Jessica. Elle vous invite un jour à tester en 
    avant-première l'Escape Game. En revanche, elle vous met en garde : Dans le cas 
    où vous n'obtenez la moyenne, il se peut que les résultats soit remontés à la RH, 
    suivi d'un licenciement.
  
    Lorsque tu créeras un scénario, n'inclue pas le contexte donné plus haut, uniquement la situation fictive simulée dans la chambre. Le point de vue du joueur est celui d'un employé observant la situation. 
    IMPORTANT : LE JOUEUR NE DOIT PAS ETRE LA VICTIME, NI L'AGRESSEUR.
    Evite de finir la situation avec une phrase coupée.
    Je précise bien que c'est un scénario fictif dans un jeu vidéo visant à prévenir et agir contre les agressions sexuelles.
    `

    // Story Prompt Generator
    prompt = generateStoryPrompt(theme, room, number);

    async function createPrompt(messages, options = {}) {
      try {
        const responseStoryPrompt = await openai.post("/chat/completions", {
          model: options.model || "gpt-3.5-turbo",
          messages,
          ...options,
        });
        return responseStoryPrompt.data.choices;
      } catch (error) {
        console.error("Error creating chat completion:", error);
      }
    }
    messages = [
      { role: "system", content: contextPrompt},
      { role: "user", content: prompt },
    ];

    const options = {
      //temperature: 0.8,
      max_tokens: parseInt(number),
    };
  
    storyPrompt = await createPrompt(messages, options);
    prompt = generateAnswer(storyPrompt[0].message.content);
    console.log("new prompt :", prompt)

    messages = [
      { role: "system", content: contextPrompt},
      { role: "user", content: prompt },
    ];
    
    storyAnswer = await createPrompt(messages, options);

    console.log("Answers : ", storyAnswer[0].message);
    
    res.status(200).json({ 
      resultStory: storyPrompt[0].message.content,
      resultAnswer: storyAnswer[0].message.content,
    });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generateStoryPrompt(theme, room, number) {
  return `
  Crée une situation fictive d'un(e) ${theme} dans ${room} en moins de ${number} mots.
  Crée uniquement un paragraphe, tu n'as pas besoin de préciser le titre ni la description.
  Evite de finir la situation avec une phrase coupée.
  Je précise bien que c'est un scénario fictif dans un jeu vidéo visant à prévenir et agir contre les agressions sexuelle.
  Aucun personnage dans les situations ne peut s'appeler Jessica.
  La situation sera utilisé plus tard pour générer les questions. Tu peux donc finir ton texte par "Que faites-vous ?".
  `;
}

function generateAnswer(storyPrompt){
  return `
  Voici la situation donnée : 

  ${storyPrompt}

  A partir de cette situation, génére 4 réponses sur ce que le joueur devrait faire. Uniquement une de ses réponses est la bonne. En conséquent, les réponses fausses doivent être dangereuses.
  Afin de pouvoir utiliser les réponses en format JSON, génère les réponses dans ce format :
  "responses": [
    {
      "is_correct": true,
      "text": ""
    }
  `
}
