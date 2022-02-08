import { styled } from '@mui/material/styles'
import { Box, Divider, Link } from "@mui/material"

export const Wrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0',
  padding: '0 20px',
  bottom: 0,
  width: '100%',
  height: '184px',
  background: `${theme.palette.mode === 'dark' ? '#1A1D1F' : '#FFFFFF'}`,
  [ theme.breakpoints.down('md') ]: {
    marginTop: 0,
  },
  [ theme.breakpoints.up('md') ]: {
  },
}))


export const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%',
  margin: '30px 0',
  [ theme.breakpoints.down('sm') ]: {
    width: '100%'
  }
}))

export const FooterLink = styled(Link)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  color: theme.palette.text.disabled,
  textDecoration: 'none',
}));

export const FooterLogoWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignSelf: 'flex-start',
  justifyContent: "center",
  alignItems: 'center'
}))

export const FooterDivier = styled(Divider)(({ theme }) => ({
  background: `${ theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(3, 19, 19, 0.04)'}`,
  boxSizing: 'border-box',
  boxShadow: `${ theme.palette.mode === 'dark' ? '0px 4px 4px rgba(0, 0, 0, 0.25)' : 'none'}`,
  width: '100%'
}))

export const FooterLinkWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignSelf: 'flex-start',
  justifyContent: 'space-around',
  alignItems: 'center',
  width: '100%',
  margin: '20px 0',
}))

export const LinkWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '40%',
  justifyContent: 'flex-start',
  [ theme.breakpoints.down('sm') ]: {
    width: '100%'
  }
}))

export const SocialWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '20%',
  justifyContent: 'flex-end',
  gap: '10px',
  [ theme.breakpoints.down('sm') ]: {
    width: '100%'
  }
}))
