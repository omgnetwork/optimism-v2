import { Box } from "@mui/material";
import { styled } from '@mui/material/styles';

export const TokenPageContainer = styled(Box)(({ theme }) => ({
  margin: '0px auto',
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: '20px',
  width: '100%',
  gap: '10px',
  [theme.breakpoints.between('md', 'lg')]: {
    width: '90%',
    padding: '0px',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    width: '90%',
    padding: '0px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: '0px',
  },
}));

export const TokenPageContent = styled(Box)(({theme}) => ({
  width: '100%',
  minHeight: '400px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
  borderRadius: '20px',
  gap: '10px',
  height: 'fit-content',
  background: theme.palette.background.secondary,
}))
