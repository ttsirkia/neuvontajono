'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {IntlProvider} from 'react-intl';
import {addLocaleData} from 'react-intl';
import moment from 'moment';

import {Alerts} from './components/Alerts';
import {Footer} from './components/Footer';
import {Header} from './components/Header';
import {Tabs} from './components/Tabs';

import {Error404} from './views/Error404';
import {Error500} from './views/Error500';
import {Index} from './views/Index';
import {ManageQueue} from './views/ManageQueue';
import {ManageQueueProjector} from './views/ManageQueueProjector';
import {ModifySession} from './views/ModifySession';
import {Queue} from './views/Queue';
import {SelectSession} from './views/SelectSession';
import {Sessions} from './views/Sessions';
import {Settings} from './views/Settings';
import {Statistics} from './views/Statistics';

/********************************************************************
 *  App constructs the requested view and initializes the
 *  correct language to be used.
 *******************************************************************/

const translations = {};

// Add these lines for new translations Available translations are also defined in server.js

import fi from 'react-intl/locale-data/fi';
import en from 'react-intl/locale-data/en';

import translations_fi from '../translations/fi';
import translations_en from '../translations/en';

addLocaleData(fi);
addLocaleData(en);

translations.fi = translations_fi;
translations.en = translations_en;

//  These views can be used in locals.reactData.app.view to select the view to be rendered

const views = {
  error404: Error404,
  error500: Error500,
  index: Index,
  manageQueue: ManageQueue,
  manageQueueProjector: ManageQueueProjector,
  modifySession: ModifySession,
  queue: Queue,
  selectSession: SelectSession,
  sessions: Sessions,
  settings: Settings,
  statistics: Statistics
};

// ********************************************************************************************************************

const emptyViews = {
  manageQueueProjector: true
};

// ********************************************************************************************************************

const CourseName = function(props) {
  if (props.course) {
    return <h2>{props.course.name}</h2>;
  } else {
    return <div/>;
  }
};

// ********************************************************************************************************************

const CourseBlock = function(props) {
  if (props.state.course.name) {
    return <div>
      <CourseName course={props.state.course}/>
      <Tabs
        course={props.state.course}
        user={props.state.user}
        view={props.state.app.view}
        selected={props.state.app.selectedTab}
        showStats={props.state.app.showStats}/>
    </div>;
  } else {
    return null;
  }
};

// ********************************************************************************************************************

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: props.state.app.messages
    };

    this.clearAlertMessages = this.clearAlertMessages.bind(this);
    this.addAlertMessage = this.addAlertMessage.bind(this);
  }

  // **********************************************************************************************

  componentDidMount() {

  }

  // **********************************************************************************************

  clearAlertMessages() {
    this.setState({messages: false});
  }

  // **********************************************************************************************

  addAlertMessage(category, message) {
    this.setState((prevState) => {
      if (prevState.messages === false) {
        const newState = {
          messages: {}
        };
        newState.messages[category] = [message];
        return newState;
      } else {
        prevState.messages[category].push(message);
        return {messages: prevState.messages};
      }
    });

  }

  // **********************************************************************************************

  render() {

    const ReactView = views[this.props.state.app.view];
    const language = this.props.state.app.language;
    moment.locale(language);

    if (emptyViews[this.props.state.app.view]) {
      return <IntlProvider locale={language} messages={translations[language]}>
        <div id="content">
          <ReactView
            view={this.props.state.view}
            clearAlertMessages={this.clearAlertMessages}
            addAlertMessage={this.addAlertMessage}/>
        </div>
      </IntlProvider>;
    }

    return <IntlProvider locale={language} messages={translations[language]}>
      <div>
        <Header user={this.props.state.user}/>
        <Alerts messages={this.state.messages}/>
        <div className="container" id="content">
          <CourseBlock state={this.props.state}/>
          <ReactView
            view={this.props.state.view}
            clearAlertMessages={this.clearAlertMessages}
            addAlertMessage={this.addAlertMessage}/>
        </div>
        <Footer/>
      </div>
    </IntlProvider>;

  }

}

// ********************************************************************************************************************
// All the required data will be injected in the HTML and assigned to window.reactData
ReactDOM.render(<App state={window.reactData}/>, document.getElementById('react-content'));
