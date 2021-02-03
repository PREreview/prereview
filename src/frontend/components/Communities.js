// base imports
import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import { useGetCommunities } from '../hooks/api-hooks.tsx';

// utils
import { processParams, searchParamsToObject } from '../utils/search';

// components
import HeaderBar from './header-bar';
import Loading from './loading';
import SearchBar from './search-bar';

// constants
import { ORG } from '../constants';

const Communities = () => {
  const [user] = useContext(UserProvider.context);

  const params = processParams(location.search);
  const [search, setSearch] = useState(params.get('search') || '');

  const { data: communities, loading: loading, error } = useGetCommunities({
    queryParams: searchParamsToObject(params),
  });

  if (loading) {
    return <Loading />;
  } else if (error) {
    console.log(error);
    return <div>An error occurred: {error.message}</div>;
  } else {
    return (
      <div className="communities">
        <Helmet>
          <title>Communities • {ORG}</title>
        </Helmet>
        <HeaderBar thisUser={user} />

        <SearchBar
          defaultValue={search}
          isFetching={loading}
          onChange={value => {
            params.delete('page');
            setSearch(value);
          }}
          onCancelSearch={() => {
            params.delete('search');
            setSearch('');
            history.push({
              pathname: location.pathame,
              search: params.toString(),
            });
          }}
          onRequestSearch={() => {
            params.set('search', search);
            params.delete('page');
            history.push({
              pathname: location.pathame,
              search: params.toString(),
            });
          }}
        />
      </div>
    );
  }
};

export default Communities;
