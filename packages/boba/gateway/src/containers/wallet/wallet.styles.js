import styled from '@emotion/styled';
import { Box } from "@mui/material"

export const PageContainer = styled(Box)(({ theme }) => ({
  margin: '0px auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  padding: '10px',
  paddingTop: '0px',
  width: '70%',
  [ theme.breakpoints.between('md', 'lg') ]: {
    width: '90%',
    padding: '0px',
  },
  [ theme.breakpoints.between('sm', 'md') ]: {
    width: '90%',
    padding: '0px',
  },
  [ theme.breakpoints.down('sm') ]: {
    width: '100%',
    padding: '0px',
  },

}));

export const PageContent = styled(Box)(({ theme }) => ({
  padding: '10px',
}))

export const PageSwitcher = styled.div`
  padding: 3px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  display: flex;
  width: fit-content;
  border-radius: 12px;
  height: 48px;
  margin-bottom: 20px;
  span {
    padding: 2px 15px;
    font-weight: bold;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    &.active {
      color: #031313;
      background: #BAE21A;
    }
  }
`;
