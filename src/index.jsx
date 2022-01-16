import React from 'react';
import { render } from 'react-dom';

const App = () => {

    return <p>Hello world</p>;
};

const main = () => {
  const root = document.getElementById('root');

  render(<App />, root);
};

main();
