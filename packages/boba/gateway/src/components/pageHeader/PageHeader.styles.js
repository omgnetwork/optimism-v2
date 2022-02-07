import { Box, Divider, Link } from "@material-ui/core";
import { styled } from '@material-ui/core/styles';


export const HeaderWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '64px',
  gap: '10px',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '20px',
}));
