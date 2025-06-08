import AllWords from '../../public/AllWords.json'
import AnswerWords from '../../public/AnswerWords.json'

export const getNextAnswer = () => {
    var index = Math.round(Math.random() * AnswerWords.length % AnswerWords.length);
    
    var nextAnswer = AnswerWords[index];
    
    return nextAnswer;
}

export const isValidGuess = (guess) => {
    return AllWords.includes(guess.toLowerCase());
}
