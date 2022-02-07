import { styled } from '@mui/material/styles'
import { Box, Divider, Link } from "@mui/material"

export const HeaderWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '64px',
  gap: '10px',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: '20px',
}))
