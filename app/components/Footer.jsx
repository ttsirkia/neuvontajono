'use strict';

import React from 'react';

/********************************************************************
 *  Footer renders the footer in the bottom of each page.
 *******************************************************************/

export function Footer() {
  return <footer>
    <div className="container">
      <p className="small text-muted text-center">
        <span>Aalto-yliopisto, </span>
        <a href="https://www.aalto.fi/department-of-computer-science/letech-research-group-learning-technology">
          Learning + Technology
        </a>
        <br/>
        <span className="author">v 2.4.0 | Teemu Sirkiä, 2018</span>
      </p>
    </div>
  </footer>;
}
