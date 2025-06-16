'use client'

import { useState, useEffect, useRef } from 'react';
import { isValidGuess, getNextAnswer } from '../../utils/WordplexHelper';

export default function WordPlex({ }) {

  var [answerArr, setAnswerArr] = useState([...getNextAnswer().toUpperCase()]);
  var [guesses, setGuesses] = useState(0);
  var [completed, setCompleted] = useState(false);
  var [correct, setCorrect] = useState(false);
  var [colorArray, setColorArray] = useState(Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => -1))); // -1 = Inactive, 0 = White, 1 = Gray, 2 = Green, 3 = Yellow
  var [letterArray, setLetterArray] = useState(Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => '')));
  var alphabetArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  var [letterButtonColorArray, setLetterButtonColorArray] = useState(Array.from({ length: 26 }, () => 0));
  var inputRefs = useRef(null);
  var lastRef = useRef({});

  const getRefs = () => {
    if (!inputRefs.current) {
      inputRefs.current = new Map(); // Initialize the Map on first usage
    }
    return inputRefs.current;
  }

  const setRefs = (node, x, y) => {
    const map = getRefs();
    map.set('Ref' + x + '/' + y, node);
    return () => {
      map.delete('Ref' + x + '/' + y);
    };
  }

  const handleLastRef = (newX, newY) => {
    lastRef.current = { x: newX, y: newY };
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

  const handleLetterButtonColorArray = (val, letters) => {
    let copy = [...letterButtonColorArray];
    val.forEach((elem, i) => {
      var letterIndex = alphabetArray.indexOf(letters[i])
      if (copy[letterIndex] === 0 || (copy[letterIndex] === 3 && elem === 2)) {
        copy[letterIndex] = elem;
      }
    })

    setLetterButtonColorArray(copy);
  }

  const resetArrays = () => {
    letterArray.forEach((arr, x) => {
      arr.forEach((elem, y) => {
        handleColorArray(-1, x, y);
        handleLetterArray('', x, y);
      })
    });
    setLetterButtonColorArray(Array.from({ length: 26 }, () => 0));
  }

  useEffect(() => {
    console.log(answerArr);
  }, [answerArr]);

  useEffect(() => {
    if (guesses > 5 || completed) {
      setCompleted(true);
      return;
    } else {
      getRefs().get('Ref' + guesses + '/' + 0).focus();
      handleLastRef(guesses, 0);
    }
    colorArray[guesses].forEach((val, i) => {
      handleColorArray(0, guesses, i);
    });
  }, [guesses]);

  useEffect(() => {
    window.addEventListener('keyup', onKeyUp); // Add event listeners
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keyup', onKeyUp); // Remove event listeners on component unmount
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [guesses]);

  const onKeyUp = (event) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      checkAnswer();
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      handleBackspaceKey()
    } else if (event.key === 'ArrowLeft') {
      handleArrowKey(-1);
    } else if (event.key === 'ArrowRight') {
      handleArrowKey(1);
    }
  }

  const onKeyDown = (event) => {
    event.stopPropagation();
    if (event.key === 'Tab') {
      if (lastRef.current.y < 5) {
        handleLastRef(lastRef.current.x, (lastRef.current.y + 1));
      }
    }
  }

  const handleBackspaceKey = () => {
    var currX = lastRef.current.x
    var currY = lastRef.current.y
    if (letterArray[currX][currY] === '') {
      if (currY > 0 && currY < 5) {
        handleLetterArray('', currX, currY);
        getRefs().get('Ref' + currX + '/' + (currY - 1)).focus();
        handleLastRef(currX, (currY - 1));
      }
    } else {
      handleLetterArray('', currX, currY);
    }
  }

  const handleArrowKey = (dir) => {
    var currX = lastRef.current.x
    var currY = lastRef.current.y
    var newY = currY + dir;
    if (newY >= 0 && newY < 5) {
      getRefs().get('Ref' + currX + '/' + newY).focus();
      handleLastRef(currX, newY);
    }
  }

  const checkAnswer = () => {
    if (isValidGuess(letterArray[guesses].join(''))) {
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
      handleLetterButtonColorArray(colorArray[guesses], letterArray[guesses]);
      setGuesses((guesses) => ++guesses);
      setCorrect(currCorrect);
      if (currCorrect) {
        setCompleted(true);
      }
    } else {
      for (let i = 0; i < letterArray[guesses].length; i++) {
        flashInputBoxRed(guesses, i);
      }
    }
  }

  const flashInputBoxRed = (x, y) => {
    var node = getRefs().get('Ref' + x + '/' + y);
    node.className = node.className += ' border-red-500';
    setRefs(node, x, y);
    setTimeout(() => {
      var node = getRefs().get('Ref' + x + '/' + y);
      node.className = node.className.replace(' border-red-500', '');
      setRefs(node, x, y);
    }, 500);
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
        classes += 'bg-green-500';
        break;
      case 3: //Yellow
        classes += 'bg-yellow-500';
        break;
      default:
        classes += 'bg-gray-100';
    }

    if (color === 0) {
      return <input className={classes} key={'letter' + x + y} value={letterArray[x][y].toUpperCase()} onClick={e => handleLastRef(x, y)} onChange={e => onLetterChange(e, e.target.value, x, y)} name={'letter' + x + y} ref={(node) => setRefs(node, x, y)}></input>
    } else {
      return <input className={classes} key={'letter' + x + y} value={letterArray[x][y].toUpperCase()} onClick={e => handleLastRef(x, y)} onChange={e => onLetterChange(e, e.target.value, x, y)} name={'letter' + x + y} ref={(node) => setRefs(node, x, y)} readOnly={true}></input>
    }
  }

  const getLetterButton = (color, letter) => {
    var classes = 'h-[5vh] w-[5vh] text-2xl text-center place-self-center border-2 rounded-md mx-2 my-1 ';
    switch (color) {
      case 0: //White
        classes += 'bg-gray-100';
        break;
      case 1: //Gray
        classes += 'bg-gray-500';
        break;
      case 2: //Green
        classes += 'bg-green-500';
        break;
      case 3: //Yellow
        classes += 'bg-yellow-500';
        break;
      default:
        classes += 'bg-gray-100';
    }

    return <button className={classes} key={letter} onClick={e => onLetterChange(e, letter, lastRef.current.x, lastRef.current.y)}>{letter}</button>
  }

  const onLetterChange = (event, val, x, y) => {
    if (y > 0 && (event.nativeEvent.inputType === 'deleteContentBackward' || event.nativeEvent.inputType === 'deleteContentForward'))
      return;

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
      if (letterArray[x][y] != '') {
        getRefs().get('Ref' + x + '/' + (y + 1)).focus();
        handleLastRef(guesses, y + 1);
      } else {
        getRefs().get('Ref' + x + '/' + y).focus();
        handleLastRef(guesses, y);
      }
    }
  }

  const onNextWordClick = () => {
    setGuesses(0);
    resetArrays();
    setAnswerArr(getNextAnswer().toUpperCase());
    setCompleted(false);
  }

  return (
    <>
      <div className='h-[10vh] grid justify-items-center border-b-2 border-black py-4'>
        <h1 className='h-16 text-4xl font-bold'>WordPlex</h1>
      </div>
      <div className='grid grid-cols-3 place-items-center'>
        <div className='h-[50vh] w-[8vh] lg:w-[35vh] flex flex-wrap justify-self-end lg:justify-self-center place-content-center col-start-1 mr-12 ml-8 lg:ml-0 bg-gray-100'>
          {alphabetArray.map((letter, i) =>
            getLetterButton(letterButtonColorArray[i], letter)
          )}
        </div>
        <div className='h-[90vh] w-[65vh] grid col-start-2 grid-rows-6 grid-cols-5 justify-self-center justify-items-center gap-8 p-6 bg-gray-100'>
          {colorArray.map((arr, x) =>
            arr.map((color, y) =>
              getInputBox(color, x, y)
            )
          )}
          <div className='col-start-2 col-span-3'>
            <button className={'h-12 w-48 text-white text-2xl rounded-lg bg-black ' + (completed ? 'invisible' : '')} onClick={checkAnswer}>Submit</button>
          </div>
        </div>
        {(completed) &&
          <div className='h-[50vh] w-[8vh] lg:w-[35vh] justify-self-end lg:justify-self-center justify-items-center col-start-3 ml-12 mr-8 lg:mr-0 bg-gray-100'>
            <h1 className='text-xl font-bold p-3 mt-5'>{correct ? 'Congratulations!' : 'Good Try!'}</h1>
            <p className='text-lg p-3 mt-5'>The correct answer was:</p>
            <p className='text-lg p-3 font-bold'> {answerArr} </p>
            <button className='h-10 w-28 text-white text-sm rounded-lg mt-5 bg-black' onClick={onNextWordClick}>Next Word</button>
          </div>
        }
      </div>
    </>
  )
}
