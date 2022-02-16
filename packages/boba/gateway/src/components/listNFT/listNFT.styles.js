import { Grid } from "@mui/material";
import { styled } from '@mui/material/styles';


export const ListNFTItem = styled(Grid)(({ theme }) => ({
  borderRadius: '20px',
  maxWidth: '180px',
  margin: '10px',
  background: theme.palette.background.secondary,
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: '160px',
    margin: '10px auto',
    'p': {
      whiteSpace: 'normal',
    }
  },
}));
