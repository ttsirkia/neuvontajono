'use strict';

import React from 'react';

/********************************************************************
 *  Footer renders the footer in the bottom of each page.
 *******************************************************************/

export function Footer() {
  return <footer>
    <div className="container">
      <p className="small text-muted text-center">
        <span>Aalto University, </span>
        <a href="https://research.cs.aalto.fi/LeTech/">
          Learning + Technology
        </a>
        <br/>
        <span className="author">v 2.7.0 | Teemu Sirkiä, 2021</span>
      </p>
    </div>
  </footer>;
}
