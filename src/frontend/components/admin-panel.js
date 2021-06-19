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
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
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
          <Tab label="Full PREreviews" />
          <Tab label="Rapid PREreviews" />
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
      title: 'ORCID',
      field: 'orcid',
      editable: false,
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

  const [users, setUsers] = useState(null);

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

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/users',
  });

  const handleUpdate = async userToUpdate => {
    try {
      await update(userToUpdate, {
        pathParams: { id: userToUpdate.uuid },
      });
    } catch (err) {
      alert(`Failed to update user: ${err.message}`);
    }
    setUsers([
      ...users.filter(user => user.uuid !== userToUpdate.uuid),
      userToUpdate,
    ]);
  };

  const handleRemove = async userToDelete => {
    try {
      await remove({}, { pathParams: { id: userToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
    setUsers(users.filter(user => user.uuid !== userToDelete.uuid));
  };

  const handleCreate = async userToCreate => {
    try {
      await create(userToCreate);
    } catch (err) {
      alert(`Failed to create user: ${err.message}`);
    }
    setUsers([...users, userToCreate]);
  };

  useEffect(() => {
    if (!loading && data) {
      setUsers(data);
    }
  }, [data]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Users"
        columns={columns}
        data={users}
        editable={{
          onRowUpdate: data => handleUpdate(data),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
        }}
      />
    );
  }
}

function PersonasTab() {
  const [badges, setBadges] = useState(null);
  const [personas, setPersonas] = useState(null);

  const columns = [
    { title: 'UUID', field: 'uuid', hidden: true },
    {
      title: 'Avatar',
      field: 'avatar',
      editable: false,
      render: row => (
        <Link href={`/about/${row.uuid}`} target="_blank" rel="noopener">
          <Avatar src={row.avatar} alt={row.name} />
        </Link>
      ),
    },
    {
      title: 'Name',
      field: 'name',
      editable: 'never',
      render: row => (
        <Link href={`/about/${row.uuid}`} target="_blank" rel="noopener">
          {row.name}
        </Link>
      ),
    },
    {
      title: 'Badges',
      field: 'badges',
      lookup: badges,
      editComponent: props => {
        return (
          <FormControl>
            <Select
              labelId="badges-select-label"
              id="badges-select"
              multiple
              value={props.value ? props.value : []}
              onChange={e => props.onChange(e.target.value)}
              input={<Input id="badges-select-chip" />}
              renderValue={selected => {
                return (
                  <div>
                    {selected.map(value => (
                      <Chip key={value.uuid} label={value.name} />
                    ))}
                  </div>
                );
              }}
            >
              {badgesData.map(badge => {
                const selected = Array.isArray(props.value) ? props.value.find(value => value.uuid === badge.uuid) : undefined;
                if (selected) {
                  return (
                    <MenuItem key={selected.uuid} value={selected} name={selected.name}>
                      {selected.name}
                    </MenuItem>
                  );
                }
                return (
                  <MenuItem key={badge.uuid} value={badge} name={badge.name}>
                    {badge.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        );
      },
      render: row => (
        <>
          {row.badges
            ? row.badges.map(badge => (
                <Chip key={badge.uuid} color="primary" label={badge.name} />
              ))
            : null}
        </>
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
    queryParams: {
      include_images: 'avatar',
    },
  });

  const { data: badgesData, loading: loadingBadges } = useGetBadges({
    resolve: res =>
      res.data.map(badge => {
        const { personas, ...value } = badge;
        return value;
      }),
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

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/personas',
  });

  const handleUpdate = async personaToUpdate => {
    try {
      await update(personaToUpdate, {
        pathParams: { id: personaToUpdate.uuid },
      });
    } catch (err) {
      alert(`Failed to update persona: ${err.message}`);
    }
    const idx = personas.findIndex(persona => persona.uuid === personaToUpdate.uuid);
    personas.splice(idx, 1, personaToUpdate);
    setPersonas(personas);
  };

  const handleRemove = async personaToDelete => {
    try {
      await remove({}, { pathParams: { id: personaToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete persona: ${err.message}`);
    }
    setPersonas(
      personas.filter(persona => persona.uuid !== personaToDelete.uuid),
    );
  };

  const handleCreate = async personaToCreate => {
    try {
      await create(personaToCreate);
    } catch (err) {
      alert(`Failed to create persona: ${err.message}`);
    }
    setPersonas([...personas, personaToCreate]);
  };

  useEffect(() => {
    if (!loadingBadges && badgesData) {
      const lookup = {};
      badgesData.map(badge => {
        lookup[badge.name] = badge.uuid;
      });
      setBadges(lookup);
    }

    if ((!loading, data)) {
      setPersonas(data);
    }
  }, [data, badgesData]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Personas"
        columns={columns}
        data={personas}
        editable={{
          onRowUpdate: newData => handleUpdate(newData),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
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

  const [preprints, setPreprints] = useState(null);

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

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/preprints',
  });

  const handleUpdate = async preprintToUpdate => {
    try {
      await update(preprintToUpdate, {
        pathParams: { id: preprintToUpdate.uuid },
      });
    } catch (err) {
      alert(`Failed to update preprint: ${err.message}`);
    }
    setPreprints([
      ...preprints.filter(preprint => preprint.uuid !== preprintToUpdate.uuid),
      preprintToUpdate,
    ]);
  };

  const handleRemove = async preprintToDelete => {
    try {
      await remove({}, { pathParams: { id: preprintToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete preprint: ${err.message}`);
    }
    setPreprints(
      preprints.filter(preprint => preprint.uuid !== preprintToDelete.uuid),
    );
  };

  const handleCreate = async preprintToCreate => {
    try {
      await create(preprintToCreate);
    } catch (err) {
      alert(`Failed to create preprint: ${err.message}`);
    }
    setPreprints([...preprints, preprintToCreate]);
  };

  useEffect(() => {
    if (!loading && data) {
      setPreprints(data);
    }
  }, [data]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Preprints"
        columns={columns}
        data={preprints}
        editable={{
          onRowUpdate: data => handleUpdate(data),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
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

  const [fulls, setFulls] = useState(null);

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

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/full-reviews',
  });

  const handleUpdate = async fullToUpdate => {
    try {
      await update(fullToUpdate, { pathParams: { id: fullToUpdate.uuid } });
    } catch (err) {
      alert(`Failed to update full-review: ${err.message}`);
    }
    setFulls([
      ...fulls.filter(full => full.uuid !== fullToUpdate.uuid),
      fullToUpdate,
    ]);
  };

  const handleRemove = async fullToDelete => {
    try {
      await remove({}, { pathParams: { id: fullToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete full-review: ${err.message}`);
    }
    setFulls(fulls.filter(full => full.uuid !== fullToDelete.uuid));
  };

  const handleCreate = async fullToCreate => {
    try {
      await create(fullToCreate);
    } catch (err) {
      alert(`Failed to create full-review: ${err.message}`);
    }
    setFulls([...fulls, fullToCreate]);
  };

  useEffect(() => {
    if (!loading && data) {
      setFulls(data);
    }
  }, [data]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Full PREreviews"
        columns={columns}
        data={fulls}
        editable={{
          onRowUpdate: data => handleUpdate(data),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
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

  const [rapids, setRapids] = useState(null);

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

  const { mutate: create } = useMutate({
    verb: 'POST',
    path: '/rapid-reviews',
  });

  const handleUpdate = async rapidToUpdate => {
    try {
      await update(rapidToUpdate, { pathParams: { id: rapidToUpdate.uuid } });
    } catch (err) {
      alert(`Failed to update rapid: ${err.message}`);
    }
    setRapids([
      ...rapids.filter(rapid => rapid.uuid !== rapidToUpdate.uuid),
      rapidToUpdate,
    ]);
  };

  const handleRemove = async rapidToDelete => {
    try {
      await remove({}, { pathParams: { id: rapidToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete rapid: ${err.message}`);
    }
    setRapids(rapids.filter(rapid => rapid.uuid !== rapidToDelete.uuid));
  };

  const handleCreate = async rapidToCreate => {
    try {
      await create(rapidToCreate);
    } catch (err) {
      alert(`Failed to create rapid: ${err.message}`);
    }
    setRapids([...rapids, rapidToCreate]);
  };

  useEffect(() => {
    if (!loading && data) {
      setRapids(data);
    }
  }, [data]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Rapid PREreviews"
        columns={columns}
        data={rapids}
        editable={{
          onRowUpdate: data => handleUpdate(data),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
        }}
      />
    );
  }
}

function CommunitiesTab() {
  const [users, setUsers] = useState(null);
  const [communities, setCommunities] = useState(null);

  const { data: communitiesData, loading } = useGetCommunities({
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

  const handleUpdate = async communityToUpdate => {
    try {
      await update(communityToUpdate, {
        pathParams: { id: communityToUpdate.uuid },
      });
    } catch (err) {
      alert(`Failed to update community: ${err.message}`);
    }
    setCommunities(
      communitiesData.map(comm =>
        comm.uuid === communityToUpdate.uuid
          ? { ...communityToUpdate, owners: processOwners(communityToUpdate) }
          : comm,
      ),
    );
  };

  const handleRemove = async communityToDelete => {
    try {
      await remove({}, { pathParams: { id: communityToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete community: ${err.message}`);
    }
    setCommunities(
      communities.filter(
        community => community.uuid !== communityToDelete.uuid,
      ),
    );
  };

  const handleCreate = async communityToCreate => {
    try {
      await create({
        ...communityToCreate,
        owners: processOwners(communityToCreate),
      });
    } catch (err) {
      alert(`Failed to create community: ${err.message}`);
    }
    setCommunities([...communities, communityToCreate]);
  };

  useEffect(() => {
    if (!loadingUsers && usersData) {
      const lookup = {};
      // the key of the lookup object here needs to be the user uuid
      // because on the backend, community owners are User entities
      usersData.map(user => {
        user.defaultPersona
          ? (lookup[user.uuid] = user.defaultPersona.name)
          : (lookup[user.uuid] = user.orcid);
      });
      // some names will be the user's ORCID if using seed data,
      // because some seed users dont have default personas
      setUsers(lookup);
    }

    if (!loading && communitiesData) {
      setCommunities(communitiesData);
    }
  }, [usersData, communitiesData]);

  // workaround for the different data types
  const processOwners = newData => {
    if (!newData.owners) return [];
    // on the frontend, sometimes the owner of a community is in the shape of a user object,
    // in which case we only need to send back the object's uuid
    if (
      newData.owners &&
      Array.isArray(newData.owners) &&
      newData.owners[0].uuid
    )
      return [newData.owners.uuid];
    // sometimes the owners array is already just a uuid string, so we just return that
    if (newData.owners && Array.isArray(newData.owners)) return newData.owners;
    return [newData.owners];
  };

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
      editComponent: props => {
        return (
          <FormControl>
            <Select
              labelId="owners-select-label"
              id="owners-select"
              multiple
              value={props.value ? props.value : []}
              onChange={e => props.onChange(e.target.value)}
              input={<Input id="owners-select-chip" />}
              renderValue={selected => {
                console.log('***selected***:', selected);
                return (
                  <AvatarGroup max={5}>
                    {selected.map(value => (
                      <Avatar key={value.uuid} src={value.avatar} alt={value.name}>
                        {value.name}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                );
              }}
            >
              {usersData.map(member => {
                if (member.defaultPersona && member.defaultPersona.name) {
                  const selected = Array.isArray(props.value) ? props.value.find(value => value.uuid === member.uuid) : undefined;
                  if (selected) {
                    return (
                      <MenuItem key={selected.uuid} value={selected} name={selected.defaultPersona.name}>
                        {selected.defaultPersona.name}
                      </MenuItem>
                    );
                  }
                  return (
                    <MenuItem key={member.uuid} value={member} name={member.defaultPersona.name}>
                      {member.defaultPersona.name}
                    </MenuItem>
                  );
                }
              })}
            </Select>
          </FormControl>
        );
      },
      render: row => (
        <AvatarGroup max={5}>
          {row.owners && Array.isArray(row.owners)
            ? row.owners.map(owner => (
                <Link
                  key={owner.uuid}
                  href={`/about/${owner.uuid}`}
                  target="_blank"
                  rel="noopener"
                >
                  <Avatar src={owner.defaultPersona.avatar} alt={owner.defaultPersona.name} />
                </Link>
              ))
            : null}
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
        data={communities}
        editable={{
          onRowUpdate: data => handleUpdate(data),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
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

  const [badges, setBadges] = useState(null);

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

  const handleUpdate = async badgeToUpdate => {
    try {
      await update(badgeToUpdate, { pathParams: { id: badgeToUpdate.uuid } });
    } catch (err) {
      alert(`Failed to update badge: ${err.message}`);
    }
    setBadges([
      ...badges.filter(badge => badge.uuid !== badgeToUpdate.uuid),
      badgeToUpdate,
    ]);
  };

  const handleRemove = async badgeToDelete => {
    try {
      await remove({}, { pathParams: { id: badgeToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete badge: ${err.message}`);
    }
    setBadges(badges.filter(badge => badge.uuid !== badgeToDelete.uuid));
  };

  const handleCreate = async badgeToCreate => {
    try {
      await create(badgeToCreate);
    } catch (err) {
      alert(`Failed to create badge: ${err.message}`);
    }
    setBadges([...badges, badgeToCreate]);
  };

  useEffect(() => {
    if (!loading && data) {
      setBadges(data);
    }
  }, [data]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Badges"
        columns={columns}
        data={badges}
        editable={{
          onRowUpdate: data => handleUpdate(data),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
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

  const [tags, setTags] = useState(null);

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

  const handleUpdate = async tagToUpdate => {
    try {
      await update(tagToUpdate, { pathParams: { id: tagToUpdate.uuid } });
    } catch (err) {
      alert(`Failed to update tag: ${err.message}`);
    }
    setTags([
      ...tags.filter(tag => tag.uuid !== tagToUpdate.uuid),
      tagToUpdate,
    ]);
  };

  const handleRemove = async tagToDelete => {
    try {
      await remove({}, { pathParams: { id: tagToDelete.uuid } });
    } catch (err) {
      alert(`Failed to delete tag: ${err.message}`);
    }
    setTags(tags.filter(tag => tag.uuid !== tagToDelete.uuid));
  };

  const handleCreate = async tagToCreate => {
    try {
      await create(tagToCreate);
    } catch (err) {
      alert(`Failed to create tag: ${err.message}`);
    }
    setTags([...tags, tagToCreate]);
  };

  useEffect(() => {
    if (!loading && data) {
      setTags(data);
    }
  }, [data]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <MaterialTable
        title="Tags"
        columns={columns}
        data={tags}
        editable={{
          onRowUpdate: data => handleUpdate(data),
          onRowDelete: data => handleRemove(data),
          onRowAdd: data => handleCreate(data),
        }}
      />
    );
  }
}
