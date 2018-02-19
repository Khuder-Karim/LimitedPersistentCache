/**
 * Created by Karim on 23.07.2017.
 */
import React from 'react';
import { render } from 'react-dom';

import { Cache } from 'LimitedPersistentCache';

import * as all from './utils';

import App from './containers/App';

const cache = new Cache();
window.cache = cache;

render(
    <App cache={cache}/>,
    document.getElementById('root')
);
