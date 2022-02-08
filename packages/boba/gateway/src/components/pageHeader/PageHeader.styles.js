import { Box } from "@mui/material"
import { styled } from '@mui/material/styles'

export const HeaderWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '64px',
  gap: '10px',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '20px',
  [ theme.breakpoints.down('md') ]: {
    justifyContent: 'space-between',
    padding: '20px 0',
  }
}))

export const HeaderActionButton = styled(Box)(({ theme }) => ({
  gap: '10px',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
}))

export const DrawerHeader = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px 24px;
`;

export const WrapperCloseIcon = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyleDrawer = styled(Box)`
  background-color: ${(props) => props.theme.palette.mode === 'light' ? 'white' : '#111315'};
  height: 100%;
`;
