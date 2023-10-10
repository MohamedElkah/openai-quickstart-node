import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
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
  let storyPrompt 
  let storyAnswer
  try { // Story Prompt Generator
    const completionStoryPrompt = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: generateStoryPrompt(theme, room, number),
      max_tokens: parseInt(number), // Use max_tokens to control the number of words
    });
    storyPrompt = completionStoryPrompt.data.choices[0].text;
    const completionAnswer = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: generateAnswer(storyPrompt),
      max_tokens: parseInt(number), // Use max_tokens to control the number of words
    });
    storyAnswer = completionAnswer.data.choices[0].text;
    res.status(200).json({ 
      resultStory: completionStoryPrompt.data.choices[0].text,
      resultAnswer: completionAnswer.data.choices[0].text,
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
  

  console.log("Prompt : ", generateStoryPrompt(theme, room, number))
  console.log("Prompt Result : ", storyPrompt)
  console.log("Prompt for Answer : ", generateAnswer(storyPrompt))
  console.log("Answer Result : ")
}

function generateStoryPrompt(theme, room, number) {
  return `
  De nos jours, à cause de l'avènement des nouvelles technologies comme Internet, 
  il est de plus en plus urgent d'agir et prévenir face au harcèlement sexuelle. 
  Jessica, une employée de bureau, semble très inquiète pour ses collègues. Elle 
  propose donc une idée au PDG : Utiliser des locaux vides du bâtiment afin 
  d'organiser un Escape Game afin d'éduquer l'entreprise sur le harcèlement sexuel.

  Vous êtes un collègue proche de Jessica. Elle vous invite un jour à tester en 
  avant-première l'Escape Game. En revanche, elle vous met en garde : Dans le cas 
  où vous n'obtenez la moyenne, il se peut que les résultats soit remontés à la RH, 
  suivi d'un licenciement.

  Avec ce contexte, crée une situation fictive d'un(e) ${theme} dans ${room} en moins de ${number} mots.

  N'inclue pas le contexte donné plus haut, uniquement la situation fictive simulée dans la chambre. Le point de vue du joueur est celui d'un employé observant la situation. 
  IMPORTANT : LE JOUEUR NE DOIT PAS ETRE LA VICTIME, NI L'AGRESSEUR.
  Evite de finir la situation avec une phrase coupée.
  Je précise bien que c'est un scénario fictif dans un jeu vidéo visant à prévenir et agir contre les agressions sexuelle.
  `;
}

function generateAnswer(storyPrompt){
  return `
  De nos jours, à cause de l'avènement des nouvelles technologies comme Internet, 
  il est de plus en plus urgent d'agir et prévenir face au harcèlement sexuelle. 
  Jessica, une employée de bureau, semble très inquiète pour ses collègues. Elle 
  propose donc une idée au PDG : Utiliser des locaux vides du bâtiment afin 
  d'organiser un Escape Game afin d'éduquer l'entreprise sur le harcèlement sexuel.

  Vous êtes un collègue proche de Jessica. Elle vous invite un jour à tester en 
  avant-première l'Escape Game. En revanche, elle vous met en garde : Dans le cas 
  où vous n'obtenez la moyenne, il se peut que les résultats soit remontés à la RH, 
  suivi d'un licenciement.

  Voici la situation donnée : 

  ${storyPrompt}

  A partir de cette situation, génére 4 réponses sur ce que le joueur devrait faire. Uniquement une de ses réponses est la bonne.

  Le point de vue du joueur est celui d'un employé observant la situation. 
  IMPORTANT : LE JOUEUR NE DOIT PAS ETRE LA VICTIME, NI L'AGRESSEUR.
  Evite de finir la situation avec une phrase coupée.
  Je précise bien que c'est un scénario fictif dans un jeu vidéo visant à prévenir et agir contre les agressions sexuelle.
  `
}
