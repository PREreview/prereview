// base imports
import React, { useContext, useEffect, useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import MaterialTable from 'material-table';

// contexts
import UserProvider from '../contexts/user-context';

// hooks
import {
  useGetUsers,
  useGetPersonas,
  useGetPreprints,
  useGetFullReviews,
  useGetRapidReviews,
  useGetCommunities,
  useGetBadges,
  useGetTags,
} from '../hooks/api-hooks.tsx';
import { useMutate } from 'restful-react';

// components
import HeaderBar from './header-bar';
import Loading from './loading';

// constants
import { ORG } from '../constants';

// material-ui
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

// icons
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default function AdminPanel() {
  const [user] = useContext(UserProvider.context);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="admin-panel">
      <Helmet>
        <title>{ORG} • Admin panel</title>
      </Helmet>
      <HeaderBar thisUser={user} />

      <AppBar position="static">
        <Tabs
          value={activeTab}
          onChange={(event, selected) => setActiveTab(selected)}
          aria-label="admin tabs"
        >
          <Tab label="Users" />
          <Tab label="Personas" />
          <Tab label="Preprints" />
          <Tab label="Full Reviews" />
          <Tab label="Rapid Reviews" />
          <Tab label="Communities" />
          <Tab label="Badges" />
          <Tab label="Tags" />
        </Tabs>
      </AppBar>
      <TabPanel value={activeTab} index={0}>
        <UsersTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <PersonasTab />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <PreprintsTab />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <FullReviewsTab />
      </TabPanel>
      <TabPanel value={activeTab} index={4}>
        <RapidReviewsTab />
      </TabPanel>
      <TabPanel value={activeTab} index={5}>
        <CommunitiesTab />
      </TabPanel>
      <TabPanel value={activeTab} index={6}>
        <BadgesTab />
      </TabPanel>
      <TabPanel value={activeTab} index={7}>
        <TagsTab />
      </TabPanel>
    </div>
  );
}

function UsersTab() {
  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'ORCiD',
      field: 'orcid',
      render: row => (
        <Link
          href={`https://orcid.org/${row.orcid}`}
          target="_blank"
          rel="noopener"
        >
          {row.orcid}
        </Link>
      ),
    },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  const { data, loading } = useGetUsers({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/users/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/users/${id}`,
  });

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Users"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
        }}
      />
    );
  }
}

function PersonasTab() {
  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Avatar',
      field: 'avatar',
      render: row => (
        <Link href={`/about/${row.uuid}`} target="_blank" rel="noopener">
          <Avatar src={row.avatar} alt={row.name} />
        </Link>
      ),
    },
    {
      title: 'Name',
      field: 'name',
      render: row => (
        <Link href={`/about/${row.uuid}`} target="_blank" rel="noopener">
          {row.name}
        </Link>
      ),
    },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  const { data, loading } = useGetPersonas({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/personas/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/personas/${id}`,
  });

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Personas"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
        }}
      />
    );
  }
}

function PreprintsTab() {
  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Title',
      field: 'title',
      render: row => (
        <Link href={`/preprints/${row.uuid}`} target="_blank" rel="noopener">
          {row.title}
        </Link>
      ),
    },
    {
      title: 'Handle',
      field: 'handle',
    },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  const { data, loading } = useGetPreprints({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/preprints/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/preprints/${id}`,
  });

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Preprints"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
        }}
      />
    );
  }
}

function FullReviewsTab() {
  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Preprint',
      field: 'preprint',
      render: row => (
        <Link
          href={`/preprints/${row.preprint.uuid}`}
          target="_blank"
          rel="noopener"
        >
          {row.preprint.handle}
        </Link>
      ),
    },
    {
      title: 'Authors',
      field: 'authors',
      render: row => (
        <AvatarGroup max={5}>
          {row.authors &&
            row.authors.map(author => (
              <Link
                key={author.uuid}
                href={`/about/${author.uuid}`}
                target="_blank"
                rel="noopener"
              >
                <Avatar src={author.avatar} alt={author.name} />
              </Link>
            ))}
        </AvatarGroup>
      ),
    },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  const { data, loading } = useGetFullReviews({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/full-reviews/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/full-reviews/${id}`,
  });

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Full Reviews"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
        }}
      />
    );
  }
}

function RapidReviewsTab() {
  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Preprint',
      field: 'preprint',
      render: row => (
        <Link
          href={`/preprints/${row.preprint.uuid}`}
          target="_blank"
          rel="noopener"
        >
          {row.preprint.handle}
        </Link>
      ),
    },
    {
      title: 'Author',
      field: 'author',
      render: row => (
        <Link href={`/about/${row.author.uuid}`} target="_blank" rel="noopener">
          <Avatar src={row.author.avatar} alt={row.author.name} />
        </Link>
      ),
    },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  const { data, loading } = useGetRapidReviews({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/rapid-reviews/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/rapid-reviews/${id}`,
  });

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Rapid Reviews"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
        }}
      />
    );
  }
}

function CommunitiesTab() {
  const [users, setUsers] = useState(null);

  const { data, loading } = useGetCommunities({
    resolve: res => res.data,
  });

  const { data: usersData, loading: loadingUsers } = useGetUsers({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/communities/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/communities/${id}`,
  });

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/communities',
  });

  useEffect(() => {
    if (!loadingUsers && usersData) {
      const lookup = {};
      usersData.map(user => {
        user.defaultPersona
          ? (lookup[user.defaultPersona.uuid] = user.defaultPersona.name)
          : (lookup[user.uuid] = user.name);
      });
      setUsers(lookup);
    }
  }, [usersData]);

  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Name',
      field: 'name',
      render: row => (
        <Link href={`/communities/${row.slug}`} target="_blank" rel="noopener">
          {row.name}
        </Link>
      ),
    },
    {
      title: 'Slug',
      field: 'slug',
      render: row => (
        <Link href={`/communities/${row.slug}`} target="_blank" rel="noopener">
          {row.slug}
        </Link>
      ),
    },
    {
      title: 'Owners',
      field: 'owners',
      lookup: users,
      render: row => (
        <AvatarGroup max={5}>
          {row.owners &&
            row.owners.map(owner => (
              <Link
                key={owner.uuid}
                href={`/about/${owner.uuid}`}
                target="_blank"
                rel="noopener"
              >
                <Avatar src={owner.avatar} alt={owner.name} />
              </Link>
            ))}
        </AvatarGroup>
      ),
    },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  if (loading || loadingUsers) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Communities"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
          onRowAdd: newData => create(newData),
        }}
      />
    );
  }
}

function BadgesTab() {
  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Name',
      field: 'name',
      render: row => (
        <Link
          href={`/personas?badges=${row.slug}`}
          target="_blank"
          rel="noopener"
        >
          {row.name}
        </Link>
      ),
    },
    { title: 'Color', field: 'color', hidden: true },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  const { data, loading } = useGetBadges({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/badges/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/badges/${id}`,
  });

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/badges',
  });

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Badges"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
          onRowAdd: newData => create(newData),
        }}
      />
    );
  }
}

function TagsTab() {
  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Name',
      field: 'name',
      render: row => (
        <Link href={`/reviews?tags=${row.slug}`} target="_blank" rel="noopener">
          {row.name}
        </Link>
      ),
    },
    { title: 'Color', field: 'color', hidden: true },
    {
      title: 'Created At',
      field: 'createdAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
    {
      title: 'Updated At',
      field: 'updatedAt',
      type: 'datetime',
      dateSetting: { locale: 'en-GB' },
      editable: false,
    },
  ];

  const { data, loading } = useGetTags({
    resolve: res => res.data,
  });

  // generated hooks don't allow dynamic path params
  const { mutate: update } = useMutate({
    verb: 'PUT',
    path: ({ id }) => `/tags/${id}`,
  });

  const { mutate: remove } = useMutate({
    verb: 'DELETE',
    path: ({ id }) => `/tags/${id}`,
  });

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/tags',
  });

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Tags"
        columns={columns}
        data={data}
        editable={{
          onRowUpdate: newData =>
            update(newData, { pathParams: { id: newData.uuid } }),
          onRowDelete: newData => remove({ pathParams: { id: newData.uuid } }),
          onRowAdd: newData => create(newData),
        }}
      />
    );
  }
}
