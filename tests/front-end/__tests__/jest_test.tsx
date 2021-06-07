/**
 * @jest-environment jsdom
 */
import chai, { expect } from "chai";
import chaiDom from "chai-dom";
import $ from 'jquery';
import { adt } from 'shared/lib/types';
import { Route } from 'front-end/lib/app/types';
chai.use(chaiDom);

import SetupApp from '../jest.setup'

describe("Test Suite", () => {
  describe("Switch language", () => {
    it('Change the localization', () => {
      SetupApp().then(({ dispatch }) => {
          dispatch(adt('@incomingRoute', { route: { tag: 'opportunities', value: null } as Route, routeScrollY: 0 }));
          setTimeout(() => {
            const homeLink = $('#main > div > nav > div.main-nav-bottom-navbar.desktop > div > div > div > div.d-flex.flex-nowrap > a:nth-child(1)')
            expect(homeLink.contents).to.be('Home')
            const langButton = $('#main > div > nav > div.main-nav-top-navbar-wrapper > div.main-nav-top-navbar > div > div > div > div.d-none.d-md-flex.align-items-center.flex-shrink-0 > ul > li:nth-child(1) > a')
            langButton.click();
            expect(homeLink.contents).to.be('Accueil')
          }, 1)
        })
    })
  })

  it("click on a button", () => {
    SetupApp().then(({ dispatch }) => {
        dispatch(adt('@incomingRoute', { route: { tag: 'opportunities', value: null } as Route, routeScrollY: 0 }));
        setTimeout(() => {
          expect(document.getElementsByTagName('h1').length).to.equal(1)
          expect(document.getElementsByTagName('h1')[0].innerText).to.be('Welcome to the Digital Marketplace')
          expect(document.querySelector('#main > div > div > div > div:nth-child(2) > div:nth-child(1) > div.mb-4.mb-md-0.col-12.col-md-6 > div > div')?.innerHTML).to.include('Code With Us')
        }, 1)
      })
  });
});