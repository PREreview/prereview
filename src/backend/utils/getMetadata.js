import doiRegex from 'doi-regex';
import identifiersArxiv from 'identifiers-arxiv';
import scrape from 'html-metadata';
import fetch from 'node-fetch';

export default async function getMetadata(publicationId) {
  const isDoi = doiRegex().test(publicationId);
  const isArxiv = identifiersArxiv.extract(publicationId)[0];

  const baseUrlArxivHtml = 'https://arxiv.org/abs/';
  const baseUrlDoi = 'https://doi.org/';

  // checks if the publication is DOI or arXiv
  let url, type;
  if (isDoi) {
    url = `${baseUrlDoi}${publicationId}`;
    type = 'doi';
  } else if (isArxiv) {
    url = `${baseUrlArxivHtml}${publicationId}`;
    type = 'arxiv';
  }

  // fetch data based on publication type (DOI / arXiv)
  // checks crossref if nothing is found on official sites
  if (isDoi || isArxiv) {
    const scrapeData = await scrapeURL(url, publicationId, type);

    if (scrapeData) {
      return scrapeData;
    } else {
      const crossrefData = await searchCrossref(publicationId);
      return crossrefData;
    }
  } else {
    const crossrefData = await searchCrossref(publicationId);
    return crossrefData;
  }
}

// get metadata from url
const scrapeURL = (url, publicationId, type) =>
  new Promise(resolve => {
    var options = {
      url,
      headers: {
        'User-Agent': 'webscraper',
      },
    };

    return scrape(options, (err, metadata) => {
      if (err) {
        resolve(null);
      }

      if (metadata) {
        const { general, openGraph, highwirePress } = metadata;
        let authors = [];

        if (
          highwirePress &&
          highwirePress.author &&
          typeof highwirePress.author === 'array'
        ) {
          highwirePress.author.forEach(author => {
            if (author.includes(',')) {
              authors.push(author.replace(',', ''));
            } else {
              authors.push(author);
            }
          });
        } else {
          if (highwirePress.author.includes(',')) {
            authors.push(highwirePress.author.replace(',', ''));
          } else {
            authors.push(highwirePress.author);
          }
        }

        var preprint = {
          id: `${type}/${publicationId}`,
          title: highwirePress.title ? highwirePress.title : null,
          abstract: openGraph.abstract
            ? openGraph.abstract
            : openGraph.description
            ? openGraph.description
            : general.description
            ? general.description
            : null,
          source: openGraph.url ? openGraph.url : null,
          publisher: openGraph.site_name
            ? openGraph.site_name
            : 'preprints.org',
          authors: { list: authors },
          date_created: highwirePress.date ? highwirePress.date : null,
          date_published: highwirePress.online_date
            ? highwirePress.online_date
            : highwirePress.date
            ? highwirePress.date
            : null,
          date_indexed: formatDate(new Date()),
          authorstring: authors.join(),
          license: null,
          document: null,
          n_prereviews: 0,
        };

        resolve(preprint);
      }
      resolve(null);
    });
  });

// search Crossref
const searchCrossref = publicationId =>
  new Promise(resolve =>
    fetch(`https://api.crossref.org/works/${publicationId}`)
      .then(response => response.json())
      .then(data => data.message)
      .then(crossrefData => {
        if (crossrefData) {
          let authors = [];

          if (crossrefData.author) {
            crossrefData.author.forEach(a =>
              authors.push(`${a.given} ${a.family}`),
            );
          }

          var preprint = {
            id: `doi/${crossrefData.DOI}`,
            title: crossrefData.title[0],
            abstract: crossrefData.abstract,
            source: crossrefData.source,
            publisher: 'bioRxiv',
            authors: { list: authors },
            date_created: formatDate(crossrefData.created['date-time']),
            date_published: formatDate(crossrefData.deposited['date-time']),
            date_indexed: formatDate(crossrefData.indexed['date-time']),
            authorstring: authors.join(),
            license: crossrefData.license ? crossrefData.license : null,
            document: null,
            n_prereviews: 0,
          };

          resolve(preprint);
        }
        resolve(null);
      })
      .catch(err => {
        console.log('err', err);
        resolve(null);
      }),
  );

// format date from 2019-03-13T03:29:22.099Z to 2019-03-13
const formatDate = date => {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;

  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};
