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


export const WalletTitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '20px',
  [ theme.breakpoints.down('md') ]: {
    margin: '10px 0px'
  }
}));

export const PageSwitcher = styled(Box)(({ theme }) => ({
  width: 'fit-content',
  padding: '3px',
  background: 'rgba(255, 255, 255, 0.04)',
  cursor: 'pointer',
  display: 'flex',
  borderRadius: '12px',
  height: '48px',
  marginBottom: '20px',
  'span': {
    padding: '2px 15px',
    fontWeight: 'bold',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&.active': {
      color: '#031313',
      background: '#BAE21A',
    }
  },
  [ theme.breakpoints.down('sm') ]: {
    width: '100%',
    padding: '0px',
    'span': {
      width: '50%'
    }
  },

}));
