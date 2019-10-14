import React from 'react';
import logo from './logo.svg';
import Main from './Components/Main';
import './App.css';

function App() {
  return (
      <div>
          <link
              rel="stylesheet"
              href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
              integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
              crossOrigin="anonymous"
          />
          <link
              rel="stylesheet"
              href="https://bootswatch.com/4/darkly/bootstrap.min.css"
          />
          <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          />
        <Main/>
      </div>
  );
}

export default App;
