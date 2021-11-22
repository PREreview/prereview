/**
 * @jest-environment jsdom
 */

import { ThemeProvider } from '@material-ui/core';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import Barplot from '../../src/frontend/components/barplot';
import theme from '../../src/frontend/theme';

function renderBarplot(props: Partial<React.ComponentProps<typeof Barplot>>) {
  const defaultProps: React.ComponentProps<typeof Barplot> = {
    stats: [],
    nReviews: 0,
    children: <React.Fragment />,
  };

  return render(
    <ThemeProvider theme={theme}>
      <Barplot {...defaultProps} {...props} />
    </ThemeProvider>,
  ).container;
}

describe('<Barplot />', () => {
  describe('when there are no reviews', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = renderBarplot({ nReviews: 0 });
    });

    it.skip('display an empty message', () => {
      expect(container).toHaveTextContent(
        'No rapid PREreviews. Would you like to leave one?',
      );
    });
  });

  describe('when there are reviews', () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = renderBarplot({
        stats: [
          {
            questionId: 'question1',
            nReviews: 3,
            question: 'Question 1',
            yes: [{}, {}],
            no: [{}],
            na: [],
            unsure: [],
          },
          {
            questionId: 'question2',
            nReviews: 2,
            question: 'Question 2',
            yes: [],
            no: [],
            na: [{}],
            unsure: [{}],
          },
        ],
        nReviews: 3,
        children: <p>Child content</p>,
      });
    });

    it('displays the number of reviews', () => {
      expect(container.querySelector('div')).toHaveTextContent(
        'Showing 3 PREreviews',
      );
    });

    it('displays the stats', async () => {
      expect(container.querySelector('li:nth-child(1)')).toHaveTextContent(
        'Question 167%0%0%33%',
      );
      expect(container.querySelector('li:nth-child(2)')).toHaveTextContent(
        'Question 20%50%50%0%',
      );
    });

    it('displays the child', async () => {
      expect(container.querySelector('p')).toHaveTextContent('Child content');
    });
  });
});
