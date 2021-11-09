// base imports
import React from 'react';
import PropTypes from 'prop-types';

//utils
import { formatDistanceStrict } from 'date-fns';
import { createPreprintId } from '../../common/utils/ids';

//material ui
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

export default function RecentActivity({ activity }) {
  let author;
  let authors;

  activity.author ? (author = activity.author) : (authors = activity.authors);

  const multiAuthors = () => {
    return authors.map(author => (
      <Link key={author.uuid} href={`/about/${author.uuid}`}>
        {author.name}{' '}
      </Link>
    ));
  };

  const title = activity.preprintTitle;
  const preprintId = createPreprintId(activity.handle);

  const getContent = type => {
    switch (type) {
      case 'request':
        return (
          <Typography component="div" variant="body2">
            <Link href={`/about/${author.uuid}`}>{author.name}</Link> requested
            PREreviews for{' '}
            <Link href={`/preprints/${preprintId}`}>{title}</Link>{' '}
            {formatDistanceStrict(new Date(activity.createdAt), new Date()) +
              ` ago.`}
          </Typography>
        );
      case 'rapid':
        return (
          <Typography component="div" variant="body2">
            <Link href={`/about/${author.uuid}`}>{author.name}</Link> rapid
            PREreviewed <Link href={`/preprints/${preprintId}`}>{title}</Link>{' '}
            {formatDistanceStrict(new Date(activity.createdAt), new Date()) +
              ` ago.`}
          </Typography>
        );
      case 'long':
        return (
          <Typography component="div" variant="body2">
            {multiAuthors()} full PREreviewed{' '}
            <Link href={`/preprints/${preprintId}`}>{title}</Link>{' '}
            {formatDistanceStrict(new Date(activity.createdAt), new Date()) +
              ` ago.`}
          </Typography>
        );
      default:
        return '';
    }
  };

  return getContent(activity.type);
}

RecentActivity.propTypes = {
  activity: PropTypes.object,
};
