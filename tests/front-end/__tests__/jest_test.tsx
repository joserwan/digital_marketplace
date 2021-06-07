/**
 * @jest-environment jsdom
 */

// import { render } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import React from "react";
import chai, { expect } from "chai";
import chaiDom from "chai-dom";
import $ from 'jquery';
// import { component } from '../lib/pages/opportunity/sprint-with-us/edit/tab/code-challenge'
import app from 'front-end/lib/app';
import { start } from 'front-end/lib/framework'
// import { Route } from 'front-end/lib/app/types';
import { adt } from 'shared/lib/types';
import { Route } from 'front-end/lib/app/types';
chai.use(chaiDom);
// const { expect } = chai;

describe("Test Suite", () => {
  beforeEach(() => {
    // TODO: Uncomment this if you're using `jest.spyOn()` to restore mocks between tests
    // jest.restoreAllMocks();
    // document.body.innerHTML = '<div id="main"></div>';
    // document.documentElement.scrollTo = () => {}

    const element = document.getElementById('main') || document.body;
    return start(app, element, true)
      .then(({ getState }) => {
        getState().set('ready', true)
      })
  });

  describe("Switch language", () => {
    it('Change the localization', () => {
      document.body.innerHTML = '<div id="main"></div>';
      document.documentElement.scrollTo = () => { }
  
      const element = document.getElementById('main') || document.body;
      return start(app, element, true)
        .then(({ getState, dispatch, stateSubscribe }) => {
          getState().set('ready', true)
          dispatch(adt('@incomingRoute', { route: { tag: 'opportunities', value: null } as Route, routeScrollY: 0 }));
          setTimeout(() => {
            const homeLink = $('#main > div > nav > div.main-nav-bottom-navbar.desktop > div > div > div > div.d-flex.flex-nowrap > a:nth-child(1)')
            expect(homeLink.contents).to.be('Home')
            const langButton = $('#main > div > nav > div.main-nav-top-navbar-wrapper > div.main-nav-top-navbar > div > div > div > div.d-none.d-md-flex.align-items-center.flex-shrink-0 > ul > li:nth-child(1) > a')
            langButton.click();
            expect(homeLink.contents).to.be('Accueil')
          }, 1000)
        })
    })
  })

  it("click on a button", () => {
    // TODO: Uncomment this if you're using `jest.spyOn()` to restore mocks between tests
    // jest.restoreAllMocks();
    document.body.innerHTML = '<div id="main"></div>';
    document.documentElement.scrollTo = () => { }

    const element = document.getElementById('main') || document.body;
    return start(app, element, true)
      .then(({ getState, dispatch, stateSubscribe }) => {
        getState().set('ready', true)
        dispatch(adt('@incomingRoute', { route: { tag: 'opportunities', value: null } as Route, routeScrollY: 0 }));
        setTimeout(() => {
          expect(document.getElementsByTagName('h1').length).to.equal(1)
          expect(document.getElementsByTagName('h1')[0].innerText).to.be('Welcome to the Digital Marketplace')
          expect(document.querySelector('#main > div > div > div > div:nth-child(2) > div:nth-child(1) > div.mb-4.mb-md-0.col-12.col-md-6 > div > div')?.innerHTML).to.include('Code With Us')
        }, 1000)
      })
  });
});