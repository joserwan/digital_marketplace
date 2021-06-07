/**
 * @jest-environment jsdom
 */

// import { render } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import React from "react";
import chai from "chai";
import chaiDom from "chai-dom";
// import { component } from '../lib/pages/opportunity/sprint-with-us/edit/tab/code-challenge'
import app from 'front-end/lib/app';
import { start } from 'front-end/lib/framework'
// import { Route } from 'front-end/lib/app/types';
chai.use(chaiDom);
// const { expect } = chai;

document.body.innerHTML = '<div id="main"></div>';
document.documentElement.scrollTo = () => { }
const element = document.getElementById('main') || document.body;
export default function testApp(){
  return start(app, element, true)
}