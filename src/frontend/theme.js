import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ff3333',
    },
    secondary: {
      main: '#1472E3',
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
