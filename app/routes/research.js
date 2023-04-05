const ResearchDAO = require('../data/research-dao').ResearchDAO;
const needle = require('needle');
const { environmentalScripts } = require('../../config/config');

function ResearchHandler(db) {
  'use strict';

  const researchDAO = new ResearchDAO(db);

  this.displayResearch = (req, res) => {
    return researchDAO;
  };
}

module.exports = ResearchHandler;
