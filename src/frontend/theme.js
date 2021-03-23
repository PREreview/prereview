import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#F77463',
      main: '#FF3333',
      contrastText: '#FFF',
    },
    secondary: {
      light: '#D2D1CE',
      main: '#767676',
      dark: '#393E41',
      contrastText: '#000',
    },
    community: {
      light: '#FFFAEE',
      main: '#FBE890',
      dark: '#F7CB15',
      contrastText: '#000',
    },
    resource: {
      main: '#54948E',
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
    lineHeight: 1.2,
    color: '#000',
    fontFamily: ['Open Sans', 'sans-serif'],
  },
});

export default theme;
