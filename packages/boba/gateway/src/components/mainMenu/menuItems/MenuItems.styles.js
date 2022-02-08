import bobaIcon from 'images/boba2/boba2Icon.svg'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const Nav = styled('nav')(({ theme }) => ({
  width: '100%',
  height: '25px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center', 
  alignItems: 'center', 
  gap: '10px',
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    paddingLeft: '30px',
    backgroundColor: theme.palette.background.default,
  },
  [theme.breakpoints.up('md')]: {
    //paddingTop: '30px',
    //display: 'flex',
    //flexDirection: 'row',
  },
}))

export const MenuItem = styled(Box)(({ selected, theme }) => ({
  color: `${ selected ? theme.palette.secondary.main : "inherit"}`,
  fontSize: '0.8em',
  fontWeight: 'normal',
  cursor: 'pointer',
  height: '22px',
  '&:hover': {
    color: `${theme.palette.secondary.main}`,
  },
  '&:before': {
    'content': '"  "',
    display: 'inline-block', 
    visibility: `${selected ? 'visible': 'hidden'}`, 
    height: '20px',
    width: '20px',
    backgroundImage: `url(${bobaIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }
}))
