import { styled } from '@mui/material/styles'
import { Box, Grid } from '@mui/material'

export const Wrapper = styled(Box)(({ theme, ...props }) => ({
  borderBottom: theme.palette.mode === 'light' ? '1px solid #c3c5c7' : '1px solid #192537',
  borderRadius: '0',
  background: theme.palette.background.secondary,
  [theme.breakpoints.down('md')]: {
    //padding: '30px 10px',
    background: '#1A1D1F',
    borderRadius: '20px',
    padding: '20px',
  },
  [theme.breakpoints.up('md')]: {
    padding: '10px',
  },
}));

export const GridContainer = styled(Grid)(({theme})=>({
  [theme.breakpoints.down('md')]:{
    justifyContent: 'flex-start'
  }
}))

export const GridItemTag = styled(Grid)(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',
  [ theme.breakpoints.down('md') ]: {
    flexDirection: 'column',
    padding: `${props.xs === 12 ? '20px 0px 0px': 'inherit'}`
  }
}))

export const DropdownWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  width: 100%;
  padding: 6px;
  margin-top: 10px;
  border-radius: 4px;
  text-align: center;
`;

export const DropdownContent = styled(Box)(({ theme }) => ({
  width: '70%',
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  borderRadius: '20px',
  margin: '5px',
  padding: '20px 40px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: '5px',
    padding: '5px',
    width: '100%',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    gap: '16px',
  },
}));
