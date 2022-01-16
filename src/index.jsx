import React, {useCallback, useReducer} from 'react';
import {render} from 'react-dom';

const langResult = {
  sugar: 'Dodać kg cukru',
  water: 'Dolać litrów wody',
  no: 'Aby zobaczyć wynik należy uzupełnić wszystkie pola',
}

const algo = (wantedBLG, givenBLG, wortVolume) => {
  if (givenBLG < wantedBLG) {
    return [
      langResult.sugar,
      (((wantedBLG-givenBLG) / 100) * wortVolume).toFixed(2)
    ];
  }

  return [
    langResult.water,
    (((givenBLG - wantedBLG) * wortVolume) / wantedBLG).toFixed(2)
  ];
}
const getResult = ({
  givenBLG,
  wantedBLG,
  wortVolume,
 }) => {
  if (!(givenBLG && wantedBLG && wortVolume)) {
    return [langResult.no, '...'];
  }


  return algo(wantedBLG, givenBLG, wortVolume);
}
const reducer = (state, action) => {
  return {
    ...state,
    [action.name]: action.value
  }
}

const formFields = [
  {
    name: 'givenBLG',
    label: 'Otrzymane BLG'
  },
  {
    name: 'wantedBLG',
    label: 'Żądane BLG',
  },
  {
    name: 'wortVolume',
    label: 'Objętość otrzymanej brzeczki',
  },
];

const FormFields = ({ state, onChange }) => {
 return formFields.map((f) => (
   <label key={f.name}>
     {f.label}
     <input
       type="number"
       name={f.name}
       value={state[f.name]}
       onChange={onChange}
     />
   </label>
 ))
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, {
    givenBLG: 0,
    wantedBLG: 0,
    wortVolume: 0
  });

  const handleUpdateFormField = useCallback((event) => {
    dispatch(event.target);
  }, [dispatch]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
  });


  const [resultLang, resultValue] = getResult(state);
  return (
    <main>
      <h1>BLG Calculator</h1>
      <form onSubmit={handleSubmit}>
        <FormFields state={state} onChange={handleUpdateFormField} />
        <label>
          {resultLang}
          <input type="text" readOnly="readOnly" value={resultValue}/>
        </label>
      </form>
    </main>
  );
};

const main = () => {
  const root = document.getElementById('root');

  render(<App/>, root);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
      new URL('sw.js', import.meta.url),
      { type: 'module'}
    );
  }
};

main();
