'use client'

import { useState, useEffect } from 'react';

export default function WordPlex({ answer }) {

  var answerArr = [..."LILLY"];
  var [guesses, setGuesses] = useState(0);
  var [colorArray, setColorArray] = useState(Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => -1))); // -1 = Inactive, 0 = White, 1 = Gray, 2 = Green, 3 = Yellow
  var [letterArray, setLetterArray] = useState(Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => '')))

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
    letterArray.map((arr, x) => {
      arr.map((elem, y) => {
        handleColorArray(-1, x, y);
        handleLetterArray('', x, y);
      })
    });
  }

  const checkAnswer = () => {
    letterArray[guesses].forEach((letter) => {
      if (!(letter && letter !== ' '))
        return;
    });

    var correct;
    var yellowSet = Array(5).fill('');
    yellowSet.map((val, i) => {
      yellowSet[i] = answerArr[i];
    });


    letterArray[guesses].forEach((letter, i) => {
      if (letter === answerArr[i]) {
        yellowSet[i] = ' ';

        handleColorArray(2, guesses, i);
        return;
      }

      correct = false;
      const index = yellowSet.indexOf(letter);
      if (index !== -1 && letterArray[guesses][index] !== answerArr[index]) {
        yellowSet[index] = ' ';
        handleColorArray(3, guesses, i);
      } else {
        handleColorArray(1, guesses, i);
      }
    });
    setGuesses((guesses) => ++guesses);
  }

  const getInputBox = (color, x, y) => {
    var classes = '';
    switch (color) {
      case 0: //White
        classes = 'h-20 text-5xl text-center caret-transparent border-2 focus:border-4 rounded-lg bg-gray-100';
        break;
      case 1: //Gray
        classes = 'h-20 text-5xl text-center caret-transparent border-2 rounded-lg bg-gray-500';
        break;
      case 2: //Green
        classes = 'h-20 text-5xl text-center caret-transparent border-2 rounded-lg bg-green-500';
        break;
      case 3: //Yellow
        classes = 'h-20 text-5xl text-center caret-transparent border-2 rounded-lg bg-yellow-500';
        break;
      default:
        classes = 'h-20 text-5xl text-center caret-transparent border-2 rounded-lg bg-gray-100';
    }

    if (color === 0) {
      return <input className={classes} key={'letter' + x + y} value={letterArray[x][y].toUpperCase()} onChange={e => onLetterChange(e.target.value, x, y)} name={'letter' + x + y}></input>
    } else {
      return <input className={classes} key={'letter' + x + y} value={letterArray[x][y].toUpperCase()} onChange={e => onLetterChange(e.target.value, x, y)} name={'letter' + x + y} readOnly={true}></input>
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
  }

  useEffect(() => {
    if (guesses > 5) {
      //reset
      resetArrays();
      setGuesses(0);
      return;
    }
    colorArray[guesses].forEach((val, i) => {
      handleColorArray(0, guesses, i);
    });
  }, [guesses]);

  return (
    <>
      <div className="h-[12.5vh] grid grid-cols-5 border-b-2 border-black content-center gap-4 px-8">
        <h1 className="col-start-3 h-16 text-5xl font-bold">WordPlex</h1>
      </div>
      <div className="grid grid-cols-5 content-center">
        <div className="h-[72.5vh] col-start-2 col-span-3 grid grid-rows-6 grid-cols-5 align-content-center gap-12 p-6 bg-gray-100">
          {colorArray.map((arr, x) =>
            arr.map((color, y) =>
              getInputBox(color, x, y)
            )
          )}
        </div>
        <button onClick={checkAnswer}>Submit</button>
      </div>
    </>
  )
}

// 35:30  Warning: Expected '!==' and instead saw '!='.  eqeqeq
// 39:9  Warning: 'correct' is assigned a value but never used.  no-unused-vars
// 41:28  Warning: Array.prototype.map() expects a return value from arrow function.  array-callback-return
// 56:17  Warning: Expected '!==' and instead saw '!='.  eqeqeq
// 86:32  Warning: Expected '!==' and instead saw '!='.  eqeqeq
// 95:17  Warning: Assignments to the 'guesses' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect.  react-hooks/exhaustive-deps
// 97:38  Warning: Array.prototype.map() expects a return value from arrow function.  array-callback-return