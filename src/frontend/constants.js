// See https://github.com/PREreview/rapid-prereview/issues/6
// When possible questions are written so that yes means "the preprint is good"
export const QUESTIONS = [
  {
    identifier: 'ynNovel',
    question: 'Are the findings novel?',
    help:
      'In your judgement, does the manuscript have information that has not been previously known or published?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynFuture',
    question: 'Are the results likely to lead to future research?',
    help:
      'Do the data, findings, or analysis point to clear directions for additional research?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynReproducibility',
    question:
      'Is sufficient detail provided to allow reproduction of the study?',
    help:
      'Would another research group be able to reproduce these findings based solely on the information present in the manuscript, particularly the methods section and, if present, any supplementary/supporting information?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynMethods',
    question: 'Are the methods and statistics appropriate for the analysis?',
    help:
      'Do you think the methods used to analyze the data were adequately chosen and utilized to answer the research question(s)?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynCoherent',
    question:
      'Are the principal conclusions supported by the data and analysis?',
    help:
      'Is there sufficient evidence to support the key findings of the manuscript?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynLimitations',
    question: 'Does the manuscript discuss limitations?',
    help: 'Are the most important limitations clearly presented?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynEthics',
    question: 'Have the authors adequately discussed ethical concerns?',
    help:
      'For example, if a human study, is Institutional Review Board (IRB) approval presented?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynNewData',
    question: 'Does the manuscript include new data?',
    help: 'Were data collected or made available specifically for this study?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynAvailableData', // DO NOT CHANGE THIS IS USED IN THE INDEX (or update everywhere)
    indexed: true,
    question: 'Are the data used in the manuscript available?',
    help:
      'The data are available for anyone to download (e.g. from a public repository) and are linked in the manuscript or supplementary information.',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'linkToData',
    question: 'Links to the data used in the manuscript (if applicable)',
    type: 'Question',
    required: false,
  },

  {
    identifier: 'ynAvailableCode', // DO NOT CHANGE THIS IS USED IN THE INDEX (or update everywhere)
    indexed: true,
    question: 'Is the code used in the manuscript available?',
    help:
      'In the paper, supplement, on a public repository, or from a cited source?',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynRecommend',
    question: 'Would you recommend this manuscript to others?',
    help:
      'Consider any possible audience: scientists in the same field or others, policy makers, the public, etc.',
    type: 'YesNoQuestion',
    required: true,
  },

  {
    identifier: 'ynPeerReview',
    question: 'Do you recommend this manuscript for peer review?',
    help:
      'Would you recommend this manuscript to a journal editor for formal peer review?',
    type: 'YesNoQuestion',
    required: true,
  },
];

export const ORG = 'PREreview';
