import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  overrides: {
    MuiDialog: {
      paper: {
        borderRadius: 50,
        padding: 40,
        position: 'relative',
      },
    },
    MuiLink: {
      root: {
        color: '#FF3333',
        fontFamily: ['Open Sans', 'sans-serif'],
      },
    },
  },
  palette: {
    primary: {
      light: '#F77463',
      main: '#FF3333',
      dark: '#BB1E1E',
      contrastText: '#FFF',
    },
    secondary: {
      light: '#D2D1CE',
      main: '#767676',
      dark: '#393E41',
      contrastText: '#000',
    },
    community: {
      main: '#FCBD4C',
      dark: '#C18A27',
      contrastText: '#000',
    },
    reviews: {
      main: '#197CF4',
    },
    section: {
      light: '#FFFAEE',
      main: '#FBE890',
      dark: '#AF9F55',
    },
    resource: {
      main: '#54948E',
      dark: '#08564F',
      contrastText: '#FFF',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  typography: {
    color: '#000',
    fontFamily: ['Open Sans', 'sans-serif'],
    lineHeight: 1.2,
    h1: {
      fontSize: '2.6rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2.2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.9rem',
      fontWeight: 400,
      letterSpacing: 0.7,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1.2rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      whiteSpace: 'pre-wrap',
    },
    body2: {
      fontSize: '1.2rem',
      fontWeight: 400,
      whiteSpace: 'pre-wrap',
    },
    button: {
      fontSize: '1.25rem',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
});

export default theme;
