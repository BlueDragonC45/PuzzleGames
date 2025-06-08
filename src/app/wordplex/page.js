'use client'

import { useState, useEffect, useRef } from 'react';
import { isValidGuess, getNextAnswer } from '../../utils/WordplexHelper';

export default function WordPlex({ }) {

  var [answerArr, setAnswerArr] = useState([]);
  var [guesses, setGuesses] = useState(0);
  var [completed, setCompleted] = useState(false);
  var [correct, setCorrect] = useState(false);
  var [colorArray, setColorArray] = useState(Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => -1))); // -1 = Inactive, 0 = White, 1 = Gray, 2 = Green, 3 = Yellow
  var [letterArray, setLetterArray] = useState(Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => '')))
  var inputRefs = useRef(null);

  const getRefs = () => {
    if (!inputRefs.current) {
      // Initialize the Map on first usage.
      inputRefs.current = new Map();
    }
    return inputRefs.current;
  }

  const setRefs = (node, x, y) => {
    const map = getRefs();
    map.set("Ref" + x + "/" + y, node);
    return () => {
      map.delete("Ref" + x + "/" + y);
    };
  }

  const handleColorArray = (val, x, y) => {
    let copy = [...colorArray];
    copy[x][y] = val;
    setColorArray(copy);
  }

  const handleLetterArray = (val, x, y) => {
    let copy = [...letterArray];
    copy[x][y] = val.toUpperCase();
    setLetterArray(copy);
  }

  const resetArrays = () => {
    letterArray.forEach((arr, x) => {
      arr.forEach((elem, y) => {
        handleColorArray(-1, x, y);
        handleLetterArray('', x, y);
      })
    });
  }

  useEffect(() => {
    var answer = getNextAnswer().toUpperCase();
    console.log(answer);
    setAnswerArr(() => [...answer]);
  }, []);

  useEffect(() => {
    if (guesses > 5 || completed) {
      setCompleted(true);
      return;
    } else {
      getRefs().get("Ref" + guesses + "/" + 0).focus();
    }
    colorArray[guesses].forEach((val, i) => {
      handleColorArray(0, guesses, i);
    });
  }, [guesses]);

  useEffect(() => {
    window.addEventListener("keyup", onKeyUp); // Add event listener for keydown event
    return () => {
      window.removeEventListener("keyup", onKeyUp); // Remove event listener on component unmount
    };
  }, [guesses]);

  const onKeyUp = (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      checkAnswer();
    }
  }

  const checkAnswer = () => {
    if (isValidGuess(letterArray[guesses].join(""))) {
      var currCorrect = true;
      var yellowSet = Array(5).fill('');
      yellowSet.forEach((val, i) => {
        yellowSet[i] = answerArr[i];
      });


      letterArray[guesses].forEach((letter, i) => {
        if (letter === answerArr[i]) {
          yellowSet[i] = '';
          handleColorArray(2, guesses, i);
        }
      });

      letterArray[guesses].forEach((letter, i) => {
        if (colorArray[guesses][i] === 2) return;

        currCorrect = false;
        const index = yellowSet.indexOf(letter);

        if (index !== -1) {
          yellowSet[index] = '';
          handleColorArray(3, guesses, i);
        } else {
          handleColorArray(1, guesses, i);
        }
      });
      setGuesses((guesses) => ++guesses);
      setCorrect(currCorrect);
      if (currCorrect) {
        setCompleted(true);
      }
    } else {
      console.log("Invalid guess");
    }
  }

  const getInputBox = (color, x, y) => {
    var classes = 'h-[9vh] w-[9vh] text-5xl text-center caret-transparent border-2 rounded-lg ';
    switch (color) {
      case 0: //White
        classes += 'bg-gray-100 focus:border-4';
        break;
      case 1: //Gray
        classes += 'bg-gray-500';
        break;
      case 2: //Green
        classes += ' bg-green-500';
        break;
      case 3: //Yellow
        classes += ' bg-yellow-500';
        break;
      default:
        classes += ' bg-gray-100';
    }

    if (color === 0) {
      return <input className={classes} key={'letter' + x + y} value={letterArray[x][y].toUpperCase()} onChange={e => onLetterChange(e.target.value, x, y)} name={'letter' + x + y} ref={(node) => setRefs(node, x, y)}></input>
    } else {
      return <input className={classes} key={'letter' + x + y} value={letterArray[x][y].toUpperCase()} onChange={e => onLetterChange(e.target.value, x, y)} name={'letter' + x + y} ref={(node) => setRefs(node, x, y)} readOnly={true}></input>
    }
  }

  const onLetterChange = (val, x, y) => {
    if (val.length > 1) {
      const oldChar = letterArray[x][y];
      val.split('').forEach((char) => {
        if (char && char !== ' ' && char !== oldChar && (char.toUpperCase() !== char.toLowerCase())) {
          handleLetterArray(char, x, y);
          return;
        }
      });
    } else {
      handleLetterArray(val, x, y);
    }

    if (y < 4) {
      getRefs().get("Ref" + x + "/" + (y + 1)).focus();
    } else {
      getRefs().get("Ref" + x + "/" + y).blur();
    }
  }

  const onNextWordClick = () => {
    setGuesses(0);
    resetArrays();
    //Get new word
    setCompleted(false);
  }

  return (
    <>
      <div className="h-[10vh] grid justify-items-center border-b-2 border-black py-4">
        <h1 className="h-16 text-4xl font-bold">WordPlex</h1>
      </div>
      <div className="grid grid-cols-3 place-items-center">
        <div className="h-[90vh] w-[65vh] grid col-start-2 grid-rows-6 grid-cols-5 justify-self-center justify-items-center gap-8 p-6 bg-gray-100">
          {colorArray.map((arr, x) =>
            arr.map((color, y) =>
              getInputBox(color, x, y)
            )
          )}
          <div className="col-start-2 col-span-3">
            <button className={'h-12 w-48 text-white text-2xl rounded-lg bg-black ' + (completed ? 'invisible' : '')} onClick={checkAnswer}>Submit</button>
          </div>
        </div>
        {(completed) &&
          <div className="h-[45vh] w-[8vh] lg:w-[35vh] justify-self-end lg:justify-self-center justify-items-center col-start-3 ml-12 mr-8 lg:mr-0 bg-gray-100">
            <h1 className='text-xl font-bold p-3 mt-5'>{correct ? "Congratulations!" : "Good Try!"}</h1>
            <p className='text-lg p-3 mt-5'>The correct answer was:</p>
            <p className='text-lg p-3 font-bold'> {answerArr} </p>
            <button className="h-10 w-28 text-white text-sm rounded-lg mt-5 bg-black" onClick={onNextWordClick}>Next Word</button>
          </div>
        }

      </div>
    </>
  )
}
